// Statistiche per categoria: barre proporzionali CSS, senza librerie di grafici.
// Prop: stats — array di { category: string, count: number } da GET /stats/categories

export default function Stats({ stats }) {
  if (stats.length === 0) {
    return (
      <section>
        <h2>Statistiche</h2>
        <p style={{ color: "#888" }}>Nessun documento ancora classificato.</p>
      </section>
    );
  }

  const total = stats.reduce((sum, s) => sum + s.count, 0); // denominatore per le percentuali

  return (
    <section>
      <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" }}>Statistiche per categoria</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Categoria</th>
            <th style={styles.th}>Documenti</th>
            <th style={styles.th}>%</th>
            <th style={styles.th}>Distribuzione</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => {
            const pct = ((s.count / total) * 100).toFixed(1);
            return (
              <tr key={s.category}>
                <td style={styles.td}>{s.category}</td>
                <td style={styles.td}>{s.count}</td>
                <td style={styles.td}>{pct}%</td>
                <td style={{ ...styles.td, width: 200 }}>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${pct}%` }} />
                  </div>
                </td>
              </tr>
            );
          })}

          <tr style={{ fontWeight: 600 }}>
            <td style={styles.td}>Totale</td>
            <td style={styles.td}>{total}</td>
            <td style={styles.td}>100%</td>
            <td style={styles.td} />
          </tr>
        </tbody>
      </table>
    </section>
  );
}

const styles = {
  table:  { borderCollapse: "collapse", fontSize: "0.9rem", minWidth: 400 },
  th:     { textAlign: "left", padding: "0.5rem 0.75rem", borderBottom: "2px solid #ddd" },
  td:     { padding: "0.45rem 0.75rem", borderBottom: "1px solid #eee" },
  barBg:  { background: "#e9ecef", borderRadius: 4, height: 14, overflow: "hidden" },
  barFill:{ background: "#0d6efd", height: "100%", borderRadius: 4, transition: "width 0.3s" },
};
