// Tabella dei documenti classificati con filtro per categoria e revisione inline.
// Props:
//   documents       — array di documenti da mostrare
//   filterCategory  — filtro attivo (stringa vuota = tutti)
//   onFilterChange  — callback al cambio del filtro
//   onReviewed      — callback con il documento aggiornato dopo una revisione

import { useState } from "react";
import { reviewDocument } from "../api/client";

// La stringa vuota come primo elemento rappresenta "tutte le categorie" nel filtro.
// slice(1) la esclude quando serve un valore reale (es. nel select di modifica).
const CATEGORIES = ["", "fattura", "supporto_tecnico", "richiesta_commerciale", "reclamo", "altro"];

export default function DocTable({ documents, filterCategory, onFilterChange, onReviewed }) {
  const [editingId, setEditingId] = useState(null);  // id del documento in modifica
  const [editValue, setEditValue] = useState("");     // categoria selezionata nel select
  const [saving, setSaving]       = useState(false);  // blocca "Salva" durante la chiamata

  // Apre la modalità modifica pre-popolando il select con la categoria esistente
  function startEdit(doc) {
    setEditingId(doc.id);
    setEditValue(doc.reviewed_category || doc.predicted_category);
  }

  // Salva la categoria corretta sul backend e aggiorna la lista nel parent
  async function saveEdit(id) {
    setSaving(true);
    try {
      const updated = await reviewDocument(id, editValue);
      onReviewed(updated);
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div style={styles.header}>
        <h2 style={styles.heading}>Documenti classificati</h2>
        <label style={styles.filterLabel}>
          Categoria:{" "}
          <select value={filterCategory} onChange={(e) => onFilterChange(e.target.value)} style={styles.select}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || "— tutte —"}</option>
            ))}
          </select>
        </label>
      </div>

      {documents.length === 0 ? (
        <p style={{ color: "#888", marginTop: "1rem" }}>Nessun documento trovato.</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: "1rem" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["ID", "Titolo", "Categoria predetta", "Confidenza", "Categoria revisionata", "Stato", "Azione"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} style={doc.status === "reviewed" ? styles.reviewedRow : {}}>
                  <td style={styles.td}>{doc.id}</td>

                  {/* Titolo troncato con ellipsis; il tooltip mostra il testo completo */}
                  <td style={{ ...styles.td, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={doc.title}>
                    {doc.title}
                  </td>

                  <td style={styles.td}>
                    <span style={categoryStyle(doc.predicted_category)}>{doc.predicted_category}</span>
                  </td>

                  <td style={styles.td}>
                    <span style={confidenceStyle(doc.confidence_score)}>
                      {(doc.confidence_score * 100).toFixed(1)}%
                    </span>
                  </td>

                  {/* In modifica mostra il select; altrimenti il valore o un trattino se non ancora revisionato */}
                  <td style={styles.td}>
                    {editingId === doc.id ? (
                      <select value={editValue} onChange={(e) => setEditValue(e.target.value)} style={styles.select}>
                        {CATEGORIES.slice(1).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      doc.reviewed_category || <span style={{ color: "#aaa" }}>—</span>
                    )}
                  </td>

                  <td style={styles.td}>
                    <span style={doc.status === "reviewed" ? styles.badgeReviewed : styles.badgeNew}>
                      {doc.status}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {editingId === doc.id ? (
                      <>
                        <button onClick={() => saveEdit(doc.id)} disabled={saving} style={styles.btnSave}>
                          Salva
                        </button>
                        <button onClick={() => setEditingId(null)} style={styles.btnCancel}>
                          Annulla
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startEdit(doc)} style={styles.btnEdit}>
                        Correggi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const CATEGORY_COLORS = {
  fattura:               { bg: "#dbeafe", color: "#1e40af" },
  supporto_tecnico:      { bg: "#fce7f3", color: "#9d174d" },
  richiesta_commerciale: { bg: "#d1fae5", color: "#065f46" },
  reclamo:               { bg: "#fee2e2", color: "#991b1b" },
  altro:                 { bg: "#e5e7eb", color: "#374151" },
};

function categoryStyle(cat) {
  const c = CATEGORY_COLORS[cat] || { bg: "#e5e7eb", color: "#374151" };
  return { background: c.bg, color: c.color, padding: "2px 10px", borderRadius: 10, fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap" };
}

function confidenceStyle(score) {
  const color = score > 0.80 ? "#0f5132" : score >= 0.50 ? "#856404" : "#842029";
  const bg    = score > 0.80 ? "#d1e7dd" : score >= 0.50 ? "#fff3cd" : "#f8d7da";
  return { background: bg, color, padding: "2px 8px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 600 };
}

const styles = {
  header:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  heading:     { margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" },
  filterLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", fontWeight: 500, color: "#64748b" },
  table:         { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th:            { textAlign: "left", padding: "0.5rem 0.75rem", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", color: "#64748b", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em" },
  td:            { padding: "0.55rem 0.75rem", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  reviewedRow:   { backgroundColor: "#f0fdf4" },
  select:        { padding: "0.25rem 0.4rem", fontSize: "0.9rem", borderRadius: 4, border: "1px solid #d1d5db" },
  badgeNew:      { background: "#fff3cd", color: "#856404", padding: "2px 8px", borderRadius: 10, fontSize: "0.78rem", fontWeight: 600 },
  badgeReviewed: { background: "#d1e7dd", color: "#0f5132", padding: "2px 8px", borderRadius: 10, fontSize: "0.78rem", fontWeight: 600 },
  btnEdit:       { padding: "4px 12px", cursor: "pointer", fontSize: "0.85rem", border: "1px solid #d1d5db", borderRadius: 5, background: "#fff" },
  btnSave:       { padding: "4px 12px", cursor: "pointer", marginRight: 4, fontWeight: 600, fontSize: "0.85rem", background: "#1e293b", color: "#fff", border: "none", borderRadius: 5 },
  btnCancel:     { padding: "4px 12px", cursor: "pointer", color: "#64748b", fontSize: "0.85rem", border: "1px solid #d1d5db", borderRadius: 5, background: "#fff" },
};
