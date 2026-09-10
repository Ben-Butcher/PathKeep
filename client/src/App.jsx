import React, { useState } from "react";
import LoginContainer from "./pages/LoginContainer";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import students from "./data/students";

export default function App() {
  const [view, setView] = useState("picker");
  const [selectedStudent, setSelectedStudent] = useState(null);

  function handleStudentLogin(student) {
    setSelectedStudent(student);
    setView("student");
  }

  function handleTeacherLogin() {
    setView("teacher");
  }

  function handleLogout() {
    setSelectedStudent(null);
    setView("picker");
  }

  if (view === "student") {
    return (
      <StudentDashboard
        student={selectedStudent || students[0]}
        onLogout={handleLogout}
      />
    );
  }

  if (view === "teacher") {
    return <TeacherDashboard onLogout={handleLogout} />;
  }

  return (
    <LoginContainer
      onStudentLogin={handleStudentLogin}
      onTeacherLogin={handleTeacherLogin}
    />
  );
}
