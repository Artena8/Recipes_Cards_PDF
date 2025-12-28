# Recipes Cards PDF Generator V1.1

Générateur de **cartes recettes imprimables (PDF)** à partir d’un fichier CSV et d’images associées.  
La branche main est pour l'executable python et la branche web api est pour la version avec interface web.

---

## 1. Fonctionnalités

- Lecture d’un CSV structuré
- Génération automatique des QR codes
- Mise en page PDF (ReportLab)
- Support des :
  - régimes : Omnivore, Poisson, Végétarien, Végan
  - saisons : Printemps, Été, Automne, Hiver
  - allergènes (icônes)
- Sortie prête à imprimer

---

## 2. Structure du code
```
backend/
│
├── main.py
├── pdf.py
├── qr.py
├── read_csv.py
├── config.py
├── requirements.txt
│
├── imports/
├── exports/
├── images/
│   ├── saisons/
│   └── allergenes/
└── fonts/
```
Important : le dossier d’images doit avoir exactement le même nom que le CSV (sans .csv).

---

## 3. Format du CSV

Collection,Titre,Temps,URL,Régime,Saison,Allergènes,Image  

Colonnes obligatoires :
- Collection
- Titre
- Temps
- URL
- Régime → Omnivore | Poisson | Végétarien | Végan
- Saison → Printemps | Été | Automne | Hiver
- Allergènes → séparés par des virgules (optionnel)
- Image → nom du fichier image

Le CSV doit contenir **exactement 8 recettes**.

---

## 4. Exécution du script (local)

0) installer une venv

1) Activer l’environnement virtuel

.venv\Scripts\activate

2) Installer les dépendances

pip install -r .\backend\requirements.txt

3) Placer les fichiers

- Le CSV dans backend/imports/
- Les images dans backend/imports/<nom_du_csv>/

4) Lancer la génération

py .\backend\main.py .\backend\imports\<nom_du_csv>.csv

---

## 5. Résultat

Le PDF généré est disponible dans :

backend/exports/<nom_du_csv>.pdf

---

## 6. Dépendances principales

- Python 3.11+
- reportlab
- pandas
- qrcode
- pillow

