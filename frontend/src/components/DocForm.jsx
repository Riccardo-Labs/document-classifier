// Form per inserire e classificare un nuovo documento.
// Prop: onClassified(doc) — chiamata con il documento salvato per aggiornare la lista nel parent.

import { useState } from "react";
import { classifyDocument } from "../api/client";

// Valore iniziale del form; riutilizzato per resettare i campi dopo il submit
const EMPTY = { title: "", rawText: "" };

export default function DocForm({ onClassified }) {
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false); // blocca il bottone durante la chiamata
  const [error, setError]     = useState("");     // errore da mostrare sotto il form

  // Handler generico: usa e.target.name per aggiornare solo il campo modificato
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
    <section style={styles.section}>
      <h2>Nuovo documento</h2>
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

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Classificazione in corso..." : "Classifica e salva"}
        </button>
      </form>
    </section>
  );
}

const styles = {
  section: { marginBottom: "2rem" },
  form:    { display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 600 },
  label:   { display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: 500 },
  input:   { padding: "0.4rem 0.6rem", fontSize: "0.95rem", border: "1px solid #ccc", borderRadius: 4 },
  button:  { alignSelf: "flex-start", padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600 },
  error:   { color: "crimson", margin: 0 },
};
