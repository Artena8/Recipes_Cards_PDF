from pathlib import Path
import math
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

from config import PAGE_SIZE, SAISON_ICON, ALLERGEN_ICON, REGIME_COLORS

# ========================================================== UTILS ==========================================================
def regime_color(regime: str):
    hex_value = REGIME_COLORS.get(regime, "#000000")
    return colors.HexColor(hex_value)


def _split_tags(r: dict) -> list[str]:
    raw = r.get("Allergènes", "")

    if raw is None:
        return []
    if isinstance(raw, float) and math.isnan(raw):
        return []

    raw = str(raw).strip()
    if not raw:
        return []

    return [t.strip().lower() for t in raw.split(",") if t.strip()]


# ========================================================== FACE RECTO ==========================================================
# Titre + Temps + Image + Allergies

def render_cards_recto(pdf: canvas.Canvas, recipes: list[dict], img_path):
    width, height = PAGE_SIZE

    # marges + tailles carte
    margin_x = 0.5*cm
    margin_y = 0.5*cm
    gap_x = 0.5*cm
    gap_y = 0.5*cm

    cols, rows = 4, 2
    
    card_w = (width - 4*margin_x - gap_x) / cols
    card_h = (height - 2*margin_y - 2*gap_y) / rows

    for i, r in enumerate(recipes):
        col = i % cols
        row = i // cols

        x = margin_x + col * (card_w + gap_x)
        y = height - margin_y - (row+1) * card_h - row * gap_y

        draw_card_recto(pdf, r, x, y, card_w, card_h, img_path)

def draw_card_recto(pdf: canvas.Canvas, r: dict, x: float, y: float, w: float, h: float, img_path):
    main_color = regime_color(r["Régime"])
    pdf.setStrokeColor(main_color)  # régimes
    pdf.setLineWidth(6)
    pdf.rect(x+2, y+2, w-4, h-4, stroke=1, fill=0)

    # titre
    title = Paragraph(
        r["Titre"],
        ParagraphStyle(
            name="Title",
            fontName="Chewy",
            fontSize=18,
            leading=10* 1.75,
            alignment=1,
            textColor=main_color,
        )
    )
    max_width = w - 0.8*cm
    max_height = 2.2*cm

    pw, ph = title.wrap(max_width, max_height)
    top_margin = 0.55 * cm

    title.drawOn(
        pdf,
        x + (w - pw) / 2,
        y + h - top_margin - ph
    )
    
    # image
    img = ImageReader("backend/imports/" + img_path + "/" + r["Image"])
    img_w, img_h = img.getSize()

    # Taille finale carrée (300 px)
    BOX_PX = 175
    BOX_PT = BOX_PX * 0.75

    box_x = x + (w - BOX_PT) / 2
    box_y = y + (h / 2) - (BOX_PT / 2)

    # Ratio image
    img_ratio = img_w / img_h
    box_ratio = 1  # carré

    if img_ratio > box_ratio:
        # image trop large
        draw_h = BOX_PT
        draw_w = BOX_PT * img_ratio
    else:
        # image trop haute
        draw_w = BOX_PT
        draw_h = BOX_PT / img_ratio

    draw_x = box_x - (draw_w - BOX_PT) / 2
    draw_y = box_y - (draw_h - BOX_PT) / 2

    pdf.saveState()
    p = pdf.beginPath()
    p.rect(box_x, box_y, BOX_PT, BOX_PT)
    pdf.clipPath(p, stroke=0, fill=0)

    pdf.drawImage(img, draw_x, draw_y, draw_w, draw_h, mask="auto")

    pdf.restoreState()

    # pastille temps
    pdf.setFillColor(main_color)
    pill_w, pill_h = w*0.5, 0.65*cm
    pill_x = x + (w - pill_w)/2
    pill_y = y + 1.6*cm
    pdf.roundRect(pill_x, pill_y, pill_w, pill_h, 10, stroke=0, fill=1)

    pdf.setFillColor(colors.white)
    pdf.setFont("Chewy", 9)
    pdf.drawCentredString(x + w/2, pill_y + 0.22*cm, f"Temps : {r['Temps']}")

    # allergènes/tags
    tags = _split_tags(r)
    print(tags)
    tag_icons = [ALLERGEN_ICON[t] for t in tags if t in ALLERGEN_ICON and Path(ALLERGEN_ICON[t]).exists()]
    print(tag_icons)
    # icônes en bas : saison + 1-2 allergènes
    icon_size = 0.8*cm
    base_y = y + 0.5*cm

    # centrer
    count = len(tag_icons)
    if count == 0:
        return

    gap = 0.2 * cm
    total_width = count * icon_size + (count - 1) * gap

    start_x = x + (w - total_width) / 2

    for i, p in enumerate(tag_icons):
        pdf.drawImage(
            str(p),
            start_x + i * (icon_size + gap),
            base_y,
            icon_size,
            icon_size,
            mask='auto'
        )

