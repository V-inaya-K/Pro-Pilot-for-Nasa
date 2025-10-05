
from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from pathlib import Path
from datetime import datetime, timezone
import uuid, os, io, logging
import PyPDF2, requests
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from groq import Groq
from dotenv import load_dotenv

# ---------------- Load environment ----------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set in .env")

client_llm = Groq(api_key=GROQ_API_KEY)
print("Groq API key loaded:", GROQ_API_KEY is not None)

# ---------------- MongoDB setup ----------------
mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "propilot")
client_db = AsyncIOMotorClient(mongo_url)
db = client_db[db_name]

# ---------------- NASA OSDR API ----------------
SEARCH_API_URL = "https://osdr.nasa.gov/osdr/data/search"
METADATA_API_URL = "https://osdr.nasa.gov/osdr/data/osd/meta"

# ---------------- FastAPI setup ----------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("SERVER RUNNING SUCCESSFULLY 🚀")
    try:
        yield
    finally:
        client_db.close()

app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Logging ----------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------------- Models ----------------
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    interests: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: str
    interests: List[str] = []

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # reference to users.id
    filename: str
    content: str
    summary: str = ""
    summary_hindi: str = ""
    summary_punjabi: str = ""
    doi_link: Optional[str] = None
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    file_type: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    user_id: str
    question: str
    answer: str
    language: str = "english"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    document_id: str
    user_id: str
    question: str
    language: str = "english"
    tone: str = "professional"

# ---------------- Helpers ----------------
def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting PDF: {str(e)}")

MAX_CHARS = 4000
def chunk_text(text: str, max_chars: int = MAX_CHARS):
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + max_chars])
        start += max_chars
    return chunks

async def generate_summary(content: str, language: str = "english", tone: str = "professional") -> str:
    base_prompts = {
        "english": "Summarize the following scientific research paper in {style} English.",
        "hindi": "इस वैज्ञानिक शोध पत्र का सारांश {style} हिंदी में प्रस्तुत करें।",
        "punjabi": "ਇਸ ਵਿਗਿਆਨਕ ਰਿਸਰਚ ਪੇਪਰ ਦਾ ਸਾਰ {style} ਪੰਜਾਬੀ ਵਿੱਚ ਪੇਸ਼ ਕਰੋ।"
    }
    tone_map = {
        "professional": "clear, professional",
        "friendly": "friendly and approachable",
        "casual": "casual and simple"
    }
    style = tone_map.get(tone, "clear, professional")
    prompt_template = base_prompts.get(language, base_prompts["english"])

    chunks = chunk_text(content)
    summaries = []

    for chunk in chunks:
        prompt = prompt_template.format(style=style) + "\n\n" + chunk
        try:
            completion = client_llm.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_completion_tokens=1024
            )
            if completion.choices:
                summaries.append(completion.choices[0].message.content)
            else:
                summaries.append("No summary generated.")
        except Exception as e:
            logger.exception("Error generating summary with Groq")
            summaries.append(f"Error: {str(e)}")

    return "\n".join(summaries)

async def get_answer(document_content: str, question: str, previous_chats: List[ChatMessage] = None,
                     language: str = "english", tone: str = "professional") -> str:
    tone_map = {
        "professional": "clear, professional",
        "friendly": "friendly and approachable",
        "casual": "casual and simple"
    }
    style = tone_map.get(tone, "clear, professional")

    messages = []
    if previous_chats:
        for chat in previous_chats:
            messages.append({"role": "user", "content": chat.question})
            messages.append({"role": "assistant", "content": chat.answer})

    messages.append({"role": "user", "content": f"Based on the following research paper, answer in {style} {language}: {question}\n\n{document_content}"})

    try:
        completion = client_llm.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_completion_tokens=1024
        )
        if completion.choices:
            return completion.choices[0].message.content
        return "No answer generated."
    except Exception as e:
        logger.exception("Error getting answer from Groq")
        return f"Error getting answer: {str(e)}"

# ---------------- API Routes ----------------

