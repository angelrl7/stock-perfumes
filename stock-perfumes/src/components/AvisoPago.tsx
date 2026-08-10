import { useLayoutEffect, useRef, useState } from "react";

/* ============================================
   Configurá el aviso acá y listo.
   - activo: false lo apaga por completo (cuando esté pago).
   - alias / contacto: "" para ocultar esa línea.
   ============================================ */
const AVISO = {
  activo: true,
  alias: "",
  contacto: "",
};

const CLAVE = "aviso-pago-minimizado";

export default function AvisoPago() {
  const [minimizado, setMinimizado] = useState(
    () => sessionStorage.getItem(CLAVE) === "1"
  );
  const [copiado, setCopiado] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // El header es sticky: le avisamos cuánto mide el aviso para que no se tape.
  useLayoutEffect(() => {
    const alto = ref.current?.offsetHeight ?? 0;
    document.documentElement.style.setProperty("--aviso-alto", `${alto}px`);
  }, [minimizado]);

  if (!AVISO.activo) return null;

  const ocultar = () => {
    sessionStorage.setItem(CLAVE, "1");
    setMinimizado(true);
  };

  const mostrar = () => {
    sessionStorage.removeItem(CLAVE);
    setMinimizado(false);
  };

  const copiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(AVISO.alias);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  if (minimizado) {
    return (
      <div className="aviso-pago aviso-pago-min" ref={ref}>
        <button className="aviso-pago-strip" onClick={mostrar}>
          <span className="aviso-pago-punto" aria-hidden="true" />
          Pago pendiente del sistema
          <span className="aviso-pago-ver">Ver</span>
        </button>
      </div>
    );
  }

  return (
    <div className="aviso-pago" ref={ref}>
      <div className="aviso-pago-caja">
        <div className="aviso-pago-cabecera">
          <strong>Pago pendiente</strong>
          <button className="aviso-pago-cerrar" onClick={ocultar} aria-label="Ocultar aviso">
            ✕
          </button>
        </div>

        <p className="aviso-pago-texto">
          Hola 👋 Te recuerdo que sigue pendiente el pago por el desarrollo del sistema.
          Cuando se efectúe el pago, este mensaje se desactivará.
        </p>

        {AVISO.alias && (
          <div className="aviso-pago-alias">
            <span>
              Alias: <strong>{AVISO.alias}</strong>
            </span>
            <button className="aviso-pago-copiar" onClick={copiarAlias}>
              {copiado ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        )}

        {AVISO.contacto && (
          <p className="aviso-pago-contacto">Cualquier duda, escribime: {AVISO.contacto}</p>
        )}

        <button className="aviso-pago-ocultar" onClick={ocultar}>
          Ocultar por ahora
        </button>
      </div>
    </div>
  );
}