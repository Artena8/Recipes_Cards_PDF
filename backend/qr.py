import qrcode
from pathlib import Path
from config import QRCODES_DIR, REGIME_COLORS

def generate_qr(recipes: list[dict]) -> list[Path]:
    QRCODES_DIR.mkdir(exist_ok=True)

    qr_paths = []

    for i, r in enumerate(recipes, start=1):
        filename = f"qr_{i:02d}_{r['Titre'].replace(' ', '_')}.png"
        color = REGIME_COLORS.get(r["Régime"], "#000000")
        path = QRCODES_DIR / filename

        if not path.exists():
            qr = qrcode.QRCode()
            qr.add_data(r['URL'])
            img = qr.make_image(
                fill_color=color,
                back_color="white"
            )
            img.save(path)

        qr_paths.append(path)

    return qr_paths
