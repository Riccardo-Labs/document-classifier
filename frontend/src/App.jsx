// Componente root: gestisce lo stato globale e coordina DocForm, DocTable e Stats.

import { useState, useEffect, useCallback } from "react";
import DocForm from "./components/DocForm";
import DocTable from "./components/DocTable";
import Stats from "./components/Stats";
import { fetchDocuments, fetchStats } from "./api/client";

export default function App() {
  const [documents, setDocuments]           = useState([]);
  const [stats, setStats]                   = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [loadError, setLoadError]           = useState("");

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

  useEffect(() => { loadData(); }, [loadData]);

  function handleFilterChange(category) {
    setFilterCategory(category);
    loadData(category);
  }

  function handleClassified(newDoc) {
    setDocuments((prev) => [newDoc, ...prev]);
    fetchStats().then(setStats).catch(() => {});
  }

  function handleReviewed(updatedDoc) {
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.title}>Document Classifier</h1>
          <p style={styles.subtitle}>Classifica automaticamente i documenti aziendali con ML locale</p>
        </div>
      </header>

      <main style={styles.main}>
        {loadError && <p style={styles.error}>Errore di connessione: {loadError}</p>}

        <div style={styles.card}>
          <DocForm onClassified={handleClassified} />
        </div>

        <div style={styles.card}>
          <Stats stats={stats} />
        </div>

        <div style={styles.card}>
          <DocTable
            documents={documents}
            filterCategory={filterCategory}
            onFilterChange={handleFilterChange}
            onReviewed={handleReviewed}
          />
        </div>
      </main>
    </div>
  );
}

const styles = {
  page:        { minHeight: "100vh", background: "#f8f9fa", fontFamily: "system-ui, sans-serif" },
  header:      { background: "#1e293b", color: "#fff", padding: "1.5rem 1rem" },
  headerInner: { maxWidth: 1000, margin: "0 auto" },
  title:       { margin: 0, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.5px" },
  subtitle:    { margin: "0.3rem 0 0", color: "#94a3b8", fontSize: "0.95rem" },
  main:        { maxWidth: 1000, margin: "0 auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  card:        { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  error:       { color: "#842029", background: "#f8d7da", padding: "0.5rem 1rem", borderRadius: 6, border: "1px solid #f5c2c7" },
};
