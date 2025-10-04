# # main.py

# from fastapi import FastAPI, Query, HTTPException
# from pydantic import BaseModel
# from typing import Optional
# import requests
# import os
# from dotenv import load_dotenv
# import google.generativeai as genai  # Gemini AI SDK

# # -----------------------------
# # Load environment variables
# # -----------------------------
# ROOT = os.path.dirname(__file__)
# load_dotenv(os.path.join(ROOT, ".env"))

# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# if not GOOGLE_API_KEY:
#     raise RuntimeError("Set GOOGLE_API_KEY in environment or .env before running.")

# genai.configure(api_key=GOOGLE_API_KEY)

# # -----------------------------
# # FastAPI app initialization
# # -----------------------------
# app = FastAPI(
#     title="NASA GeneLab Beginner Explorer with Gemini Chat",
#     description="Search, view metadata, download study files from NASA GeneLab OSDR and ask study questions via Gemini AI",
#     version="1.0"
# )

# # -----------------------------
# # Base URLs for NASA OSDR APIs
# # -----------------------------
# SEARCH_API_URL = "https://osdr.nasa.gov/osdr/data/search"
# METADATA_API_URL = "https://osdr.nasa.gov/osdr/data/osd/meta"
# FILES_API_URL = "https://osdr.nasa.gov/osdr/data/osd/files"
# OSDR_BASE = "https://osdr.nasa.gov"

# # -----------------------------
# # Data models
# # -----------------------------
# class ChatRequest(BaseModel):
#     study_id: str
#     question: str
#     user_id: Optional[str] = None
#     language: Optional[str] = "english"
#     tone: Optional[str] = "professional"

# # -----------------------------
# # 1️⃣ Search Endpoint
# # -----------------------------
# @app.get("/search")
# def search_studies(
#     term: str = Query(..., description="Keyword to search studies"),
#     from_page: int = Query(0, description="Starting page number"),
#     size: int = Query(10, description="Number of results per page"),
#     organism: str = Query(None, description="Filter by organism"),
#     assay_type: str = Query(None, description="Filter by assay type"),
#     mission: str = Query(None, description="Filter by mission")
# ):
#     """
#     Search GeneLab studies by keyword with optional beginner-friendly filters.
#     Returns only OSD_ID (cgene) results.
#     """
#     params = {
#         "term": term,
#         "from": from_page,
#         "size": size,
#         "type": "cgene"  # only GeneLab studies
#     }

#     # Optional filters
#     if organism:
#         params["ffield"] = "organism"
#         params["fvalue"] = organism
#     if assay_type:
#         params["ffield"] = "Study Assay Technology Type"
#         params["fvalue"] = assay_type
#     if mission:
#         params["ffield"] = "Flight Program"
#         params["fvalue"] = mission

#     response = requests.get(SEARCH_API_URL, params=params)
#     if response.status_code != 200:
#         raise HTTPException(status_code=500, detail="NASA Search API error")

#     data = response.json()
#     results = []
#     for hit in data.get("hits", {}).get("hits", []):
#         study = hit.get("_source", {})
#         results.append({
#             "OSD_ID": study.get("Study Identifier") or study.get("Accession"),
#             "title": study.get("Study Title"),
#             "description": study.get("Study Description")
#         })

#     return {"total_hits": data.get("hits", {}).get("total", 0), "results": results}

# # -----------------------------
# # 2️⃣ Metadata Endpoint
# # -----------------------------
# @app.get("/metadata/{osd_id}")
# def get_metadata(osd_id: str):
#     """
#     Return metadata for a given study (OSD_ID)
#     Includes description, assays, key publications, and project/mission links
#     """
#     if osd_id.upper().startswith("OSD-"):
#         osd_id = osd_id.split("-")[1]

#     url = f"{METADATA_API_URL}/{osd_id}"
#     response = requests.get(url)
#     if response.status_code != 200:
#         raise HTTPException(status_code=404, detail="Study metadata not found")

#     data = response.json()
#     study_data = data.get("study", {}).get(f"OSD-{osd_id}", {})
#     if not study_data:
#         raise HTTPException(status_code=404, detail="Study metadata missing")

#     studies_list = study_data.get("studies", [])
#     study_main = studies_list[0] if studies_list else {}

#     # Extract comments for links
#     project_link = mission_link = None
#     for comment in study_main.get("comments", []):
#         if comment.get("name") == "Project Link":
#             project_link = comment.get("value")
#         if comment.get("name") == "Mission Link":
#             mission_link = comment.get("value")

#     # Extract publications
#     publications = []
#     for pub in study_main.get("publications", []):
#         publications.append({
#             "title": pub.get("title"),
#             "doi": pub.get("doi"),
#             "pubmed_id": pub.get("pubMedID"),
#             "authors": pub.get("authorList")
#         })

