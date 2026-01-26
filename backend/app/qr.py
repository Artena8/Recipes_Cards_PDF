import qrcode
from pathlib import Path
from config import REGIME_COLORS

def generate_qr(recipes: list[dict], out_dir: Path) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    qr_paths: list[Path] = []

    for i, r in enumerate(recipes, start=1):
        safe_title = str(r["Titre"]).replace(" ", "_").replace("/", "_")
        filename = f"qr_{i:02d}_{safe_title}.png"
        color = REGIME_COLORS.get(r["Régime"], "#000000")
        path = out_dir / filename

        qr = qrcode.QRCode()
        qr.add_data(r["URL"])
        img = qr.make_image(fill_color=color, back_color="white")
        img.save(path)

        qr_paths.append(path)

    return qr_paths
