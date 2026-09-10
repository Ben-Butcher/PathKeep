import StudentLogin from "../components/Login";
import students from "../data/students";
import "../css/LoginContainer.css";

export default function LoginContainer({ onStudentLogin, onTeacherLogin }) {
  return (
    <main className="login-pick-container">
      <h2>Pick your user</h2>
      <div className="login-list">
        <div className="students-column">
          {students.map((s) => (
            <StudentLogin
              key={s.id}
              name={s.name}
              onLogin={() => onStudentLogin && onStudentLogin(s)}
            />
          ))}
        </div>

        <div className="teacher-column">
          <div
            className="teacher-card"
            role="button"
            tabIndex={0}
            onClick={() => onTeacherLogin && onTeacherLogin()}
          >
            <div className="teacher-card-inner">
              <h3>Login as Teacher</h3>
              <p>Access class summaries and flagged students</p>
              <button className="login-btn" type="button">
                Enter
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
