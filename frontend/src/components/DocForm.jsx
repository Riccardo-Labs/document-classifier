// Form per inserire e classificare un nuovo documento.
// Prop: onClassified(doc) — chiamata con il documento salvato per aggiornare la lista nel parent.

import { useState } from "react";
import { classifyDocument } from "../api/client";

const EMPTY = { title: "", rawText: "" };

export default function DocForm({ onClassified }) {
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const doc = await classifyDocument(form.title, form.rawText);
      onClassified(doc);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2 style={styles.heading}>Nuovo documento</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Titolo
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Es. Fattura marzo 2024"
          />
        </label>

        <label style={styles.label}>
          Testo
          <textarea
            name="rawText"
            value={form.rawText}
            onChange={handleChange}
            required
            rows={5}
            style={{ ...styles.input, resize: "vertical" }}
            placeholder="Incolla qui il contenuto del documento..."
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
          {loading ? "Classificazione in corso..." : "Classifica e salva"}
        </button>
      </form>
    </section>
  );
}

const styles = {
  heading:        { margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" },
  form:           { display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 600 },
  label:          { display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: 500, fontSize: "0.9rem", color: "#374151" },
  input:          { padding: "0.5rem 0.75rem", fontSize: "0.95rem", border: "1px solid #d1d5db", borderRadius: 6, outline: "none" },
  button:         { alignSelf: "flex-start", padding: "0.55rem 1.4rem", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", background: "#1e293b", color: "#fff", border: "none", borderRadius: 6 },
  buttonDisabled: { alignSelf: "flex-start", padding: "0.55rem 1.4rem", fontWeight: 600, fontSize: "0.95rem", background: "#94a3b8", color: "#fff", border: "none", borderRadius: 6, cursor: "not-allowed" },
  error:          { color: "#842029", margin: 0, fontSize: "0.9rem" },
};
