# main.py

from fastapi import FastAPI, Query, HTTPException
import requests

app = FastAPI(
    title="NASA GeneLab Beginner Explorer",
    description="Search, view metadata, and download study files from NASA GeneLab OSDR",
    version="1.0"
)

# Base URLs for NASA OSDR APIs
SEARCH_API_URL = "https://osdr.nasa.gov/osdr/data/search"
METADATA_API_URL = "https://osdr.nasa.gov/osdr/data/osd/meta"
FILES_API_URL = "https://osdr.nasa.gov/osdr/data/osd/files"


# -----------------------------
# 1️⃣ Search Endpoint
# -----------------------------
@app.get("/search")
def search_studies(
    term: str = Query(..., description="Keyword to search studies"),
    from_page: int = Query(0, description="Starting page number"),
    size: int = Query(10, description="Number of results per page"),
    organism: str = Query(None, description="Filter by organism"),
    assay_type: str = Query(None, description="Filter by assay type"),
    mission: str = Query(None, description="Filter by mission")
):
    """
    Search GeneLab studies by keyword with optional beginner-friendly filters.
    Returns only OSD_ID results.
    """
    params = {
        "term": term,
        "from": from_page,
        "size": size,
        "type": "cgene"  # ensures only GeneLab studies
    }

    if organism:
        params["ffield"] = "organism"
        params["fvalue"] = organism
    if assay_type:
        params["ffield"] = "Study Assay Technology Type"
        params["fvalue"] = assay_type
    if mission:
        params["ffield"] = "Flight Program"
        params["fvalue"] = mission

    response = requests.get(SEARCH_API_URL, params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="NASA Search API error")

    data = response.json()
    results = []

    for hit in data.get("hits", {}).get("hits", []):
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
    # Remove 'OSD-' prefix if user added it
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
    # Remove 'OSD-' prefix if user added it
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
        f["download_url"] = "https://osdr.nasa.gov" + f.get("remote_url", "")

    return {
        "study_id": study_key,
        "file_count": studies[study_key].get("file_count", 0),
        "files": study_files
    }
