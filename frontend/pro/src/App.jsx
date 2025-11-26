// /mnt/data/App.jsx
import React, { useState, useEffect } from 'react';
import { predictSeverity } from './api';
import './styles.css';

/*
  IMPORTANT:
  - This UI expects the model server to return:
    {
      prediction: <int 0..3>,
      probabilities: [p0, p1, p2, p3],   // floats summing ~1 or close
      explanation: { feature_importances: [ ... ] }   // optional
    }
  If your backend returns different shapes, adapt accordingly.
*/

const SEVERITY_LABELS = ['Minor', 'Moderate', 'Serious', 'Fatal'];
const SEVERITY_COLORS = ['severity-low', 'severity-medium', 'severity-high', 'severity-high'];

const weatherIcons = {
  clear: '☀️',
  rain: '🌧️',
  fog: '🌫️',
  snow: '❄️',
  other: '🌤️'
};

const getSeverityClass = (predictionIndex) => {
  if (predictionIndex == null || Number.isNaN(predictionIndex)) return 'severity-badge';
  const idx = Number(predictionIndex);
  return SEVERITY_COLORS[idx] ? `severity-badge ${SEVERITY_COLORS[idx]}` : 'severity-badge';
};

const getSafetyRecommendations = (predIndex, probabilities) => {
  if (predIndex == null || !Array.isArray(probabilities)) return null;
  const idx = Number(predIndex);
  const label = SEVERITY_LABELS[idx] || 'Unknown';
  const probPct = Math.round((probabilities[idx] || 0) * 100);

  if (idx >= 2) { // Serious or Fatal
    return {
      message: '⚠️ High Risk - Exercise Extreme Caution',
      details: `Predicted: ${label} (${probPct}%). Avoid non-essential travel. If you must travel, drive very cautiously.`,
      icon: '🚨',
      tips: [
        'Avoid driving if possible',
        'Turn on headlights and reduce speed',
        'Increase following distance',
        'Allow extra time for your trip',
        'Call for assistance earlier for any problems'
      ]
    };
  } else if (idx === 1) {
    return {
      message: '⚠️ Moderate Risk - Stay Alert',
      details: `Predicted: ${label} (${probPct}%). Drive cautiously and keep safe distance.`,
      icon: '🚧',
      tips: [
        'Stay focused and avoid distractions',
        'Keep a safe distance',
        'Slow down around corners and intersections',
        'Watch for pedestrians and cyclists'
      ]
    };
  } else {
    return {
      message: '✅ Low Risk - Conditions likely safe',
      details: `Predicted: ${label} (${probPct}%). Normal caution is recommended.`,
      icon: '✅',
      tips: [
        'Maintain speed within limits',
        'Stay alert for hazards',
        'Keep regular vehicle maintenance'
      ]
    };
  }
};

