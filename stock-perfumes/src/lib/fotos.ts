import { supabase } from "./supabase";

const BUCKET = "perfumes";
const LADO_MAX = 900;

/** Comprime la imagen en el navegador para que suba rápido desde el celular. */
export async function comprimirImagen(archivo: File): Promise<Blob> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise<HTMLImageElement>((resolver, rechazar) => {
      const i = new Image();
      i.onload = () => resolver(i);
      i.onerror = () => rechazar(new Error("No se pudo leer la imagen."));
      i.src = url;
    });
    const escala = Math.min(1, LADO_MAX / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo procesar la imagen.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolver) =>
      canvas.toBlob(resolver, "image/jpeg", 0.82)
    );
    if (!blob) throw new Error("No se pudo procesar la imagen.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Sube la foto al Storage y devuelve su URL pública. */
export async function subirFoto(blob: Blob): Promise<string> {
  const ruta = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
  });
  if (error) throw new Error(`No se pudo subir la foto: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}

/** Borra la foto del Storage a partir de su URL pública. Los errores se ignoran. */
export async function borrarFoto(fotoUrl: string | null) {
  if (!fotoUrl) return;
  const marca = `/object/public/${BUCKET}/`;
  const i = fotoUrl.indexOf(marca);
  if (i === -1) return;
  const ruta = decodeURIComponent(fotoUrl.slice(i + marca.length));
  try {
    await supabase.storage.from(BUCKET).remove([ruta]);
  } catch {
    // La foto huérfana no rompe nada; no vale la pena frenar al usuario.
  }
}
