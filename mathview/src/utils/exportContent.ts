export async function exportAsPdf(filename = "mathview-document"): Promise<void> {
  const editorContent = document.querySelector('[data-testid="editor-content"]') as HTMLElement;
  if (!editorContent) return;

  const html2pdf = (await import("html2pdf.js")).default;

  // Temporarily hide rulers by adding inline styles
  const rulers = editorContent.querySelectorAll(".vertical-ruler") as NodeListOf<HTMLElement>;
  rulers.forEach((ruler) => {
    ruler.style.display = "none";
  });

  try {
    await html2pdf()
      .set({
        filename: `${filename}.pdf`,
        image: { type: "png", quality: 1 },
        html2canvas: {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: true,
        },
        jsPDF: {
          unit: "px",
          format: [editorContent.offsetWidth, editorContent.offsetHeight],
          hotfixes: ["px_scaling"],
        },
      })
      .from(editorContent)
      .save();
  } finally {
    // Restore rulers
    rulers.forEach((ruler) => {
      ruler.style.display = "";
    });
  }
}