export default function AccidentSeverityPredictor() {
  const [form, setForm] = useState({
    hour: new Date().getHours(),
    visibility: 10,
    weather: 'clear',
    rush_hour: 0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // handle slider / control updates
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) :
              (type === 'range' || type === 'number') ? Number(value) : value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setResult(null);
    try {
      // backend accepts hour, visibility, weather, rush_hour (we supply defaults server-side too)
      const payload = {
        hour: form.hour,
        visibility: form.visibility,
        weather: form.weather,
        rush_hour: form.rush_hour
      };
      const data = await predictSeverity(payload);
      // ensure consistent shapes
      // `data.probabilities` might be an array, or null
      setResult({
        error: data?.error || null,
        prediction: (typeof data?.prediction === 'number') ? data.prediction : null,
        probabilities: Array.isArray(data?.probabilities) ? data.probabilities : null,
        explanation: data?.explanation || null
      });
    } catch (err) {
      console.error(err);
      setResult({ error: err?.response?.data || err?.message || 'Prediction failed' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      hour: new Date().getHours(),
      visibility: 10,
      weather: 'clear',
      rush_hour: 0
    });
    setResult(null);
  };

  // helper to format percent safely
  const pct = (v) => `${Math.round((v || 0) * 100)}%`;

  // compute highest probability index
  const topProbIndex = (probs) => {
    if (!Array.isArray(probs)) return null;
    let max = -1, idx = null;
    probs.forEach((p, i) => { if (p > max) { max = p; idx = i; } });
    return idx;
  };

  // prepare top factors display if feature_importances exist
  const renderTopFactors = (explanation) => {
    if (!explanation) return null;
    const fi = explanation.feature_importances || explanation.feature_importance || null;
    if (!Array.isArray(fi)) return null;

    // show top 5 indices with their importances
    const pairs = fi.map((v, i) => ({ idx: i, val: v }));
    pairs.sort((a,b) => Math.abs(b.val) - Math.abs(a.val));
    const top = pairs.slice(0, 5);

    return (
      <div className="factors-grid">
        {top.map(p => (
          <div key={p.idx} className="factor-card">
            <div className="factor-header">
              <span className="factor-name">Feature #{p.idx}</span>
              <span className={`impact-badge ${p.val > 0 ? 'impact-high' : 'impact-low'}`}>
                {p.val > 0 ? '↑ increases risk' : '↓ decreases risk'}
              </span>
            </div>
            <div className="impact-value">{(Math.abs(p.val)*100).toFixed(2)} importance</div>
          </div>
        ))}
        <small style={{ display:'block', marginTop:8, color:'#6b7280' }}>
          Tip: To show readable names here, update the backend to return <code>feature_names</code>.
        </small>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="container">
        <div className="text-center mb-6 animate-fade-in">
          <h1>Accident Severity Predictor</h1>
          <p className="subtitle">Predict the potential severity of accidents based on current conditions</p>
        </div>

        <div className="form-container">
          <div className="card animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="card-header">
              <h2>🚦 Enter Conditions</h2>
            </div>
            <div className="card-body">
              <form onSubmit={onSubmit} className="form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Time of Day: {new Date().setHours && new Date().setHours(form.hour,0,0,0) && new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</label>
                    <input
                      type="range"
                      name="hour"
                      min="0"
                      max="23"
                      value={form.hour}
                      onChange={handleChange}
                      className="range-slider"
                    />
                    <div className="time-display" style={{ marginTop:6 }}>
                      {(() => {
                        const d = new Date(); d.setHours(form.hour,0,0,0);
                        return d.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
                      })()}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Visibility ({form.visibility} mi)</label>
                    <input
                      type="range"
                      name="visibility"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={form.visibility}
                      onChange={handleChange}
                      className="range-slider"
                    />
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="form-label">Weather Conditions</label>
                    <div className="weather-options" style={{ display:'flex', gap:10 }}>
                      {Object.entries(weatherIcons).map(([key, icon]) => (
                        <label key={key} className={`weather-option ${form.weather === key ? 'selected' : ''}`} style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
                          <input
                            type="radio"
                            name="weather"
                            value={key}
                            checked={form.weather === key}
                            onChange={handleChange}
                            style={{ display:'none' }}
                          />
                          <span style={{ fontSize:20 }}>{icon}</span>
                          <span style={{ textTransform:'capitalize' }}>{key}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        name="rush_hour"
                        checked={!!form.rush_hour}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-label">Rush Hour Traffic</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop:16 }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Predicting...' : 'Predict Severity'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ marginLeft:8 }}>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          {result && (
            <div className="card results-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="card-header">
                <h2>📊 Prediction Results</h2>
              </div>
              <div className="card-body">
                {result.error ? (
                  <div className="alert alert-error">
                    <div className="alert-icon">⚠️</div>
                    <div className="alert-content">
                      <p>{String(result.error)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="results-content">
                    <div className="severity-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <h3>Predicted Severity</h3>
                        <p>Model confidence and recommendations below</p>
                      </div>

                      <div style={{ textAlign:'right' }}>
                        <div className={getSeverityClass(result.prediction)} style={{ padding:'0.5rem 1rem' }}>
                          <strong>{SEVERITY_LABELS[result.prediction] || 'Unknown'}</strong>
                        </div>
                        <div style={{ marginTop:8, color:'#6b7280' }}>
                          (Model class #{result.prediction})
                        </div>
                      </div>
                    </div>

                    {/* Safety Recommendations */}
                    {result.probabilities && (
                      <div className="safety-recommendations" style={{ marginTop:16 }}>
                        <div className="safety-header" style={{ display:'flex', gap:12, alignItems:'center' }}>
                          <div style={{ fontSize:28 }}>
                            {getSafetyRecommendations(result.prediction, result.probabilities)?.icon}
                          </div>
                          <div>
                            <h4 style={{ marginBottom:6 }}>{getSafetyRecommendations(result.prediction, result.probabilities)?.message}</h4>
                            <p style={{ color:'#6b7280' }}>{getSafetyRecommendations(result.prediction, result.probabilities)?.details}</p>
                          </div>
                        </div>

                        <div style={{ marginTop:12 }}>
                          <h5>Safety Tips</h5>
                          <ul>
                            {getSafetyRecommendations(result.prediction, result.probabilities)?.tips.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Probability Distribution */}
                    <div className="probability-section" style={{ marginTop:20 }}>
                      <h4>Probability Distribution</h4>
                      <div className="probability-bars" style={{ marginTop:10 }}>
                        {Array.isArray(result.probabilities) ? (
                          result.probabilities.map((p, i) => {
                            const percentage = Math.round((p || 0) * 100);
                            const highest = topProbIndex(result.probabilities) === i;
                            const barClass = i >= 2 ? 'progress-high' : i === 1 ? 'progress-medium' : 'progress-low';
                            return (
                              <div key={i} className="probability-item" style={{ marginBottom:10 }}>
                                <div className="probability-header" style={{ display:'flex', justifyContent:'space-between' }}>
                                  <span className="severity-name">{SEVERITY_LABELS[i]}</span>
                                  <span className="probability-value" style={{ fontWeight: highest ? 700 : 500 }}>{percentage}%</span>
                                </div>
                                <div className="progress-container" style={{ marginTop:6 }}>
                                  <div className={`progress-bar ${barClass}`} style={{ width: `${percentage}%` }} />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p style={{ color:'#6b7280' }}>Probabilities not available</p>
                        )}
                      </div>
                    </div>

                    {/* Key factors */}
                    <div style={{ marginTop:18 }}>
                      <h4>Key Factors</h4>
                      {renderTopFactors(result.explanation) || <p style={{ color:'#6b7280' }}>No factor importances available.</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!result && (
            <div className="alert alert-info animate-fade-in" style={{ animationDelay: '0.3s', marginTop:12 }}>
              <div className="alert-icon">ℹ️</div>
              <div className="alert-content">
                <h3>Safety First</h3>
                <p>This tool predicts accident severity based on current conditions. Always drive carefully and follow all traffic laws.</p>
              </div>
            </div>
          )}
        </div>

        <footer className="footer" style={{ marginTop:24, textAlign:'center', color:'#6b7280' }}>
          <p>Accident Severity Predictor • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
