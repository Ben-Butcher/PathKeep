import React from "react";
import { students } from "../data/students.js";
import { modules } from "../data/modules.js";

function riskBadgeColor(level) {
  if (level === "high") return "bg-red-500/90";
  if (level === "medium") return "bg-amber-500/90";
  return "bg-emerald-500/90";
}

function collectFlagged() {
  const list = [];
  students.forEach((s) => {
    s.modules.forEach((m) => {
      if (m.riskLevel === "high" || m.riskLevel === "medium") {
        list.push({
          studentId: s.id,
          studentName: s.name,
          moduleId: m.moduleId,
          moduleName: m.moduleName,
          riskLevel: m.riskLevel,
          averageScore: m.averageScore,
        });
      }
    });
  });
  return list;
}

function FlaggedStudentsTable({ rows }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5">
      <h3 className="text-white font-medium mb-4">Flagged Students</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-white/60 border-b border-white/10">
              <th className="py-2 pr-4 font-medium">Student</th>
              <th className="py-2 pr-4 font-medium">Module</th>
              <th className="py-2 pr-4 font-medium">Risk</th>
              <th className="py-2 pr-4 font-medium">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0">
                <td className="py-2 pr-4 text-white/90">{r.studentName}</td>
                <td className="py-2 pr-4 text-white/70">{r.moduleName}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`${riskBadgeColor(r.riskLevel)} text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-full capitalize`}
                  >
                    {r.riskLevel}
                  </span>
                </td>
                <td className="py-2 pr-4 text-white/70">{r.averageScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TeacherDashboard({ onLogout }) {
  const rows = collectFlagged();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-10 flex flex-col gap-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Teacher Dashboard
        </h2>
        <button
          onClick={onLogout}
          className="rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 transition-colors"
        >
          Logout
        </button>
      </header>

      <section>
        <FlaggedStudentsTable rows={rows} />
      </section>

      <section>
        <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wide mb-3">
          Modules Summary
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map((mod) => (
            <div
              key={mod.moduleId}
              className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4"
            >
              <div className="text-white font-medium mb-2">
                {mod.moduleName}
              </div>
              <div className="text-sm text-white/60 flex flex-col gap-1">
                <span>Lecturer: {mod.lecturer}</span>
                <span>Students: {mod.totalStudents}</span>
                <span>At-risk: {mod.atRiskCount}</span>
                <span>Avg: {mod.averageClassScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
