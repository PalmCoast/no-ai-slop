import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export async function textFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;
  if (type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".csv")) return file.text();
  if (type === "application/pdf" || name.endsWith(".pdf")) return textFromPdf(file);
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    throw new Error("This browser cannot read a HEIC photo. Export a JPEG, or paste the charges.");
  }
  if (type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|tiff?)$/.test(name)) return textFromImage(file);
  return file.text();
}

async function textFromPdf(file: File): Promise<string> {
  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data }).promise;
    const pages: string[] = [];
    const limit = Math.min(doc.numPages, 12);
    for (let pageNumber = 1; pageNumber <= limit; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
      pages.push(text);
    }
    const joined = pages.join("\n").trim();
    if (!joined) throw new Error("empty");
    return joined;
  } catch (err) {
    if (err instanceof Error && err.message !== "empty") {
      throw new Error("Could not read that PDF. If it is a scan, upload the photo, or paste the charges.");
    }
    throw new Error("That PDF has no text layer. Upload a photo of the page, or paste the charges.");
  }
}

async function textFromImage(file: File): Promise<string> {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    try {
      const result = await worker.recognize(file);
      const text = result.data.text.trim();
      if (!text) throw new Error("empty");
      return text;
    } finally {
      await worker.terminate();
    }
  } catch (err) {
    if (err instanceof Error && /empty/.test(err.message)) {
      throw new Error("No words came off that photo. Paste the charges.");
    }
    throw new Error("Could not read that photo. Paste the charges.");
  }
}
