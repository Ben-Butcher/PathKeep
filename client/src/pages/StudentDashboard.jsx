import React, { useEffect, useState } from "react";
import students from "../data/students";
import geminiService from "../services/geminiService";
import "../css/StudentDashboard.css";

function riskColor(level) {
  if (level === "high") return "#e24b4b";
  if (level === "medium") return "#f39c12";
  return "#2ecc71";
}

function ModuleFlagCard({ mod }) {
  return (
    <div className="module-card">
      <div className="module-card-left">
        <div className="module-name">{mod.moduleName}</div>
        <div className="module-meta">
          <span>Score: {mod.averageScore}%</span>
          <span>Attendance: {mod.attendanceRate}%</span>
        </div>
      </div>
      <div className="module-card-right">
        <span
          className="risk-badge"
          style={{ background: riskColor(mod.riskLevel) }}
        >
          {mod.riskLevel}
        </span>
      </div>
    </div>
  );
}

function StudyTimetable({ modules }) {
  // Simple allocation: high=3, medium=2, low=1 slots per week
  const slotFor = (r) => (r === "high" ? 3 : r === "medium" ? 2 : 1);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Build a flat list of module slots
  const slots = [];
  modules.forEach((m) => {
    const count = slotFor(m.riskLevel);
    for (let i = 0; i < count; i++) slots.push(m.moduleName);
  });

  // Distribute round-robin to days
  const dayMap = days.reduce((acc, d) => ({ ...acc, [d]: [] }), {});
  slots.forEach((modName, idx) => {
    const day = days[idx % days.length];
    dayMap[day].push(modName);
  });

  return (
    <div className="timetable">
      <h4>Suggested Weekly Study Timetable</h4>
      <div className="timetable-grid">
        {days.map((d) => (
          <div key={d} className="timetable-day">
            <div className="timetable-day-name">{d}</div>
            <ul>
              {dayMap[d].map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIRecommendations({ flaggedModules }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchSuggestions() {
      if (!flaggedModules || flaggedModules.length === 0) return;
      setLoading(true);
      setError(null);
      try {
        const s = await geminiService.getInterventionSuggestions(
          flaggedModules,
          { timeout: 12000 },
        );
        if (!mounted) return;
        setSuggestions(s);
      } catch (err) {
        if (!mounted) return;
        console.error("AIRecommendations error", err);
        setError("AI suggestions currently unavailable");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSuggestions();
    return () => {
      mounted = false;
    };
  }, [flaggedModules]);

  return (
    <div className="ai-recommendations">
      <h4>AI Recommendations</h4>
      {loading && <div>Loading suggestions...</div>}
      {error && <div className="ai-error">{error}</div>}
      {!loading && !error && suggestions.length === 0 && (
        <div>No tailored suggestions available.</div>
      )}
      {!loading && suggestions.length > 0 && (
        <ul>
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function StudentDashboard({ student: propStudent }) {
  const student = propStudent || students[0];
  const flagged = student.modules.filter(
    (m) => m.riskLevel === "high" || m.riskLevel === "medium",
  );

  return (
    <main className="student-dashboard">
      <header className="sd-header">
        <h2>{student.name}'s Dashboard</h2>
      </header>

      <section className="modules-section">
        <h3>Modules</h3>
        <div className="modules-list">
          {student.modules.map((m) => (
            <ModuleFlagCard key={m.moduleId} mod={m} />
          ))}
        </div>
      </section>

      <section className="timetable-section">
        <StudyTimetable modules={student.modules} />
      </section>

      <section className="ai-section">
        <AIRecommendations flaggedModules={flagged} />
      </section>
    </main>
  );
}
