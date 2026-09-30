const MAX_SIDE = 1600
const SMALL_ENOUGH = 1024 * 1024

/**
 * Scales a photo down in the browser before upload. Hosting (Vercel) rejects
 * request bodies over 4.5 MB, and phone photos are often larger than that.
 * Returns the original file when it is already small or cannot be decoded.
 */
export async function shrinkImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size <= SMALL_ENOUGH) {
      bitmap.close()
      return file
    }

    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85)
    )
    if (!blob) return file
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp"
    return new File([blob], name, { type: "image/webp" })
  } catch {
    return file
  }
}
