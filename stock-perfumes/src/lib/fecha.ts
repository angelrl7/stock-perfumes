/** Fecha de hoy en formato YYYY-MM-DD usando la hora local (no UTC). */
export function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** "2026-07-11" -> "11/07" (sin pasar por Date, que corre el día por UTC). */
export function fechaCorta(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}
