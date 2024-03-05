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
    <section style={{ marginBottom: "2rem" }}>
      <h2>Documenti classificati</h2>

      <label style={{ fontWeight: 500 }}>
        Filtra per categoria:{" "}
        <select value={filterCategory} onChange={(e) => onFilterChange(e.target.value)} style={styles.select}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c || "— tutte —"}</option>
          ))}
        </select>
      </label>

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

                  <td style={styles.td}>{doc.predicted_category}</td>

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

function confidenceStyle(score) {
  const color = score > 0.80 ? "#0f5132" : score >= 0.50 ? "#856404" : "#842029";
  const bg    = score > 0.80 ? "#d1e7dd" : score >= 0.50 ? "#fff3cd" : "#f8d7da";
  return { background: bg, color, padding: "2px 8px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 600 };
}

const styles = {
  table:         { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th:            { textAlign: "left", padding: "0.5rem 0.75rem", borderBottom: "2px solid #ddd", whiteSpace: "nowrap" },
  td:            { padding: "0.45rem 0.75rem", borderBottom: "1px solid #eee", verticalAlign: "middle" },
  reviewedRow:   { backgroundColor: "#f6fff6" },
  select:        { padding: "0.25rem 0.4rem", fontSize: "0.9rem" },
  badgeNew:      { background: "#fff3cd", color: "#856404", padding: "2px 8px", borderRadius: 10, fontSize: "0.8rem" },
  badgeReviewed: { background: "#d1e7dd", color: "#0f5132", padding: "2px 8px", borderRadius: 10, fontSize: "0.8rem" },
  btnEdit:       { padding: "3px 10px", cursor: "pointer" },
  btnSave:       { padding: "3px 10px", cursor: "pointer", marginRight: 4, fontWeight: 600 },
  btnCancel:     { padding: "3px 10px", cursor: "pointer", color: "#666" },
};
