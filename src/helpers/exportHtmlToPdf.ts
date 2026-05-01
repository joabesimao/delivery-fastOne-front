import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportHtmlToPdfOptions {
  element: HTMLElement;
  fileName: string;
  orientation?: "portrait" | "landscape";
  scale?: number;
  margin?: number;
  output?: "save" | "print";
}

/**
 * Exporta um elemento HTML para PDF usando html2canvas e jsPDF
 * @param options Opções de exportação
 */
export async function exportHtmlToPdf({
  element,
  fileName,
  orientation = "portrait",
  scale = 2,
  margin = 10,
  output = "save",
}: ExportHtmlToPdfOptions): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const ratio = canvasWidth / canvasHeight;
    const widthInPdf = pdfWidth - margin * 2;
    const heightInPdf = widthInPdf / ratio;

    let heightLeft = heightInPdf;
    let position = margin;

    // Adicionar primeira página
    pdf.addImage(imgData, "PNG", margin, position, widthInPdf, heightInPdf);
    heightLeft -= pdfHeight - margin * 2;

    // Adicionar páginas adicionais se necessário
    while (heightLeft >= 0) {
      position = heightLeft - heightInPdf + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, widthInPdf, heightInPdf);
      heightLeft -= pdfHeight - margin;
    }

    if (output === "print") {
      pdf.autoPrint();
      const blobUrl = pdf.output("bloburl");

      await new Promise<void>((resolve) => {
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.src = blobUrl.toString();

        const cleanup = () => {
          iframe.contentWindow?.removeEventListener("afterprint", cleanup);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve();
        };

        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          iframe.contentWindow?.addEventListener("afterprint", cleanup);
        };

        document.body.appendChild(iframe);
      });
    } else {
      pdf.save(`${fileName}.pdf`);
    }
  } catch (error) {
    console.error("Erro ao exportar HTML para PDF:", error);
    throw error;
  }
}
