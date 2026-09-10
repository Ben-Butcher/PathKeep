import "../css/StudentLogin.css";
import img from "../../public/user.png";
export default function StudentLogin({ name }) {
  return (
    <div className="login-container">
      <div className="avatar-container">
        <img src={img} alt="user avatar" />
      </div>
      <div className="lower-container">
        <h3 className="welcome-text">Welcome Back {name}</h3>
        <button className="login-btn" type="button">
          Login
        </button>
      </div>
    </div>
  );
}
