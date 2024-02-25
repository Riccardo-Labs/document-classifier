// Componente root: gestisce lo stato globale e coordina DocForm, DocTable e Stats.

import { useState, useEffect, useCallback } from "react";
import DocForm from "./components/DocForm";
import DocTable from "./components/DocTable";
import Stats from "./components/Stats";
import { fetchDocuments, fetchStats } from "./api/client";

export default function App() {
  const [documents, setDocuments]           = useState([]);  // documenti mostrati nella tabella
  const [stats, setStats]                   = useState([]);  // conteggi per categoria
  const [filterCategory, setFilterCategory] = useState(""); // filtro attivo (stringa vuota = tutti)
  const [loadError, setLoadError]           = useState(""); // errore di connessione al backend

  // Carica documenti e statistiche in parallelo.
  // useCallback è necessario perché questa funzione è una dipendenza di useEffect:
  // senza di esso verrebbe ricreata ad ogni render causando un loop infinito.
  const loadData = useCallback(async (category = filterCategory) => {
    try {
      const [docs, cats] = await Promise.all([fetchDocuments(category), fetchStats()]);
      setDocuments(docs);
      setStats(cats);
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    }
  }, [filterCategory]);

  // Carica al montaggio e ogni volta che il filtro cambia
  useEffect(() => { loadData(); }, [loadData]);

  // DocTable chiama questa funzione quando l'utente seleziona una categoria:
  // aggiorna il filtro e ricarica i documenti filtrati dal backend
  function handleFilterChange(category) {
    setFilterCategory(category);
    loadData(category);
  }

  // DocForm chiama questa funzione dopo una classificazione riuscita:
  // aggiunge il documento in cima alla lista senza ricaricare tutto,
  // poi aggiorna le statistiche in background
  function handleClassified(newDoc) {
    setDocuments((prev) => [newDoc, ...prev]);
    fetchStats().then(setStats).catch(() => {});
  }

  // DocTable chiama questa funzione dopo una revisione manuale:
  // sostituisce il documento aggiornato nella lista senza chiamate aggiuntive al backend.
  // La lista viene aggiornata in modo immutabile tramite map per triggerare il re-render.
  function handleReviewed(updatedDoc) {
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>Internal Document Routing Tool</h1>
        <p style={styles.subtitle}>Classifica automaticamente i documenti aziendali con ML locale</p>
      </header>

      {loadError && <p style={styles.error}>Errore di connessione: {loadError}</p>}

      <DocForm onClassified={handleClassified} />

      <hr style={styles.divider} />

      <Stats stats={stats} />

      <hr style={styles.divider} />

      <DocTable
        documents={documents}
        filterCategory={filterCategory}
        onFilterChange={handleFilterChange}
        onReviewed={handleReviewed}
      />
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: "0 auto", padding: "1.5rem 1rem", fontFamily: "system-ui, sans-serif" },
  header:    { marginBottom: "1.5rem" },
  subtitle:  { color: "#666", margin: "0.25rem 0 0" },
  divider:   { border: "none", borderTop: "1px solid #ddd", margin: "1.5rem 0" },
  error:     { color: "crimson", background: "#fff0f0", padding: "0.5rem 1rem", borderRadius: 4 },
};