#     metadata = {
#         "OSD_ID": osd_id,
#         "title": study_main.get("title"),
#         "description": study_main.get("description"),
#         "assays": list(study_data.get("additionalInformation", {}).get("assays", {}).keys()),
#         "publications": publications,
#         "project_link": project_link,
#         "mission_link": mission_link,
#         "submission_date": study_main.get("submissionDate"),
#         "public_release_date": study_main.get("publicReleaseDate")
#     }
#     return metadata

# # -----------------------------
# # 3️⃣ Files Endpoint
# # -----------------------------
# @app.get("/files/{osd_id}")
# def get_study_files(osd_id: str, page: int = 0, size: int = 25, all_files: bool = True):
#     """
#     Fetch study files for a given OSD study ID.
#     """
#     if osd_id.upper().startswith("OSD-"):
#         osd_id = osd_id.split("-")[1]

#     params = {
#         "page": page,
#         "size": size,
#         "all_files": str(all_files).lower()
#     }

#     url = f"{FILES_API_URL}/{osd_id}/"
#     response = requests.get(url, params=params)
#     if response.status_code != 200:
#         raise HTTPException(status_code=response.status_code, detail="OSDR API error")

#     data = response.json()
#     studies = data.get("studies", {})
#     study_key = f"OSD-{osd_id}"
#     if study_key not in studies:
#         raise HTTPException(status_code=404, detail=f"No files found for study {study_key}")

#     study_files = studies[study_key].get("study_files", [])
#     for f in study_files:
#         f["download_url"] = OSDR_BASE + f.get("remote_url", "")

#     return {
#         "study_id": study_key,
#         "file_count": studies[study_key].get("file_count", 0),
#         "files": study_files
#     }

# # -----------------------------
# # 4️⃣ Gemini Chat Endpoint
# # -----------------------------
# @app.post("/chat")
# def chat_with_study(request: ChatRequest):
#     """
#     Ask a question about a study using Gemini AI
#     """
#     study_id = request.study_id.upper()
#     if study_id.startswith("OSD-"):
#         study_id = study_id.split("-")[1]

#     # Build the prompt for Gemini
#     prompt = f"""
#     You are a space biology assistant. Answer the following question about study OSD-{study_id}:
#     Question: {request.question}
#     Respond in {request.language} and tone {request.tone}.
#     """

#     try:
#         response = genai.chat.create(
#             model="gemini-1.5",  # or whichever Gemini model
#             messages=[{"role": "user", "content": prompt}]
#         )
#         answer = response["content"][0]["text"]  # extract text from Gemini response
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

#     return {"study_id": study_id, "question": request.question, "answer": answer}

# -----------
# main.py

from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from typing import Optional
import requests
import os
from dotenv import load_dotenv
import google.generativeai as genai  # Gemini AI SDK

# -----------------------------
# Load environment variables
# -----------------------------
ROOT = os.path.dirname(__file__)
load_dotenv(os.path.join(ROOT, ".env"))

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("Set GOOGLE_API_KEY in environment or .env before running.")

genai.configure(api_key=GOOGLE_API_KEY)

# -----------------------------
# FastAPI app initialization
# -----------------------------
app = FastAPI(
    title="NASA GeneLab Beginner Explorer with Gemini Chat",
    description="Search, view metadata, download study files from NASA GeneLab OSDR and ask study questions via Gemini AI",
    version="1.0"
)

# -----------------------------
# Base URLs for NASA OSDR APIs
# -----------------------------
SEARCH_API_URL = "https://osdr.nasa.gov/osdr/data/search"
METADATA_API_URL = "https://osdr.nasa.gov/osdr/data/osd/meta"
FILES_API_URL = "https://osdr.nasa.gov/osdr/data/osd/files"
OSDR_BASE = "https://osdr.nasa.gov"

# -----------------------------
# Data models
# -----------------------------
class ChatRequest(BaseModel):
    study_id: str
    question: str
    user_id: Optional[str] = None
    language: Optional[str] = "english"
    tone: Optional[str] = "professional"

