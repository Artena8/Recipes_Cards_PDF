from __future__ import annotations
import json
from typing import Annotated

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from pdf_service import generate_cards_pdf

app = FastAPI(title="Cards Recipes Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/generate")
async def generate(
    recipes: Annotated[str, Form(...)],
    images: Annotated[list[UploadFile], File(...)],
    collection_name: Annotated[str, Form()] = "",
):
    try:
        recipes_data = json.loads(recipes)
    except Exception:
        return JSONResponse(
            status_code=400,
            content={"detail": "recipes doit être un JSON valide (liste de 8 objets)."},
        )

    imgs: list[tuple[str, bytes]] = []
    for f in images:
        imgs.append((f.filename or "image.png", await f.read()))

    pdf_path = generate_cards_pdf(recipes_data, imgs, collection_name=collection_name)

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=pdf_path.name,
    )
