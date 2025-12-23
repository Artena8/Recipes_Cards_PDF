const API_URL = "/api/cards/generate";

const statusEl = document.getElementById("status");
const recipesEl = document.getElementById("recipes");
const tpl = document.getElementById("recipeTpl");
const form = document.getElementById("cardsForm");

const resultCard = document.getElementById("resultCard");
const downloadLink = document.getElementById("downloadLink");
const pdfPreview = document.getElementById("pdfPreview");
const revokeBtn = document.getElementById("revokeBtn");

let currentBlobUrl = null;

function setStatus(msg) {
    statusEl.textContent = msg;
}

function createRecipeCard(i) {
    const node = tpl.content.cloneNode(true);
    const section = node.querySelector(".recipe");
    section.dataset.idx = String(i);

    node.querySelector(".idx").textContent = String(i);
    return node;
}

function init() {
    recipesEl.innerHTML = "";
    for (let i = 1; i <= 8; i++) {
        recipesEl.appendChild(createRecipeCard(i));
    }
}
init();

document.getElementById("resetBtn").addEventListener("click", () => {
    form.reset();
    init();
    cleanupPreview();
    setStatus("Réinitialisé");
});

document.getElementById("fillDemo").addEventListener("click", () => {
    document.getElementById("collection").value = "Tout au four !";
    document.getElementById("outName").value = "recettes_onepan.pdf";

    const blocks = [...recipesEl.querySelectorAll(".recipe")];
    blocks.forEach((b, idx) => {
        b.querySelector(".r-title").value = `Recette ${idx + 1}`;
        b.querySelector(".r-time").value = idx % 2 === 0 ? "30 min" : "1h 10";
        b.querySelector(".r-url").value = "https://example.com";
        b.querySelector(".r-regime").value = idx < 5 ? "Omnivore" : "Poisson";
        b.querySelector(".r-saison").value = ["Printemps","Été","Automne","Hiver"][idx % 4];
        // coche 2 tags
        const alls = [...b.querySelectorAll(".r-all")];
        alls.forEach(c => c.checked = false);
        if (alls[3]) alls[3].checked = true; // sans_gluten
        if (alls[2]) alls[2].checked = true; // sans_arachides
});

    setStatus("Demo préremplie (images à ajouter)");
});

function cleanupPreview() {
    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
    }
    resultCard.hidden = true;
    pdfPreview.src = "";
    downloadLink.removeAttribute("href");
}

revokeBtn.addEventListener("click", cleanupPreview);

function getRecipeData(section) {
    const title = section.querySelector(".r-title").value.trim();
    const time = section.querySelector(".r-time").value.trim();
    const url = section.querySelector(".r-url").value.trim();
    const regime = section.querySelector(".r-regime").value;
    const saison = section.querySelector(".r-saison").value;

    const allergens = [...section.querySelectorAll(".r-all:checked")].map(x => x.value);
    const fileInput = section.querySelector(".r-image");
    const file = fileInput.files && fileInput.files[0];

    return { title, time, url, regime, saison, allergens, file };
}

function validateTime(t) {
    // accepte: "30 min", "1h", "1h 10", "1h10"
    return /^(\d+\s*h(\s*\d+\s*min)?)|(\d+\s*min)$/i.test(t);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    cleanupPreview();

    const collection = document.getElementById("collection").value.trim();
    const outName = document.getElementById("outName").value.trim();

    const sections = [...recipesEl.querySelectorAll(".recipe")];
    const recipes = [];

    for (const s of sections) {
        const r = getRecipeData(s);

        if (!r.title || !r.time || !r.url || !r.file) {
        alert("Chaque recette doit avoir Titre, Temps, URL et Image.");
        return;
        }
        if (!validateTime(r.time)) {
        alert(`Format Temps invalide: "${r.time}" (ex: 30 min, 1h, 1h 10).`);
        return;
        }
        recipes.push(r);
    }

    if (recipes.length !== 8) {
        alert("Il faut exactement 8 recettes.");
        return;
    }

    setStatus("Envoi au backend…");

    // On envoie:
    // - meta (JSON) : collection + recettes (sans fichiers)
    // - 8 fichiers images (image_1..image_8)
    const payload = {
        collection,
        recipes: recipes.map((r, i) => ({
        index: i + 1,
        Titre: r.title,
        Temps: r.time,
        URL: r.url,
        "Régime": r.regime,
        Saison: r.saison,
        Allergènes: r.allergens.join(",")
        })),
        outName: outName || null
    };

    const fd = new FormData();
    fd.append("meta", JSON.stringify(payload));

    recipes.forEach((r, i) => {
        fd.append(`image_${i + 1}`, r.file, r.file.name);
    });

    try {
        const res = await fetch(API_URL, { method: "POST", body: fd });

        if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Backend error ${res.status}: ${txt || "no body"}`);
        }

        const blob = await res.blob();
        currentBlobUrl = URL.createObjectURL(blob);

        // nom du fichier téléchargé
        const filename = (outName && outName.endsWith(".pdf")) ? outName : "cartes.pdf";

        downloadLink.href = currentBlobUrl;
        downloadLink.download = filename;
        pdfPreview.src = currentBlobUrl;

        resultCard.hidden = false;
        setStatus("PDF prêt au téléchargement");
    } catch (err) {
        console.error(err);
        alert("Erreur génération PDF : " + err.message);
        setStatus("Erreur");
    }
});
