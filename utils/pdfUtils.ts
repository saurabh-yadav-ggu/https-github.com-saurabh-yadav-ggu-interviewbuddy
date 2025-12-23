import * as pdfjsLib from 'pdfjs-dist';

// CRITICAL FIX: Pin the worker version to 4.0.379 to match package.json.
// Using unpkg is more reliable for specific version targeting than esm.sh for the worker file in this specific Vite setup.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';

    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them with proper spacing
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
        
      fullText += pageText + '\n\n';
    }

    const trimmed = fullText.trim();
    if (!trimmed) {
        throw new Error("PDF text layer is empty (likely a scanned image).");
    }

    return trimmed;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to read PDF. Ensure it is text-based, not a scanned image.");
  }
}