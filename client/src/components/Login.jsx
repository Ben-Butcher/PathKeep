import "../css/StudentLogin.css";
import img from "../assets/user.png";

export default function StudentLogin({ name, onLogin }) {
  return (
    <div
      onClick={onLogin}
      className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 flex items-center gap-4 cursor-pointer hover:bg-white/15 transition-colors"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 shrink-0">
        <img
          src={img}
          alt="user avatar"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-medium">Welcome back {name}</h3>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onLogin?.();
        }}
        className="rounded-lg bg-indigo-400/90 hover:bg-indigo-400 text-slate-900 font-medium px-3 py-1.5 text-sm transition-colors"
      >
        Login
      </button>
    </div>
  );
}