# 1) Users
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        if user_data.interests:
            await db.users.update_one({"email": user_data.email}, {"$set": {"interests": user_data.interests}})
        return User(**existing)
    user_obj = User(email=user_data.email, **({"interests": user_data.interests} if user_data.interests else {}))
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{email}", response_model=User)
async def get_user(email: str):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# 2) Search studies
@api_router.get("/search")
async def search_studies(term: str = Query(...), from_page: int = Query(0), size: int = Query(50)):
    params = {"term": term, "from": from_page, "size": size, "type": "cgene"}
    try:
        resp = requests.get(SEARCH_API_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        results = []
        for hit in data.get("hits", {}).get("hits", []):
            study = hit.get("_source", {})
            results.append({
                "OSD_ID": study.get("Study Identifier") or study.get("Accession"),
                "title": study.get("Study Title"),
                "description": study.get("Study Description")
            })
        total = data.get("hits", {}).get("total", 0)
        return {"total_hits": total, "results": results}
    except requests.exceptions.RequestException as e:
        logger.warning(f"NASA Search API error: {e} — returning mock results")
        mock = [
            {"OSD_ID": "MOCK-OSD-1", "title": "Space Nutrition Study (mock)", "description": "Mock description: nutrition in microgravity."},
            {"OSD_ID": "MOCK-OSD-2", "title": "Microgravity Muscle Effects (mock)", "description": "Mock description: musculoskeletal changes."},
            {"OSD_ID": "MOCK-OSD-3", "title": "Astrobiology Discoveries (mock)", "description": "Mock description: extremophiles and biosignatures."}
        ]
        return {"total_hits": len(mock), "results": mock}

# 3) Metadata
@api_router.get("/metadata/{osd_id}")
async def get_metadata(osd_id: str, lang: str = Query("english", regex="^(english|hindi|punjabi)$")):
    if osd_id.upper().startswith("OSD-"):
        osd_id = osd_id.split("-", 1)[1]

    try:
        resp = requests.get(f"{METADATA_API_URL}/{osd_id}", timeout=15)
        resp.raise_for_status()
        data = resp.json()
        study_container = data.get("study", {})
        study_key = f"OSD-{osd_id}"
        study_data = study_container.get(study_key, {}) if study_container else {}
        study_main = study_data.get("studies", [{}])[0] if isinstance(study_data, dict) else {}

        description = study_main.get("description") or study_main.get("Study Description") or study_main.get("summary") or ""

        # Translate if not English
        if lang != "english" and description:
            translation_prompt = {
                "hindi": f"Translate the following text into Hindi:\n\n{description}",
                "punjabi": f"Translate the following text into Punjabi:\n\n{description}"
            }
            try:
                completion = client_llm.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[{"role": "user", "content": translation_prompt[lang]}],
                    temperature=0.7,
                    max_completion_tokens=1024
                )
                if completion.choices:
                    description = completion.choices[0].message.content
            except Exception as e:
                logger.warning(f"Error translating metadata to {lang}: {e}")

        # Add dummy DOI if none exists
        doi_link = study_main.get("doi") or study_main.get("DOI") or "https://www.mdpi.com/1422-0067/18/8/1763"

        response_payload = {
            "OSD_ID": osd_id,
            "title": study_main.get("title") or study_data.get("title"),
            "description": description,
            "assays": list(study_data.get("additionalInformation", {}).get("assays", {}).keys()) if isinstance(study_data.get("additionalInformation", {}), dict) else [],
            "submission_date": study_main.get("submissionDate"),
            "doi_link": doi_link,
            "public_release_date": study_main.get("publicReleaseDate")
        }
        return response_payload

    except requests.exceptions.RequestException as e:
        logger.error(f"NASA Metadata API error: {e}")
        raise HTTPException(status_code=500, detail="NASA Metadata API error")
    except Exception as e:
        logger.exception("Unexpected error in metadata endpoint")
        raise HTTPException(status_code=500, detail=str(e))

# 4) Upload document
@api_router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    tone: str = Form("professional"),
    doi_link: Optional[str] = Form(None)
):
    # Validate user
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    content = await file.read()
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    text_content = extract_text_from_pdf(content)
    if not text_content.strip():
        raise HTTPException(status_code=400, detail="No text extracted")

    summary_en = await generate_summary(text_content, "english", tone)
    summary_hi = await generate_summary(text_content, "hindi", tone)
    summary_pa = await generate_summary(text_content, "punjabi", tone)

    document = Document(
        user_id=user_id,
        filename=file.filename,
        content=text_content,
        summary=summary_en,
        summary_hindi=summary_hi,
        summary_punjabi=summary_pa,
        doi_link=doi_link,
        file_type="pdf"
    )
    await db.documents.insert_one(document.dict())

    return {
        "document_id": document.id,
        "message": "Document uploaded and summarized",
        "summary": {"english": summary_en, "hindi": summary_hi, "punjabi": summary_pa},
        "doi_link": doi_link
    }

