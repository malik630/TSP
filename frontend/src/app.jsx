import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function App() {
  const [n, setN] = useState(6);
  const [distanceMatrix, setDistanceMatrix] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);

  // Load example graph from backend
  const loadExample = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/example`);
      setDistanceMatrix(response.data.distance_matrix);
      setN(response.data.n);
      setResults(null);
    } catch (error) {
      alert("Erreur lors du chargement de l'exemple: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate random graph from backend
  const generateRandom = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/generate`, { n });
      setDistanceMatrix(response.data.distance_matrix);
      setResults(null);
    } catch (error) {
      alert("Erreur lors de la génération: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const solveTSP = async () => {
    if (!distanceMatrix) {
      alert("Veuillez d'abord générer ou charger un graphe");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/solve`, {
        distance_matrix: distanceMatrix,
      });
      setResults(response.data.results);
    } catch (error) {
      alert("Erreur lors de la résolution: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const runBenchmark = async () => {
    try {
      setBenchmarkLoading(true);
      const response = await axios.post(`${API_URL}/benchmark`, {
        start_n: 3,
        end_n: Math.min(n, 10),
      });
      setBenchmarkResults(response.data.results);
    } catch (error) {
      alert("Erreur lors du benchmark: " + error.message);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  const updateMatrix = (i, j, value) => {
    const newMatrix = distanceMatrix.map((row) => [...row]);
    newMatrix[i][j] = parseInt(value) || 0;
    newMatrix[j][i] = parseInt(value) || 0;
    setDistanceMatrix(newMatrix);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Problème du Voyageur de Commerce</h1>
        <p style={styles.subtitle}>
          Comparaison: Méthode Exacte vs Bellman-Held-Karp
        </p>
      </header>

      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>
            Nombre de villes (n):
            <input
              type="number"
              min="3"
              max="15"
              value={n}
              onChange={(e) => setN(parseInt(e.target.value))}
              style={styles.input}
            />
          </label>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={loadExample}
            disabled={loading}
            style={styles.button}
          >
            Exemple (n=6)
          </button>
          <button
            onClick={generateRandom}
            disabled={loading}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            Générer Aléatoire
          </button>
          <button
            onClick={solveTSP}
            disabled={loading || !distanceMatrix}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            {loading ? "Calcul..." : "Résoudre TSP"}
          </button>
          <button
            onClick={runBenchmark}
            disabled={benchmarkLoading}
            style={{ ...styles.button, ...styles.buttonWarning }}
          >
            {benchmarkLoading ? "Benchmark..." : "Benchmark"}
          </button>
        </div>
      </div>

      {distanceMatrix && (
        <div style={styles.matrixSection}>
          <h2 style={styles.sectionTitle}>Matrice des distances</h2>
          <div style={styles.matrixContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}></th>
                  {distanceMatrix[0].map((_, i) => (
                    <th key={i} style={styles.th}>
                      V{i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {distanceMatrix.map((row, i) => (
                  <tr key={i}>
                    <th style={styles.th}>V{i}</th>
                    {row.map((cell, j) => (
                      <td key={j} style={styles.td}>
                        {i === j ? (
                          <span style={styles.diagonal}>0</span>
                        ) : i < j ? (
                          <input
                            type="number"
                            value={cell}
                            onChange={(e) => updateMatrix(i, j, e.target.value)}
                            style={styles.cellInput}
                          />
                        ) : (
                          <span>{cell}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results && (
        <div style={styles.resultsSection}>
          <h2 style={styles.sectionTitle}>Résultats</h2>
          <div style={styles.resultsGrid}>
            {results.map((result, idx) => (
              <div key={idx} style={styles.resultCard}>
                <h3 style={styles.resultTitle}>{result.method}</h3>
                <div style={styles.resultDetails}>
                  <div style={styles.resultItem}>
                    <span style={styles.resultLabel}>Coût minimal:</span>
                    <span style={styles.resultValue}>
                      {result.cost.toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.resultItem}>
                    <span style={styles.resultLabel}>Temps d'exécution:</span>
                    <span style={styles.resultValue}>
                      {(result.time * 1000).toFixed(4)} ms
                    </span>
                  </div>
                  <div style={styles.resultItem}>
                    <span style={styles.resultLabel}>Chemin optimal:</span>
                    <span style={styles.resultPath}>
                      {result.path.join(" → ")}
                    </span>
                  </div>
                  {result.paths_explored && (
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Chemins explorés:</span>
                      <span style={styles.resultValue}>
                        {result.paths_explored}
                      </span>
                    </div>
                  )}
                  {result.states_computed && (
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>États calculés:</span>
                      <span style={styles.resultValue}>
                        {result.states_computed}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {results.length === 2 && (
            <div style={styles.comparison}>
              <h3 style={styles.comparisonTitle}>
                ⚡ Comparaison des performances
              </h3>
              <p style={styles.comparisonText}>
                Bellman-Held-Karp est{" "}
                <strong>
                  {(results[0].time / results[1].time).toFixed(2)}x plus rapide
                </strong>{" "}
                que la méthode exacte
              </p>
            </div>
          )}
        </div>
      )}

      {benchmarkResults && (
        <div style={styles.benchmarkSection}>
          <h2 style={styles.sectionTitle}>📊 Résultats du Benchmark</h2>
          <div style={styles.tableContainer}>
            <table style={styles.benchmarkTable}>
              <thead>
                <tr>
                  <th style={styles.benchmarkTh}>n (villes)</th>
                  <th style={styles.benchmarkTh}>Brute Force (ms)</th>
                  <th style={styles.benchmarkTh}>Bellman-Held-Karp (ms)</th>
                  <th style={styles.benchmarkTh}>Accélération</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkResults.map((result, idx) => {
                  const bfMethod = result.methods.find(
                    (m) => m.method === "Brute Force"
                  );
                  const bhkMethod = result.methods.find(
                    (m) => m.method === "Bellman-Held-Karp"
                  );
                  const speedup = bfMethod
                    ? (bfMethod.time / bhkMethod.time).toFixed(2)
                    : "N/A";

                  return (
                    <tr
                      key={idx}
                      style={
                        idx % 2 === 0
                          ? styles.benchmarkTrEven
                          : styles.benchmarkTrOdd
                      }
                    >
                      <td style={styles.benchmarkTd}>{result.n}</td>
                      <td style={styles.benchmarkTd}>
                        {bfMethod ? (bfMethod.time * 1000).toFixed(4) : "N/A"}
                      </td>
                      <td style={styles.benchmarkTd}>
                        {(bhkMethod.time * 1000).toFixed(4)}
                      </td>
                      <td style={styles.benchmarkTd}>
                        {speedup !== "N/A" ? `${speedup}x` : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    color: "#333",
  },
  header: {
    background: "white",
    borderRadius: "15px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#667eea",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
  },
  controls: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  controlGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "1rem",
    fontWeight: "600",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    border: "2px solid #ddd",
    borderRadius: "8px",
    width: "100px",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  button: {
    padding: "12px 24px",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    color: "white",
    background: "#667eea",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  buttonSecondary: {
    background: "#48bb78",
  },
  buttonWarning: {
    background: "#ed8936",
  },
  matrixSection: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "20px",
    color: "#667eea",
  },
  matrixContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px",
    background: "#f7fafc",
    fontWeight: "bold",
    borderBottom: "2px solid #e2e8f0",
  },
  td: {
    padding: "8px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
  },
  diagonal: {
    color: "#cbd5e0",
  },
  cellInput: {
    width: "60px",
    padding: "5px",
    textAlign: "center",
    border: "1px solid #cbd5e0",
    borderRadius: "4px",
  },
  resultsSection: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },
  resultCard: {
    background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
    borderRadius: "12px",
    padding: "20px",
    border: "2px solid #667eea33",
  },
  resultTitle: {
    fontSize: "1.3rem",
    marginBottom: "15px",
    color: "#667eea",
  },
  resultDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  resultItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  resultLabel: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "600",
  },
  resultValue: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#333",
  },
  resultPath: {
    fontSize: "1rem",
    color: "#667eea",
    fontWeight: "600",
    wordBreak: "break-all",
  },
  comparison: {
    background: "linear-gradient(135deg, #48bb7815 0%, #38a16915 100%)",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    border: "2px solid #48bb7833",
  },
  comparisonTitle: {
    fontSize: "1.3rem",
    marginBottom: "10px",
    color: "#38a169",
  },
  comparisonText: {
    fontSize: "1.1rem",
    color: "#333",
  },
  benchmarkSection: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  tableContainer: {
    overflowX: "auto",
  },
  benchmarkTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  benchmarkTh: {
    padding: "15px",
    background: "#667eea",
    color: "white",
    fontWeight: "bold",
    textAlign: "left",
  },
  benchmarkTd: {
    padding: "12px 15px",
    borderBottom: "1px solid #e2e8f0",
  },
  benchmarkTrEven: {
    background: "#f7fafc",
  },
  benchmarkTrOdd: {
    background: "white",
  },
};

export default App;
