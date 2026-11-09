import { useState ,type ChangeEvent,type SyntheticEvent} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface AuthPageProps{
  mode: "login" | "register";
}
export default function AuthPage({ mode }:AuthPageProps) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e:ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e:SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>TaskFlow</h1>
        <p className="muted">{isLogin ? "Welcome back. Log in to continue." : "Create an account to get started."}</p>

        {!isLogin && (
          <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        )}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={onChange}
          minLength={6}
          required
        />

        {error && <p className="error">{error}</p>}

        <button className="btn" disabled={busy}>
          {busy ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
        </button>

        <p className="muted small">
          {isLogin ? "No account yet? " : "Already have an account? "}
          <Link to={isLogin ? "/register" : "/login"}>{isLogin ? "Sign up" : "Log in"}</Link>
        </p>
      </form>
    </div>
  );
}
