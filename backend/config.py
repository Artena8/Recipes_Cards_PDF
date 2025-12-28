from pathlib import Path
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

BASE_DIR = Path(__file__).resolve().parent

IMPORTS_DIR = BASE_DIR / "imports"
EXPORTS_DIR = BASE_DIR / "exports"
QRCODES_DIR = BASE_DIR / "qrcodes"
IMAGES_DIR = BASE_DIR / "images"
FONTS_DIR = BASE_DIR / "fonts"

EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

PAGE_SIZE = landscape(A4)

REGIME_COLORS = {
    "Végétarien": "#5f8505",
    "Végan": "#005510",
    "Omnivore": "#8c2f39",
    "Poisson": "#006db9",
}

SAISON_COLORS = {
    "Printemps": "#77DD77",
    "Été": "#FFD966",
    "Automne": "#E08E45",
    "Hiver": "#91A8D0",
}

SAISON_ICON = {
    "Printemps": IMAGES_DIR / "saisons" / "Printemps.png",
    "Été": IMAGES_DIR / "saisons" / "Été.png",
    "Automne": IMAGES_DIR / "saisons" / "Automne.png",
    "Hiver": IMAGES_DIR / "saisons" / "Hiver.png",
}

ALLERGEN_ICON = {
    "fromage": "backend/images/allergenes/fromage.png",
    "porc": "backend/images/allergenes/porc.png",
    "sans_arachides": "backend/images/allergenes/sans_arachides.png",
    "sans_gluten": "backend/images/allergenes/sans_gluten.png",
    "sans_lactose": "backend/images/allergenes/sans_lactose.png",
    "crustacés": "backend/images/allergenes/crustacés.png",
}

pdfmetrics.registerFont(
    TTFont("Chewy", str(FONTS_DIR / "Chewy-Regular.ttf"))
)