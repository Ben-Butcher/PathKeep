import React from "react";
import students from "../data/students";
import modules from "../data/modules";
import "../css/TeacherDashboard.css";

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
    <div className="flagged-table">
      <h3>Flagged Students</h3>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Module</th>
            <th>Risk</th>
            <th>Avg Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.studentName}</td>
              <td>{r.moduleName}</td>
              <td>{r.riskLevel}</td>
              <td>{r.averageScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TeacherDashboard({ onLogout }) {
  const rows = collectFlagged();

  return (
    <main className="teacher-dashboard">
      <header className="td-header">
        <h2>Teacher Dashboard</h2>
        <button onClick={onLogout}>Logout</button>
      </header>

      <section className="flagged-section">
        <FlaggedStudentsTable rows={rows} />
      </section>

      <section className="modules-summary-section">
        <h3>Modules Summary</h3>
        <div className="modules-summary">
          {modules.map((mod) => (
            <div key={mod.moduleId} className="module-summary">
              <div className="module-name">{mod.moduleName}</div>
              <div>Lecturer: {mod.lecturer}</div>
              <div>Students: {mod.totalStudents}</div>
              <div>At-risk: {mod.atRiskCount}</div>
              <div>Avg: {mod.averageClassScore}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
