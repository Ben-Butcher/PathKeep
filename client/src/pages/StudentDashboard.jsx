import React, { useEffect, useState } from "react";
import { students } from "../data/students";
import geminiService from "../services/geminiService";

function riskColor(level) {
  if (level === "high") return "bg-red-500/90";
  if (level === "medium") return "bg-amber-500/90";
  return "bg-emerald-500/90";
}

function ModuleFlagCard({ mod }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 flex items-center justify-between">
      <div>
        <div className="text-white font-medium">{mod.moduleName}</div>
        <div className="text-sm text-white/60 flex gap-4 mt-1">
          <span>Score: {mod.averageScore}%</span>
          <span>Attendance: {mod.attendanceRate}%</span>
        </div>
      </div>
      <span
        className={`${riskColor(mod.riskLevel)} text-slate-900 text-xs font-semibold px-3 py-1 rounded-full capitalize`}
      >
        {mod.riskLevel}
      </span>
    </div>
  );
}

function StudyTimetable({ modules }) {
  const slotFor = (r) => (r === "high" ? 3 : r === "medium" ? 2 : 1);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const slots = [];
  modules.forEach((m) => {
    const count = slotFor(m.riskLevel);
    for (let i = 0; i < count; i++) slots.push(m.moduleName);
  });

  const dayMap = days.reduce((acc, d) => ({ ...acc, [d]: [] }), {});
  slots.forEach((modName, idx) => {
    const day = days[idx % days.length];
    dayMap[day].push(modName);
  });

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5">
      <h4 className="text-white font-medium mb-4">
        Suggested Weekly Study Timetable
      </h4>
      <div className="grid grid-cols-5 gap-3">
        {days.map((d) => (
          <div key={d} className="flex flex-col gap-2">
            <div className="text-white/70 text-sm font-semibold text-center">
              {d}
            </div>
            <ul className="flex flex-col gap-1">
              {dayMap[d].map((m, i) => (
                <li
                  key={i}
                  className="text-xs text-white/80 bg-white/10 rounded-md px-2 py-1 text-center"
                >
                  {m}
                </li>
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
    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5">
      <h4 className="text-white font-medium mb-3">AI Recommendations</h4>
      {loading && (
        <div className="text-white/60 text-sm">Loading suggestions...</div>
      )}
      {error && <div className="text-red-300 text-sm">{error}</div>}
      {!loading && !error && suggestions.length === 0 && (
        <div className="text-white/60 text-sm">
          No tailored suggestions available.
        </div>
      )}
      {!loading && suggestions.length > 0 && (
        <ul className="flex flex-col gap-2">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="text-sm text-white/90 bg-indigo-400/10 border border-indigo-400/20 rounded-lg px-3 py-2"
            >
              {s}
            </li>
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-10 flex flex-col gap-8 max-w-4xl mx-auto">
      <header>
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          {student.name}'s Dashboard
        </h2>
      </header>

      <section>
        <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wide mb-3">
          Modules
        </h3>
        <div className="grid gap-3">
          {student.modules.map((m) => (
            <ModuleFlagCard key={m.moduleId} mod={m} />
          ))}
        </div>
      </section>

      <section>
        <StudyTimetable modules={student.modules} />
      </section>

      <section>
        <AIRecommendations flaggedModules={flagged} />
      </section>
    </main>
  );
}
