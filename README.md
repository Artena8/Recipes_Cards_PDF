# Recipes Cards PDF Generator V2.1 - version web

Générateur de **cartes recettes imprimables (PDF)** depuis internet avec une API et un site en React. 
La branche main est pour l'executable python et la branche web api est pour la version avec interface web.

![Made with FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)
![Made with React](https://img.shields.io/badge/frontend-React-61DAFB)
![Docker](https://img.shields.io/badge/container-Docker-2496ED)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF)

---

## 1. Fonctionnalités

- Création avec interface graphique des planches
- Génération automatique des QR codes
- Mise en page PDF (ReportLab)
- Support des :
  - régimes : Omnivore, Poisson, Végétarien, Végan
  - saisons : Printemps, Été, Automne, Hiver
  - allergènes (icônes)
- Sortie prête à imprimer

---

## 2. Structure du code

### Frontend
- React + Vite
- Material UI (MUI)
- Autocomplete avec icônes

### Backend
- FastAPI
- Génération PDF avec ReportLab
- Génération de QR codes
- Upload d’images & traitement CSV-like

### Infra
- Docker & Docker Compose
- Traefik (HTTPS / Let’s Encrypt)
- Déploiement automatisé via GitHub Actions

---
## 3. Utilisation

Aller sur le site [prévu déployé](https://recipe.hellyow.pro)

