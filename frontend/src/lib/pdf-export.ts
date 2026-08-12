// @ts-ignore
import html2pdf from "html2pdf.js";

export async function exportElementToPDF(
  element: HTMLElement,
  filename: string = "Resume.pdf"
): Promise<void> {
  if (!element) return;

  // Store original inline style transforms to prevent scale distortion during capture
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;

  try {
    // Temporarily reset CSS scaling to 1:1 scale for 300+ DPI razor-sharp text capture
    element.style.transform = "none";
    element.style.transformOrigin = "top left";

    const opt = {
      margin: 0,
      filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      image: { type: "png" as const, quality: 1.0 },
      html2canvas: {
        scale: 4, // 4x Ultra-HD Retina supersampling (300+ DPI)
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
        compress: true,
      },
    };

    await html2pdf().set(opt).from(element).save();
  } finally {
    // Restore original transform styling for live preview
    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;
  }
}
