// Statistiche per categoria: grafico a torta animato + tabella con barre proporzionali.
// Prop: stats — array di { category: string, count: number } da GET /stats/categories

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Colori coerenti con i badge in DocTable
const COLORS = {
  fattura:               "#3b82f6",
  supporto_tecnico:      "#ec4899",
  richiesta_commerciale: "#10b981",
  reclamo:               "#ef4444",
  altro:                 "#9ca3af",
};

const DEFAULT_COLOR = "#6366f1";

function getColor(category) {
  return COLORS[category] || DEFAULT_COLOR;
}

// Label personalizzata dentro ogni fetta
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null; // non mostra label su fette troppo piccole
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Stats({ stats }) {
  if (stats.length === 0) {
    return (
      <section>
        <h2 style={styles.heading}>Statistiche per categoria</h2>
        <p style={{ color: "#94a3b8" }}>Nessun documento ancora classificato.</p>
      </section>
    );
  }

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  const data = stats.map((s) => ({
    name: s.category,
    value: s.count,
  }));

  return (
    <section>
      <h2 style={styles.heading}>Statistiche per categoria</h2>

      <div style={styles.layout}>
        {/* Grafico a torta */}
        <div style={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                labelLine={false}
                label={CustomLabel}
                animationBegin={0}
                animationDuration={700}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.85rem" }}
              />
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(value) => <span style={{ fontSize: "0.82rem", color: "#374151" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabella */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Categoria", "Doc.", "%", "Distribuzione"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => {
                const pct = ((s.count / total) * 100).toFixed(1);
                return (
                  <tr key={s.category}>
                    <td style={styles.td}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: getColor(s.category), flexShrink: 0 }} />
                        {s.category}
                      </span>
                    </td>
                    <td style={styles.td}>{s.count}</td>
                    <td style={styles.td}>{pct}%</td>
                    <td style={{ ...styles.td, width: 140 }}>
                      <div style={styles.barBg}>
                        <div style={{ ...styles.barFill, width: `${pct}%`, background: getColor(s.category) }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: 700 }}>
                <td style={styles.td}>Totale</td>
                <td style={styles.td}>{total}</td>
                <td style={styles.td}>100%</td>
                <td style={styles.td} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const styles = {
  heading:   { margin: "0 0 1.25rem", fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" },
  layout:    { display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" },
  chartWrap: { flex: "0 0 300px", minWidth: 260 },
  tableWrap: { flex: 1, minWidth: 280, overflowX: "auto" },
  table:     { width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" },
  th:        { textAlign: "left", padding: "0.4rem 0.6rem", borderBottom: "2px solid #e2e8f0", color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" },
  td:        { padding: "0.5rem 0.6rem", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  barBg:     { background: "#e2e8f0", borderRadius: 4, height: 10, overflow: "hidden" },
  barFill:   { height: "100%", borderRadius: 4, transition: "width 0.4s ease" },
};