# ========================================================== FACE VERSO ==========================================================
# QRCODE + Collection + Saison

def render_cards_verso(pdf: canvas.Canvas, recipes: list[dict], qrcodes: list[Path]):
    width, height = PAGE_SIZE

    # marges + tailles carte
    margin_x = 0.5*cm
    margin_y = 0.8*cm
    gap_x = 0.5*cm
    gap_y = 0.5*cm

    cols, rows = 4, 2
    
    card_w = (width - 4*margin_x - gap_x) / cols
    card_h = (height - 2*margin_y - 2*gap_y) / rows
    
    for i, (r, qr_path) in enumerate(zip(recipes, qrcodes)):
        col = i % cols
        row = i // cols
        
        # miroir horizontal
        col = (cols - 1) - col

        x = margin_x + col * (card_w + gap_x)
        y = height - margin_y - (row+1) * card_h - row * gap_y

        draw_card_verso(pdf, r, qr_path, x, y, card_w, card_h)

def draw_card_verso(pdf: canvas.Canvas, r: dict, qr_path: Path, x: float, y: float, w: float, h: float):
    main_color = regime_color(r["Régime"])

    # Bandeau
    pill_w, pill_h = w * 0.78, 0.95 * cm   # un peu plus haut pour 2 lignes
    pill_x = x + (w - pill_w) / 2
    pill_y = y + h - 1.35 * cm

    pdf.setFillColor(main_color)
    pdf.roundRect(pill_x, pill_y, pill_w, pill_h, 10, stroke=0, fill=1)

    # Icône saison (fixe à droite du bandeau)
    saison = r["Saison"]
    saison_path = SAISON_ICON.get(saison)
    icon_size = 0.75 * cm
    icon_pad = 0.25 * cm

    if saison_path and Path(saison_path).exists():
        icon_x = pill_x + pill_w - icon_pad - icon_size
        icon_y = pill_y + (pill_h - icon_size) / 2
        pdf.drawImage(str(saison_path), icon_x, icon_y, icon_size, icon_size, mask="auto")

    # Texte collection (wrap dans le bandeau, sans dépasser)
    # On réserve de la place pour l'icône à droite
    text_left_pad = 0.35 * cm
    text_right_pad = 0.25 * cm
    available_w = (icon_x - text_right_pad) - (pill_x + text_left_pad)
    available_h = pill_h - 0.2 * cm

    style = ParagraphStyle(
        name="Collection",
        fontName="Chewy",
        fontSize=10,
        leading=12,     # interligne
        alignment=1,    # centré
        textColor=colors.white,
    )

    # Auto-fit simple: si ça dépasse, on baisse la taille
    collection_text = r["Collection"]

    para = Paragraph(collection_text, style)
    pw, ph = para.wrap(available_w, available_h)

    sizes = [
        (14, 16),
        (10, 12),
        (9, 11),
        (8, 10),
    ]

    for font_size, leading in sizes:
        style.fontSize = font_size
        style.leading = leading
        para = Paragraph(collection_text, style)
        pw, ph = para.wrap(available_w, available_h)

        if ph <= available_h:
            break

    # centre verticalement dans le bandeau
    text_x = pill_x + text_left_pad + (available_w - pw) / 2
    text_y = pill_y + (pill_h - ph) / 2
    para.drawOn(pdf, text_x, text_y)

    # Qr
    qr_size = min(w * 0.8, h * 0.8)
    qr_x = x + (w - qr_size) / 2
    qr_y = y + (h - qr_size) / 2 - 0.3 * cm
    pdf.drawImage(str(qr_path), qr_x, qr_y, qr_size, qr_size, mask='auto')

        
# ========================================================== PDF GENERATION (MAIN) ==========================================================

def generate_pdf(recipes: list[dict], qrcodes: list[Path], out_pdf: Path, img_path) -> Path:
    """_summary_

    Args:
        img_path : chemin des images
        recipes (list[dict]): Liste des recettes à inclure dans le PDF du csv
        qrcodes (list[Path]): Liste des chemins vers les QR codes générés
        out_pdf (Path): chemin du PDF à générer

    Returns:
        Path: endroit du PDF généré
    """
    # assure le dossier existe
    out_pdf.parent.mkdir(parents=True, exist_ok=True)
    # crée le PDF
    pdf = canvas.Canvas(str(out_pdf), pagesize=PAGE_SIZE)
    # face recto
    render_cards_recto(pdf, recipes, img_path)
    pdf.showPage()
    # face verso
    render_cards_verso(pdf, recipes, qrcodes)
    pdf.showPage()
    # fin
    pdf.save()
    return out_pdf
