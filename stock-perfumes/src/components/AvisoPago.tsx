import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

/** Cuánto queda a la vista antes de irse solo. */
const DURACION = 3000;
/** Tiene que coincidir con la animación .aviso-pago-sale del CSS. */
const SALIDA = 260;

/**
 * Se muestra una sola vez por entrada a la app: al recargar o volver a abrir
 * vuelve a aparecer, pero navegar dentro de la app no lo repite.
 */
let yaSeMostro = false;

export default function AvisoPago() {
  const [visible, setVisible] = useState(() => AVISO.activo && !yaSeMostro);
  const [saliendo, setSaliendo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // El header es sticky: le avisamos cuánto mide el aviso para que no se tape.
  useLayoutEffect(() => {
    const alto = visible && !saliendo ? ref.current?.offsetHeight ?? 0 : 0;
    document.documentElement.style.setProperty("--aviso-alto", `${alto}px`);
  }, [visible, saliendo]);

  // A los 3 segundos arranca a irse solo.
  useEffect(() => {
    if (!visible || saliendo) return;
    const t = setTimeout(() => setSaliendo(true), DURACION);
    return () => clearTimeout(t);
  }, [visible, saliendo]);

  // Terminada la animación de salida, se desmonta y no vuelve hasta recargar.
  useEffect(() => {
    if (!saliendo) return;
    const t = setTimeout(() => {
      yaSeMostro = true;
      setVisible(false);
    }, SALIDA);
    return () => clearTimeout(t);
  }, [saliendo]);

  if (!visible) return null;

  const copiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(AVISO.alias);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div
      className={`aviso-pago ${saliendo ? "aviso-pago-sale" : "aviso-pago-entra"}`}
      ref={ref}
      role="status"
    >
      <div className="aviso-pago-caja">
        <div className="aviso-pago-cabecera">
          <strong>Pago pendiente</strong>
          <button
            className="aviso-pago-cerrar"
            onClick={() => setSaliendo(true)}
            aria-label="Cerrar aviso"
          >
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
      </div>
    </div>
  );
}
