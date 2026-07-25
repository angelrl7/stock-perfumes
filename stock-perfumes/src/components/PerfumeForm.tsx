import { useState } from "react";
import type { Perfume, PerfumeInput } from "../types";
import { formatoARS, precioMayorista, precioSugerido } from "../lib/precio";
import { borrarFoto, comprimirImagen, subirFoto } from "../lib/fotos";

interface Props {
  perfume?: Perfume; // si viene, es edición
  onGuardar: (datos: PerfumeInput) => Promise<void>;
  onEliminar?: () => Promise<void>;
  onCerrar: () => void;
}

export default function PerfumeForm({ perfume, onGuardar, onEliminar, onCerrar }: Props) {
  const [nombre, setNombre] = useState(perfume?.nombre ?? "");
  const [marca, setMarca] = useState(perfume?.marca ?? "");
  const [precioCompra, setPrecioCompra] = useState(String(perfume?.precio_compra ?? ""));
  const [margen, setMargen] = useState(String(perfume?.margen ?? 80));
  const [precioManual, setPrecioManual] = useState(
    perfume?.precio_manual ? String(perfume.precio_manual) : ""
  );
  const [stock, setStock] = useState(String(perfume?.stock ?? 0));
  const [stockMinimo, setStockMinimo] = useState(String(perfume?.stock_minimo ?? 1));
  const [fotoUrl, setFotoUrl] = useState<string | null>(perfume?.foto_url ?? null);
  const [fotoNueva, setFotoNueva] = useState<Blob | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(perfume?.foto_url ?? null);
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  const numeros = {
    precio_compra: parseFloat(precioCompra) || 0,
    margen: parseFloat(margen) || 0,
    precio_manual: precioManual ? parseFloat(precioManual) : null,
  };
  const vistaPrevia = precioSugerido(numeros);
  const vistaPreviaMayorista = precioMayorista(numeros);

  const elegirFoto = async (archivo: File | undefined) => {
    if (!archivo) return;
    setProcesandoFoto(true);
    setError(null);
    try {
      const blob = await comprimirImagen(archivo);
      if (fotoPreview && fotoPreview !== perfume?.foto_url) {
        URL.revokeObjectURL(fotoPreview);
      }
      setFotoNueva(blob);
      setFotoPreview(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la foto.");
    } finally {
      setProcesandoFoto(false);
    }
  };

  const quitarFoto = () => {
    if (fotoPreview && fotoPreview !== perfume?.foto_url) {
      URL.revokeObjectURL(fotoPreview);
    }
    setFotoNueva(null);
    setFotoUrl(null);
    setFotoPreview(null);
  };

  const guardar = async () => {
    if (!nombre.trim()) {
      setError("Poné un nombre para el producto.");
      return;
    }
    setGuardando(true);
    setError(null);
    let fotoSubida: string | null = null;
    try {
      let foto = fotoUrl;
      if (fotoNueva) {
        fotoSubida = await subirFoto(fotoNueva);
        foto = fotoSubida;
      }
      await onGuardar({
        nombre: nombre.trim(),
        marca: marca.trim(),
        precio_compra: numeros.precio_compra,
        margen: numeros.margen,
        precio_manual: numeros.precio_manual,
        stock: parseInt(stock) || 0,
        stock_minimo: parseInt(stockMinimo) || 0,
        foto_url: foto,
      });
      onCerrar();
    } catch (e) {
      // Si la foto se subió pero el guardado falló, la limpiamos del Storage.
      if (fotoSubida) await borrarFoto(fotoSubida);
      setError(e instanceof Error ? e.message : "Error al guardar.");
      setGuardando(false);
    }
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cabecera">
          <h2>{perfume ? "Editar producto" : "Nuevo producto"}</h2>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="campo">
          <span>Foto (opcional)</span>
          {fotoPreview ? (
            <div className="foto-preview">
              <img src={fotoPreview} alt="Foto del producto" />
              <div className="foto-preview-acciones">
                <label className="btn-chico">
                  Cambiar
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => elegirFoto(e.target.files?.[0])}
                  />
                </label>
                <button className="btn-texto-rojo" onClick={quitarFoto}>
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <label className="foto-boton">
              {procesandoFoto ? "Procesando…" : "📷 Sacar o elegir foto"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={procesandoFoto}
                onChange={(e) => elegirFoto(e.target.files?.[0])}
              />
            </label>
          )}
        </div>

        <label className="campo">
          <span>Nombre</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del producto"
            autoFocus
          />
        </label>

        <label className="campo">
          <span>Marca</span>
          <input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Marca del producto" />
        </label>

        <div className="campos-fila">
          <label className="campo">
            <span>Precio de compra</span>
            <input type="number" inputMode="decimal" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} placeholder="0" />
          </label>
          <label className="campo">
            <span>Margen %</span>
            <input type="number" inputMode="decimal" value={margen} onChange={(e) => setMargen(e.target.value)} />
          </label>
        </div>

        <label className="campo">
          <span>Precio manual (opcional, pisa el calculado)</span>
          <input type="number" inputMode="decimal" value={precioManual} onChange={(e) => setPrecioManual(e.target.value)} placeholder="Dejar vacío para usar el margen" />
        </label>

        <p className="vista-previa">
          Precio final: <strong>{formatoARS(vistaPrevia)}</strong>
          {" "}· Mayorista (−20%): <strong>{formatoARS(vistaPreviaMayorista)}</strong>
        </p>

        <div className="campos-fila">
          <label className="campo">
            <span>{perfume ? "Stock (usar ± Stock para movimientos)" : "Stock inicial"}</span>
            <input type="number" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} disabled={!!perfume} />
          </label>
          <label className="campo">
            <span>Stock mínimo</span>
            <input type="number" inputMode="numeric" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
          </label>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {perfume && onEliminar && (
          <div className="zona-borrado">
            {confirmarBorrado ? (
              <div className="confirmar-borrado">
                <span>¿Seguro? Se borra el producto y no se puede deshacer.</span>
                <button className="btn-chico btn-rojo" onClick={onEliminar}>Sí, borrar</button>
                <button className="btn-chico" onClick={() => setConfirmarBorrado(false)}>No</button>
              </div>
            ) : (
              <button className="btn-texto-rojo" onClick={() => setConfirmarBorrado(true)}>
                Borrar producto
              </button>
            )}
          </div>
        )}

        <div className="modal-botones modal-botones-fijo">
          <button className="btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button className="btn-primario" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
