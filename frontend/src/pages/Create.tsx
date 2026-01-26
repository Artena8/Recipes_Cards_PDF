import { useEffect, useMemo, useState } from "react";
import {
    Autocomplete,
    Avatar,
    Backdrop,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Alert,
    Tooltip,
    IconButton
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { ALLERGEN_ICON, ALLERGEN_OPTIONS } from "../types/allergens";
import type { Recipe, Regime, Saison } from "../types/recipe";

const STORAGE_KEY = "cards_recipes_create_form_v1";

function isValidHttpUrl(value: string): boolean {
    try {
        const u = new URL(value);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

const emptyRecipe = (): Recipe => ({
    Collection: "",
    Titre: "",
    Temps: "",
    URL: "",
    Régime: "Végétarien",
    Saison: "Hiver",
    Allergènes: "",
    Image: "",
});

function parseAllergens(csv: string): string[] {
    return (csv || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}

function toCsv(list: string[]): string {
    return list.join(", ");
}

const API_URL = import.meta.env.VITE_API_URL;

type PersistedState = {
    collectionName: string;
    recipes: Recipe[];
};

export default function Create() {
    const [collectionName, setCollectionName] = useState("");
    const [recipes, setRecipes] = useState<Recipe[]>(Array.from({ length: 8 }, emptyRecipe));
    const [images, setImages] = useState<(File | null)[]>(Array.from({ length: 8 }, () => null));
    const [loading, setLoading] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogStatus, setDialogStatus] = useState<"success" | "error">("success");
    const [dialogMessage, setDialogMessage] = useState<string>("");

    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pdfFilename, setPdfFilename] = useState<string>("cards_recipes.pdf");

    const [collectionTouched] = useState<boolean[]>(Array.from({ length: 8 }, () => false));

    const canSubmit = useMemo(() => {
        const allImages = images.every(Boolean);
        const requiredOk = recipes.every((r) => r.Titre.trim() && r.URL.trim());
        return allImages && requiredOk && !loading;
    }, [images, recipes, loading]);

    function patchRecipe(i: number, patch: Partial<Recipe>) {
        setRecipes((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    }

    useEffect(() => {
        try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as PersistedState;

        if (parsed?.recipes?.length === 8) setRecipes(parsed.recipes);
        if (typeof parsed.collectionName === "string") setCollectionName(parsed.collectionName);
        } catch {
        // ignorer
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
        const payload: PersistedState = {
            collectionName,
            recipes
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }, 250);

        return () => clearTimeout(t);
    }, [collectionName, recipes]);

    function downloadPdf(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function resetForm() {
        setCollectionName("");
        setRecipes(Array.from({ length: 8 }, emptyRecipe));
        setImages(Array.from({ length: 8 }, () => null));
        setPdfBlob(null);
        setPdfFilename("cards_recipes.pdf");
        setDialogOpen(false);

        localStorage.removeItem(STORAGE_KEY);
    }

    async function submit() {
        setLoading(true);
        setPdfBlob(null);

        try {
        if (images.some((f) => !f)) throw new Error("Ajoute 8 images (une par recette).");
        if (recipes.some((r) => !r.Titre.trim() || !r.URL.trim()))
            throw new Error("Chaque recette doit avoir au minimum un Titre et une URL.");

        const fd = new FormData();
        fd.append("collection_name", collectionName);
        fd.append("recipes", JSON.stringify(recipes));
        images.forEach((f) => fd.append("images", f as File));

        const res = await fetch(`${API_URL}/generate`, { method: "POST", body: fd });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || `Erreur API (${res.status})`);
        }

        const blob = await res.blob();

        const cd = res.headers.get("content-disposition") || "";
        const match = cd.match(/filename="?([^"]+)"?/i);
        const filename = match?.[1] || `cards_${(collectionName || "recipes").trim()}.pdf`;

        setPdfBlob(blob);
        setPdfFilename(filename);

        setDialogStatus("success");
        setDialogMessage("PDF généré avec succès !");
        setDialogOpen(true);

        } catch (e: unknown) {
        setDialogStatus("error");
        setDialogMessage(e instanceof Error ? e.message : "Erreur inconnue");
        setDialogOpen(true);
        } finally {
        setLoading(false);
        }
    }

    return (
        <Container maxWidth="md" sx={{ pb: 6 }}>
        <Backdrop open={loading} sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}>
            <Stack spacing={2} alignItems="center">
            <CircularProgress color="inherit" />
            <Typography sx={{ fontFamily: "Chewy", fontSize: 22 }}>
                Génération du PDF...
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>Ça peut prendre quelques secondes</Typography>
            </Stack>
        </Backdrop>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontFamily: "Chewy" }}>
            {dialogStatus === "success" ? "C’est prêt !" : "Oups…"}
            </DialogTitle>

            <DialogContent>
            {dialogStatus === "success" ? (
                <Alert severity="success">{dialogMessage}</Alert>
            ) : (
                <Alert severity="error">{dialogMessage}</Alert>
            )}

            {dialogStatus === "success" && (
                <Typography sx={{ mt: 2, color: "var(--muted)" }}>
                Tu peux télécharger à nouveau le PDF, ou continuer pour créer une nouvelle planche.
                </Typography>
            )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
            {dialogStatus === "success" ? (
                <>
                <Button
                    variant="contained"
                    onClick={() => {
                    if (pdfBlob) downloadPdf(pdfBlob, pdfFilename);
                    }}
                    disabled={!pdfBlob}
                >
                    Télécharger le PDF
                </Button>

                <Button
                    variant="contained"
                    sx={{ backgroundColor: "var(--brand)", color: "#fff!important" }}
                    onClick={resetForm}
                >
                    Continuer
                </Button>
                </>
            ) : (
                <Button
                variant="contained"
                sx={{ backgroundColor: "var(--brand)", color: "#fff!important" }}
                onClick={() => setDialogOpen(false)}
                >
                Fermer
                </Button>
            )}
            </DialogActions>
        </Dialog>

        <Box sx={{ textAlign: "center", mt: 1 }}>
            <Typography variant="h2" component="h1" sx={{ fontFamily: "Chewy" }}>
            Création d'une planche de cartes
            </Typography>
        </Box>

        <Card sx={{ borderRadius: 1, mt: 2 }}>
            <CardContent>
            <Stack spacing={2}>
                <TextField
                label="Nom du PDF / Collection (optionnel)"
                placeholder="Ex: Tout au cookeo !"
                value={collectionName}
                onChange={(e) => {
                    const val = e.target.value;
                    setCollectionName(val);
                    setRecipes((prev) =>
                    prev.map((r, idx) => (collectionTouched[idx] ? r : { ...r, Collection: val }))
                    );
                }}
                fullWidth
                />

                <Divider />

                <Typography variant="body2" sx={{ width: "100%", margin: "10px auto!important", textAlign: "center", color: "var(--muted)" }}>
                Champs obligatoires : <b>Titre</b>, <b>URL</b> et <b>Image</b> pour chaque recette.
                <br />
                <b>Note :</b> après un refresh, tu devras re-uploader les images.
                </Typography>

                <Stack spacing={2}>
                {recipes.map((r, idx) => {
                    const selectedAllergens = parseAllergens(r.Allergènes);

                    return (
                    <Card
                        key={idx}
                        variant="outlined"
                        sx={{ borderRadius: 2, borderColor: "rgba(0,0,0,.08)" }}
                    >
                        <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h5" sx={{ fontFamily: "Chewy", color: "var(--text)" }}>
                            Recette {idx + 1}
                            </Typography>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                label="Collection"
                                value={r.Collection}
                                onChange={(e) => patchRecipe(idx, { Collection: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Titre"
                                value={r.Titre}
                                onChange={(e) => patchRecipe(idx, { Titre: e.target.value })}
                                fullWidth
                                required
                            />
                            </Stack>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                label="Temps"
                                value={r.Temps}
                                onChange={(e) => patchRecipe(idx, { Temps: e.target.value })}
                                placeholder="23 min"
                                inputProps={{ maxLength: 10 }}
                                fullWidth
                            />
                            <TextField
                                label="URL"
                                value={r.URL}
                                onChange={(e) => patchRecipe(idx, { URL: e.target.value })}
                                fullWidth
                                required
                                error={!!r.URL && !isValidHttpUrl(r.URL)}
                                helperText={
                                    !r.URL
                                    ? ""
                                    : isValidHttpUrl(r.URL)
                                    ? "OK"
                                    : "URL invalide (doit commencer par http:// ou https://)"
                                }
                            />
                            </Stack>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                select
                                label="Régime"
                                value={r.Régime}
                                onChange={(e) => patchRecipe(idx, { Régime: e.target.value as Regime })}
                                fullWidth
                            >
                                {["Végétarien", "Végan", "Omnivore", "Poisson"].map((x) => (
                                <MenuItem key={x} value={x}>
                                    {x}
                                </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                            select
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
                                Saison
                                <Tooltip title="À choisir selon les ingrédients principaux de la recette">
                                    <IconButton size="small">
                                    <InfoOutlinedIcon fontSize="inherit" sx={{ color: "black" }}/>
                                    </IconButton>
                                </Tooltip>
                                </Box>
                            }
                            value={r.Saison}
                            onChange={(e) =>
                                patchRecipe(idx, { Saison: e.target.value as Saison })
                            }
                            fullWidth
                            >
                            {["Printemps", "Été", "Automne", "Hiver"].map((x) => (
                                <MenuItem key={x} value={x}>
                                {x}
                                </MenuItem>
                            ))}
                            </TextField>
                            </Stack>

                            <Autocomplete
                            multiple
                            options={ALLERGEN_OPTIONS}
                            value={selectedAllergens}
                            onChange={(_, newValue) => {
                                patchRecipe(idx, { Allergènes: toCsv(newValue) });
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Allergènes" placeholder="Sélectionner..." />
                            )}
                            renderOption={(props, option) => (
                                <Box
                                component="li"
                                {...props}
                                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                >
                                <Avatar
                                    src={ALLERGEN_ICON[option]}
                                    variant="rounded"
                                    sx={{ width: 24, height: 24 }}
                                />
                                <Typography variant="body2">{option}</Typography>
                                </Box>
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option}
                                    label={option}
                                    avatar={
                                    <Avatar
                                        src={ALLERGEN_ICON[option]}
                                        variant="rounded"
                                        sx={{ width: 18, height: 18 }}
                                    />
                                    }
                                    sx={{ borderRadius: 999 }}
                                />
                                ))
                            }
                            />

                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap"> 
                                <Button variant="contained" component="label" sx={{ borderRadius: 999, backgroundColor: "var(--brand)", color: "#fff!important" }} > 
                                    {images[idx] ? "Changer l'image" : "Uploader l'image *"} 
                                    <input hidden type="file" accept="image/*" onChange={
                                        (e) => { 
                                            const file = e.target.files?.[0] ?? null; 
                                            setImages((prev) => prev.map((x, i) => (i === idx ? file : x))); 
                                        }} /> 
                                </Button>

                            <Typography variant="body2" sx={{ color: "var(--muted)" }}> 
                                {images[idx]?.name ? images[idx]!.name : "Aucun fichier sélectionné"} (Nous recommandons une image carrée de bonne qualité).
                            </Typography>
                            </Stack>
                        </Stack>
                        </CardContent>
                    </Card>
                    );
                })}
                </Stack>

                <Button
                onClick={submit}
                disabled={!canSubmit}
                variant="contained"
                size="large"
                sx={{
                    borderRadius: 999,
                    py: 1.4,
                    backgroundColor: "var(--brand)",
                    alignSelf: "center",
                    minWidth: 240,
                }}
                >
                {loading ? "Génération..." : "Générer le PDF"}
                </Button>

                {/* petit utilitaire : vider le cache */}
                <Button
                variant="text"
                onClick={resetForm}
                sx={{ alignSelf: "center", color: "var(--muted)" }}
                >
                Réinitialiser le formulaire
                </Button>
            </Stack>
            </CardContent>
        </Card>
        </Container>
    );
}