# 5) Documents endpoints
@api_router.get("/documents/{user_id}", response_model=List[Document])
async def get_user_documents(user_id: str):
    docs = await db.documents.find({"user_id": user_id}).to_list(length=None)
    return [Document(**doc) for doc in docs]

@api_router.get("/documents/detail/{document_id}", response_model=Document)
async def get_document(document_id: str):
    doc = await db.documents.find_one({"id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return Document(**doc)

@api_router.post("/chat", response_model=ChatMessage)
async def ask_question(chat_request: ChatRequest):
    """
    Handles chat queries for both uploaded and external NASA research documents.
    Uses the document summary (or fetches and generates it if missing).
    """
    # Try to find document in DB
    document = await db.documents.find_one({"id": chat_request.document_id})

    if not document:
        osd_id = chat_request.document_id  # Assuming this might be an OSD_ID (e.g., OSD-1234)
        logger.info(f"📡 Document {osd_id} not found — attempting to fetch from NASA OSDR API")

        try:
            # Fetch metadata from NASA
            resp = requests.get(f"{METADATA_API_URL}/{osd_id.replace('OSD-', '')}", timeout=15)
            resp.raise_for_status()
            data = resp.json()
            study_container = data.get("study", {})
            study_key = f"OSD-{osd_id.replace('OSD-', '')}"
            study_data = study_container.get(study_key, {})
            study_main = study_data.get("studies", [{}])[0] if isinstance(study_data, dict) else {}

            title = study_main.get("title") or study_data.get("title") or f"NASA Study {osd_id}"
            description = (
                study_main.get("description")
                or study_main.get("Study Description")
                or study_main.get("summary")
                or "No description found."
            )
            doi_link = (
                study_main.get("doi")
                or study_main.get("DOI")
                or "https://osdr.nasa.gov/"
            )

            # 🧠 Generate summaries using Groq
            summary_en = await generate_summary(description, "english")
            summary_hi = await generate_summary(description, "hindi")
            summary_pa = await generate_summary(description, "punjabi")

            # 💾 Save into DB
            new_doc = Document(
                id=osd_id,  # Use NASA OSD_ID as document ID
                user_id=chat_request.user_id,
                filename=f"{title}.nasa",
                content=description,
                summary=summary_en,
                summary_hindi=summary_hi,
                summary_punjabi=summary_pa,
                doi_link=doi_link,
                file_type="nasa"
            )
            await db.documents.insert_one(new_doc.dict())
            document = new_doc.dict()
            logger.info(f"✅ Saved new NASA document: {osd_id}")

        except Exception as e:
            logger.error(f"❌ Failed to fetch NASA study for {osd_id}: {e}")
            raise HTTPException(status_code=404, detail=f"Could not fetch NASA study: {str(e)}")

    # --- Pick summary in correct language ---
    language = chat_request.language
    if language == "hindi":
        document_summary = document.get("summary_hindi") or document.get("summary")
    elif language == "punjabi":
        document_summary = document.get("summary_punjabi") or document.get("summary")
    else:
        document_summary = document.get("summary")

    if not document_summary:
        document_summary = document.get("content", "")[:4000]

    # --- Previous chats for context ---
    prev_msgs_data = await db.chat_messages.find({
        "document_id": chat_request.document_id,
        "user_id": chat_request.user_id
    }).sort("timestamp", 1).to_list(length=None)
    prev_msgs = [ChatMessage(**m) for m in prev_msgs_data]

    # --- Generate answer using LLM ---
    answer = await get_answer(
        document_summary,
        chat_request.question,
        prev_msgs,
        chat_request.language,
        chat_request.tone
    )

    # --- Save chat message ---
    chat_message = ChatMessage(
        document_id=chat_request.document_id,
        user_id=chat_request.user_id,
        question=chat_request.question,
        answer=answer,
        language=chat_request.language
    )
    await db.chat_messages.insert_one(chat_message.dict())

    return chat_message


@api_router.get("/chat/{document_id}/{user_id}", response_model=List[ChatMessage])
async def get_chat_history(document_id: str, user_id: str):
    msgs = await db.chat_messages.find({"document_id": document_id, "user_id": user_id}).sort("timestamp", 1).to_list(length=None)
    return [ChatMessage(**msg) for msg in msgs]

# ---------------- Include router ----------------
app.include_router(api_router)

# ---------------- Entrypoint ----------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