# -----------------------------
# 1️⃣ Search Endpoint
# -----------------------------
@app.get("/search")
def search_studies(
    term: str = Query(..., description="Keyword to search studies"),
    from_page: int = Query(0, description="Starting page number"),
    size: int = Query(10, description="Number of results per page"),
    organism: Optional[str] = Query(None, description="Filter by organism"),
    assay_type: Optional[str] = Query(None, description="Filter by assay type"),
    mission: Optional[str] = Query(None, description="Filter by mission")
):
    """
    Search GeneLab studies by keyword with optional beginner-friendly filters.
    Returns only OSD_ID (cgene) results.
    """
    params = {
        "term": term,
        "from": from_page,  # NASA API expects 'from'
        "size": size,
        "type": "cgene"
    }

    # Only one filter at a time (OSDR API limitation)
    if organism:
        params["ffield"] = "organism"
        params["fvalue"] = organism
    elif assay_type:
        params["ffield"] = "Study Assay Technology Type"
        params["fvalue"] = assay_type
    elif mission:
        params["ffield"] = "Flight Program"
        params["fvalue"] = mission

    try:
        response = requests.get(SEARCH_API_URL, params=params, timeout=10)
        response.raise_for_status()
        try:
            data = response.json()
        except ValueError:
            print("Malformed JSON from NASA API:", response.text)
            raise HTTPException(status_code=502, detail="NASA API returned invalid JSON")
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"NASA Search API error: {str(e)}")

    results = []
    hits = data.get("hits", {}).get("hits", [])
    for hit in hits:
        study = hit.get("_source", {})
        results.append({
            "OSD_ID": study.get("Study Identifier") or study.get("Accession"),
            "title": study.get("Study Title"),
            "description": study.get("Study Description")
        })

    return {"total_hits": data.get("hits", {}).get("total", 0), "results": results}

# -----------------------------
# 2️⃣ Metadata Endpoint
# -----------------------------
@app.get("/metadata/{osd_id}")
def get_metadata(osd_id: str):
    """
    Return metadata for a given study (OSD_ID)
    Includes description, assays, key publications, and project/mission links
    """
    if osd_id.upper().startswith("OSD-"):
        osd_id = osd_id.split("-")[1]

    url = f"{METADATA_API_URL}/{osd_id}"
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Study metadata not found")

    data = response.json()
    study_data = data.get("study", {}).get(f"OSD-{osd_id}", {})
    if not study_data:
        raise HTTPException(status_code=404, detail="Study metadata missing")

    studies_list = study_data.get("studies", [])
    study_main = studies_list[0] if studies_list else {}

    # Extract comments for links
    project_link = mission_link = None
    for comment in study_main.get("comments", []):
        if comment.get("name") == "Project Link":
            project_link = comment.get("value")
        if comment.get("name") == "Mission Link":
            mission_link = comment.get("value")

    # Extract publications
    publications = []
    for pub in study_main.get("publications", []):
        publications.append({
            "title": pub.get("title"),
            "doi": pub.get("doi"),
            "pubmed_id": pub.get("pubMedID"),
            "authors": pub.get("authorList")
        })

    metadata = {
        "OSD_ID": osd_id,
        "title": study_main.get("title"),
        "description": study_main.get("description"),
        "assays": list(study_data.get("additionalInformation", {}).get("assays", {}).keys()),
        "publications": publications,
        "project_link": project_link,
        "mission_link": mission_link,
        "submission_date": study_main.get("submissionDate"),
        "public_release_date": study_main.get("publicReleaseDate")
    }
    return metadata

# -----------------------------
# 3️⃣ Files Endpoint
# -----------------------------
@app.get("/files/{osd_id}")
def get_study_files(osd_id: str, page: int = 0, size: int = 25, all_files: bool = True):
    """
    Fetch study files for a given OSD study ID.
    """
    if osd_id.upper().startswith("OSD-"):
        osd_id = osd_id.split("-")[1]

    params = {
        "page": page,
        "size": size,
        "all_files": str(all_files).lower()
    }

    url = f"{FILES_API_URL}/{osd_id}/"
    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="OSDR API error")

    data = response.json()
    studies = data.get("studies", {})
    study_key = f"OSD-{osd_id}"
    if study_key not in studies:
        raise HTTPException(status_code=404, detail=f"No files found for study {study_key}")

    study_files = studies[study_key].get("study_files", [])
    for f in study_files:
        f["download_url"] = OSDR_BASE + f.get("remote_url", "")

    return {
        "study_id": study_key,
        "file_count": studies[study_key].get("file_count", 0),
        "files": study_files
    }

# -----------------------------
# 4️⃣ Gemini Chat Endpoint
# -----------------------------
@app.post("/chat")
def chat_with_study(request: ChatRequest):
    """
    Ask a question about a study using Gemini AI
    """
    study_id = request.study_id.upper()
    if study_id.startswith("OSD-"):
        study_id = study_id.split("-")[1]

    prompt = f"""
    You are a space biology assistant. Answer the following question about study OSD-{study_id}:
    Question: {request.question}
    Respond in {request.language} and tone {request.tone}.
    """

    try:
        response = genai.chat.create(
            model="gemini-1.5",
            messages=[{"role": "user", "content": prompt}]
        )
        answer = response["content"][0]["text"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

    return {"study_id": study_id, "question": request.question, "answer": answer}
