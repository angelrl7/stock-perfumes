import { useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Se muestra una sola vez, cuando la cuenta todavía no tiene nombre.
 * Guarda el nombre en los metadatos del usuario de Supabase.
 */
export default function NombreForm() {
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    const limpio = nombre.trim();
    if (!limpio) return;
    setCargando(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ data: { nombre: limpio } });
    if (error) {
      setError(error.message);
      setCargando(false);
    }
    // Si salió bien, App recibe el usuario actualizado y pasa al panel solo.
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-marca">
          <span className="login-flor">✦</span>
          <h1>¡Bienvenido/a!</h1>
          <p>Decinos tu nombre: va a aparecer en los tickets de venta y en los productos que cargues.</p>
        </div>

        <label className="campo">
          <span>Tu nombre</span>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guardar()}
            placeholder="Ej: Matías"
            autoFocus
          />
        </label>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primario" onClick={guardar} disabled={cargando || !nombre.trim()}>
          {cargando ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
