import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { hoyISO } from "../lib/fecha";
import { borrarFoto } from "../lib/fotos";
import type {
  Movimiento,
  NuevaVenta,
  Perfume,
  PerfumeInput,
  TipoMovimiento,
  Venta,
} from "../types";

export function usePerfumes(usuario: string) {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    const [pRes, mRes, vRes] = await Promise.all([
      supabase.from("perfumes").select("*").order("nombre"),
      supabase
        .from("movimientos")
        .select("*")
        .order("creado_en", { ascending: false })
        .limit(100),
      supabase
        .from("ventas")
        .select("*, pagos(*)")
        .order("creado_en", { ascending: false })
        .limit(200),
    ]);
    if (pRes.error) setError(pRes.error.message);
    else setPerfumes(pRes.data as Perfume[]);
    if (mRes.error) setError(mRes.error.message);
    else setMovimientos(mRes.data as Movimiento[]);
    if (vRes.error) setError(vRes.error.message);
    else
      setVentas(
        (vRes.data as Venta[]).map((v) => ({
          ...v,
          pagos: [...(v.pagos ?? [])].sort((a, b) => a.fecha.localeCompare(b.fecha)),
        }))
      );
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (datos: PerfumeInput) => {
    const { data, error } = await supabase
      .from("perfumes")
      .insert(datos)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const nuevo = data as Perfume;
    if (nuevo.stock > 0) {
      await registrarMovimiento(nuevo.id, nuevo.nombre, "entrada", nuevo.stock);
    }
    await cargar();
  };

  const editar = async (id: string, datos: Partial<PerfumeInput>) => {
    const anterior = perfumes.find((p) => p.id === id);
    const { error } = await supabase.from("perfumes").update(datos).eq("id", id);
    if (error) throw new Error(error.message);
    if (
      anterior?.foto_url &&
      "foto_url" in datos &&
      datos.foto_url !== anterior.foto_url
    ) {
      await borrarFoto(anterior.foto_url);
    }
    await cargar();
  };

  const eliminar = async (id: string) => {
    const perfume = perfumes.find((p) => p.id === id);
    const { error } = await supabase.from("perfumes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    if (perfume?.foto_url) await borrarFoto(perfume.foto_url);
    await cargar();
  };

  const registrarMovimiento = async (
    perfumeId: string,
    perfumeNombre: string,
    tipo: TipoMovimiento,
    cantidad: number
  ) => {
    const { error } = await supabase.from("movimientos").insert({
      perfume_id: perfumeId,
      perfume_nombre: perfumeNombre,
      tipo,
      cantidad,
      usuario,
    });
    if (error) throw new Error(error.message);
  };

  /** Ajusta stock. cantidad positiva = entrada, negativa = venta/salida. */
  const ajustarStock = async (
    perfume: Perfume,
    cantidad: number,
    tipo: TipoMovimiento
  ) => {
    const nuevoStock = perfume.stock + cantidad;
    if (nuevoStock < 0) throw new Error("El stock no puede quedar negativo.");
    const { error } = await supabase
      .from("perfumes")
      .update({ stock: nuevoStock })
      .eq("id", perfume.id);
    if (error) throw new Error(error.message);
    await registrarMovimiento(perfume.id, perfume.nombre, tipo, Math.abs(cantidad));
    await cargar();
  };

  /** Venta a un cliente: crea la venta, descuenta stock y registra el primer pago. */
  const crearVenta = async (perfume: Perfume, datos: NuevaVenta) => {
    const nuevoStock = perfume.stock - datos.cantidad;
    if (nuevoStock < 0) throw new Error("No hay stock suficiente.");

    const { data, error } = await supabase
      .from("ventas")
      .insert({
        perfume_id: perfume.id,
        perfume_nombre: perfume.nombre,
        cliente: datos.cliente,
        cantidad: datos.cantidad,
        total: datos.total,
        tipo_pago: datos.tipo_pago,
        usuario,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const venta = data as Venta;

    const { error: eStock } = await supabase
      .from("perfumes")
      .update({ stock: nuevoStock })
      .eq("id", perfume.id);
    if (eStock) throw new Error(eStock.message);

    await registrarMovimiento(perfume.id, perfume.nombre, "venta", datos.cantidad);

    const primerPago = datos.tipo_pago === "contado" ? datos.total : datos.entrega;
    if (primerPago > 0) {
      const { error: ePago } = await supabase.from("pagos").insert({
        venta_id: venta.id,
        monto: primerPago,
        fecha: hoyISO(),
        usuario,
      });
      if (ePago) throw new Error(ePago.message);
    }

    await cargar();
  };

  const agregarPago = async (ventaId: string, monto: number, fecha: string) => {
    if (monto <= 0) throw new Error("El monto tiene que ser mayor a 0.");
    const { error } = await supabase.from("pagos").insert({
      venta_id: ventaId,
      monto,
      fecha,
      usuario,
    });
    if (error) throw new Error(error.message);
    await cargar();
  };

  return {
    perfumes,
    movimientos,
    ventas,
    cargando,
    error,
    recargar: cargar,
    crear,
    editar,
    eliminar,
    ajustarStock,
    crearVenta,
    agregarPago,
  };
}
