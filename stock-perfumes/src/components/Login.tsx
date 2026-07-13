import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entrar = async () => {
    if (!email || !password) return;
    setCargando(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : error.message
      );
    }
    setCargando(false);
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-marca">
          <span className="login-flor">✦</span>
          <h1>Stock Productos</h1>
          <p>Ingresá con tu cuenta para ver el inventario</p>
        </div>

        <label className="campo">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="username"
          />
        </label>

        <label className="campo">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
            autoComplete="current-password"
          />
        </label>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primario" onClick={entrar} disabled={cargando}>
          {cargando ? "Entrando…" : "Entrar"}
        </button>
      </div>
    </div>
  );
}
