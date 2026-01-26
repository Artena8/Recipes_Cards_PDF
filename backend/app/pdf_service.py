from __future__ import annotations
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException

from config import IMPORTS_DIR, EXPORTS_DIR, QRCODES_DIR
from qr import generate_qr
from pdf import generate_pdf

REQUIRED_KEYS = ["Collection", "Titre", "Temps", "URL", "Régime", "Saison", "Allergènes", "Image"]

def validate_recipes(recipes: list[dict]) -> None:
    if not isinstance(recipes, list) or len(recipes) != 8:
        raise HTTPException(status_code=400, detail="recipes doit contenir exactement 8 recettes.")
    for idx, r in enumerate(recipes, start=1):
        if not isinstance(r, dict):
            raise HTTPException(status_code=400, detail=f"Recette {idx} invalide (pas un objet).")
        missing = [k for k in REQUIRED_KEYS if k not in r]
        if missing:
            raise HTTPException(status_code=400, detail=f"Recette {idx}: champs manquants {missing}.")

def generate_cards_pdf(
    recipes: list[dict],
    images: list[tuple[str, bytes]],
    collection_name: str | None = None,
) -> Path:
    validate_recipes(recipes)
    if len(images) != 8:
        raise HTTPException(status_code=400, detail="Il faut exactement 8 images.")

    job_id = uuid4().hex[:10]
    img_folder = job_id

    imports_job_dir = IMPORTS_DIR / img_folder
    imports_job_dir.mkdir(parents=True, exist_ok=True)

    # sauvegarde images dans imports/<job_id>/ et force les noms (01.webp, 02.webp, etc.)
    for i, (orig_name, content) in enumerate(images):
        ext = Path(orig_name).suffix or ".png"
        filename = f"{i+1:02d}{ext}"
        (imports_job_dir / filename).write_bytes(content)
        recipes[i]["Image"] = filename

    qrs_dir = QRCODES_DIR / img_folder
    qrcodes = generate_qr(recipes, qrs_dir)

    safe_name = (collection_name or "cards").strip().replace(" ", "_")
    out_pdf = EXPORTS_DIR / f"{safe_name}_{img_folder}.pdf"
    generate_pdf(recipes, qrcodes, out_pdf, img_folder)

    return out_pdf
