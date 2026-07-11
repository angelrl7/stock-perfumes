import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Movimiento, Perfume, PerfumeInput, TipoMovimiento } from "../types";

export function usePerfumes(usuario: string) {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    const [pRes, mRes] = await Promise.all([
      supabase.from("perfumes").select("*").order("nombre"),
      supabase
        .from("movimientos")
        .select("*")
        .order("creado_en", { ascending: false })
        .limit(100),
    ]);
    if (pRes.error) setError(pRes.error.message);
    else setPerfumes(pRes.data as Perfume[]);
    if (mRes.error) setError(mRes.error.message);
    else setMovimientos(mRes.data as Movimiento[]);
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
    const { error } = await supabase.from("perfumes").update(datos).eq("id", id);
    if (error) throw new Error(error.message);
    await cargar();
  };

  const eliminar = async (id: string) => {
    const { error } = await supabase.from("perfumes").delete().eq("id", id);
    if (error) throw new Error(error.message);
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

  return {
    perfumes,
    movimientos,
    cargando,
    error,
    recargar: cargar,
    crear,
    editar,
    eliminar,
    ajustarStock,
  };
}
