// Client HTTP centralizzato: tutti i componenti importano da qui,
// così l'URL base si cambia in un solo posto.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Wrapper attorno a fetch: aggiunge Content-Type JSON e rilancia
// gli errori del backend come eccezioni leggibili.
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    // FastAPI restituisce il messaggio d'errore in `detail`
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// POST /documents/classify — classifica il documento con ML e lo salva nel DB.
// Restituisce il documento con categoria e confidence già assegnate.
export function classifyDocument(title, rawText) {
  return request("/documents/classify", {
    method: "POST",
    body: JSON.stringify({ title, raw_text: rawText }),
  });
}

// GET /documents — lista ordinata dal più recente.
// Filtra per categoria se il parametro è valorizzato (es. "fattura").
export function fetchDocuments(category = "") {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return request(`/documents${qs}`);
}

// PATCH /documents/:id/review — sovrascrive la categoria e segna il documento come "reviewed".
export function reviewDocument(id, reviewedCategory) {
  return request(`/documents/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({ reviewed_category: reviewedCategory }),
  });
}

// GET /stats/categories — conteggio documenti per categoria, usato dalla sezione statistiche.
export function fetchStats() {
  return request("/stats/categories");
}
