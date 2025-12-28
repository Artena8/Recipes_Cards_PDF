import sys
from pathlib import Path

from read_csv import load_recipes
from qr import generate_qr
from pdf import generate_pdf
from config import EXPORTS_DIR


def run(csv_path: Path):
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV introuvable : {csv_path}")

    recipes = load_recipes(csv_path.name)
    qrcodes = generate_qr(recipes)

    out_pdf = EXPORTS_DIR / (Path(csv_path).with_suffix(".pdf").name)
    #print(Path(csv_path).stem)
    generate_pdf(recipes, qrcodes, out_pdf,Path(csv_path).stem)
    print(f"PDF généré : {out_pdf}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Nécéssite le chemin du csv en argument")
        sys.exit(1)

    csv_path = Path(sys.argv[1])
    run(csv_path)
