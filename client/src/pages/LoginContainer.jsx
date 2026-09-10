import StudentLogin from "../components/Login";
import { students } from "../data/students";
//import "../css/LoginContainer.css";

export default function LoginContainer({ onStudentLogin, onTeacherLogin }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <h2 className="text-2xl font-semibold text-white tracking-tight">
        Pick your user
      </h2>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        <div className="flex-1 grid gap-4">
          {students.map((s) => (
            <StudentLogin
              key={s.id}
              name={s.name}
              onLogin={() => onStudentLogin && onStudentLogin(s)}
            />
          ))}
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => onTeacherLogin && onTeacherLogin()}
          className="flex-1 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 flex flex-col justify-center items-start gap-3 cursor-pointer hover:bg-white/15 transition-colors"
        >
          <h3 className="text-lg font-medium text-white">Login as Teacher</h3>
          <p className="text-sm text-white/60">
            Access class summaries and flagged students
          </p>
          <button
            type="button"
            className="mt-2 rounded-lg bg-indigo-400/90 hover:bg-indigo-400 text-slate-900 font-medium px-4 py-2 text-sm transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    </main>
  );
}
