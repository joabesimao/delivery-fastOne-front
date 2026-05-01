import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import TableViewIcon from "@mui/icons-material/TableView";
import { jsPDF } from "jspdf";

export type ExportMode = "png" | "pdf" | "csv";

export interface ExportChartOrIndicatorProps {
  modes?: ExportMode[];
  filename?: string;
  title?: string;
  subTitle?: string;
  getImageData?: () => Promise<string>;
  csvHeaders?: string[];
  csvRows?: Array<Array<string | number>>;
  csvRecords?: Array<Record<string, any>>;
  size?: "small" | "medium";
  disabled?: boolean;
  tooltip?: string;
  pdfDpi?: number;
  pdfMarginMm?: number;
  pdfMaxWidthMm?: number;
  pdfOrientation?: "portrait" | "landscape";
  getSvgElement?: () => SVGSVGElement | null;
  rasterScale?: number;
  pdfTitlePx?: number;
  pdfSubTitlePx?: number;
  pdfGapBelowTitlePx?: number;
}

function sanitizeFilename(name?: string) {
  const base = name && name.trim().length ? name : "export";
  return base.replace(/[^a-zA-Z0-9-_]+/g, "-");
}

async function composeImageWithHeader(
  imgURI: string,
  title?: string,
  subTitle?: string,
  scale = 1,
): Promise<string> {
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const paddingX = 16 * scale;
      const paddingY = 12 * scale;
      const titlePx = 18 * scale;
      const subPx = 13 * scale;
      const titleFont = `600 ${titlePx}px 'Segoe UI', Roboto, Arial`;
      const subtitleFont = `400 ${subPx}px 'Segoe UI', Roboto, Arial`;
      const titleLineH = 24 * scale;
      const subLineH = 18 * scale;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth + paddingX * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(imgURI);
      const wrapLines = (
        text: string,
        font: string,
        maxWidth: number,
      ): string[] => {
        if (!text || !text.trim()) return [];
        ctx.font = font;
        const rawLines = text.split(/\n+/);
        const lines: string[] = [];
        for (const raw of rawLines) {
          const words = raw.split(/\s+/);
          let cur = "";
          for (const w of words) {
            const test = cur ? cur + " " + w : w;
            if (ctx.measureText(test).width <= maxWidth) {
              cur = test;
            } else {
              if (cur) lines.push(cur);
              if (ctx.measureText(w).width > maxWidth) {
                let chunk = "";
                for (const ch of w) {
                  const t2 = chunk + ch;
                  if (ctx.measureText(t2).width <= maxWidth) chunk = t2;
                  else {
                    if (chunk) lines.push(chunk);
                    chunk = ch;
                  }
                }
                cur = chunk;
              } else {
                cur = w;
              }
            }
          }
          if (cur) lines.push(cur);
        }
        return lines;
      };

      const maxTextWidth = canvas.width - paddingX * 2;
      const titleLines = title ? wrapLines(title, titleFont, maxTextWidth) : [];
      const subLines = subTitle
        ? wrapLines(subTitle, subtitleFont, maxTextWidth)
        : [];
      const headerH =
        titleLines.length * titleLineH +
        subLines.length * subLineH +
        (titleLines.length || subLines.length ? 10 * scale : 0);

      canvas.height = img.naturalHeight + paddingY * 2 + headerH;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let cursorY = paddingY + 4;
      ctx.fillStyle = "#111827";
      ctx.textBaseline = "top";
      ctx.font = titleFont;
      for (const line of titleLines) {
        ctx.fillText(line, paddingX, cursorY);
        cursorY += titleLineH - 2;
      }
      if (subLines.length) {
        ctx.font = subtitleFont;
        ctx.fillStyle = "#71717A";
        for (const line of subLines) {
          ctx.fillText(line, paddingX, cursorY);
          cursorY += subLineH;
        }
      }
      ctx.drawImage(img, paddingX, paddingY + headerH);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = imgURI;
  });
}

function serializeSvg(svgEl: SVGSVGElement, scale = 1) {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const vb = clone.viewBox && clone.viewBox.baseVal;
  const baseW =
    vb && vb.width
      ? vb.width
      : (clone as any).width?.baseVal?.value || svgEl.clientWidth || 600;
  const baseH =
    vb && vb.height
      ? vb.height
      : (clone as any).height?.baseVal?.value || svgEl.clientHeight || 400;
  clone.setAttribute("width", String(baseW * scale));
  clone.setAttribute("height", String(baseH * scale));
  const svgStr = new XMLSerializer().serializeToString(clone);
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
  return { uri, width: baseW * scale, height: baseH * scale };
}

async function rasterizeSvgToPng(
  svgEl: SVGSVGElement,
  scale = 2,
): Promise<string> {
  return new Promise<string>((resolve) => {
    const { uri, width, height } = serializeSvg(svgEl, scale);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(uri);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = uri;
  });
}

async function trimPngTransparentBounds(dataURL: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataURL);
      ctx.drawImage(img, 0, 0);
      try {
        const { width, height } = canvas;
        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;
        let minX = width,
          minY = height,
          maxX = -1,
          maxY = -1;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const alpha = data[idx + 3];
            if (alpha !== 0) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (maxX < minX || maxY < minY) return resolve(dataURL);
        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;
        const out = document.createElement("canvas");
        out.width = cropW;
        out.height = cropH;
        const octx = out.getContext("2d");
        if (!octx) return resolve(dataURL);
        octx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
        resolve(out.toDataURL("image/png"));
      } catch {
        resolve(dataURL);
      }
    };
    img.src = dataURL;
  });
}

function rowsFromRecords(
  headers: string[],
  records: Array<Record<string, any>>,
): Array<Array<string | number>> {
  return records.map((rec) => headers.map((h) => rec[h]));
}

function downloadCSV(
  filename: string,
  headers?: string[],
  rows?: Array<Array<string | number>>,
  records?: Array<Record<string, any>>,
) {
  try {
    let content = "";
    if (headers && headers.length) {
      content += headers.join(",") + "\r\n";
    }
    const finalRows =
      rows ?? (headers && records ? rowsFromRecords(headers, records) : []);
    for (const r of finalRows) {
      content +=
        r
          .map((v) =>
            typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v,
          )
          .join(",") + "\r\n";
    }
    const blob = new Blob(["\uFEFF" + content], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${sanitizeFilename(filename)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  } catch {}
}

function downloadPNG(filename: string, dataURL: string) {
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = `${sanitizeFilename(filename)}.png`;
  a.click();
}

function downloadPDF(
  filename: string,
  dataURL: string,
  opts?: {
    orientation?: "portrait" | "landscape";
    dpi?: number;
    marginMm?: number;
    maxWidthMm?: number;
    title?: string;
    subTitle?: string;
    titlePx?: number;
    subTitlePx?: number;
    gapBelowTitlePx?: number;
  },
) {
  try {
    const orientation = opts?.orientation ?? "portrait";
    const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = opts?.marginMm ?? 10;
    const dpi = opts?.dpi ?? 96;
    const usableWidth = pageWidth - margin * 2;
    const pxToMm = (px: number) => (px * 25.4) / dpi;
    const pxToPt = (px: number) => px * 0.75;
    const ptToMm = (pt: number) => pt * 0.352777778;

    const title = opts?.title?.trim();
    const subTitle = opts?.subTitle?.trim();
    const titlePx = Math.max(1, opts?.titlePx ?? 16);
    const subTitlePx = Math.max(1, opts?.subTitlePx ?? 12);
    const gapBelowTitlePx = Math.max(0, opts?.gapBelowTitlePx ?? 50);

    let cursorY = margin;
    if (title) {
      const titlePt = pxToPt(titlePx);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(titlePt);
      const parts = title.split(/\n+/);
      const lines: string[] = [];
      for (const p of parts) {
        const ls = doc.splitTextToSize(p, usableWidth);
        lines.push(...(Array.isArray(ls) ? ls : [ls as any]));
      }
      for (const line of lines) {
        doc.text(line, pageWidth / 2, cursorY, {
          align: "center",
          baseline: "top" as any,
        });
        cursorY += ptToMm(titlePt);
      }
      cursorY += 1.5;
    }
    if (subTitle) {
      const subPt = pxToPt(subTitlePx);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(subPt);
      const parts = subTitle.split(/\n+/);
      const lines: string[] = [];
      for (const p of parts) {
        const ls = doc.splitTextToSize(p, usableWidth);
        lines.push(...(Array.isArray(ls) ? ls : [ls as any]));
      }
      for (const line of lines) {
        doc.text(line, pageWidth / 2, cursorY, {
          align: "center",
          baseline: "top" as any,
        });
        cursorY += ptToMm(subPt);
      }
    }
    cursorY += pxToMm(gapBelowTitlePx);
    const img = new Image();
    img.onload = () => {
      const intrinsicWmm = pxToMm(img.naturalWidth);
      const intrinsicHmm = pxToMm(img.naturalHeight);
      const maxWidthMm = Math.min(
        usableWidth,
        opts?.maxWidthMm ?? usableWidth,
        intrinsicWmm,
      );
      const maxHeightMm = Math.max(0, pageHeight - cursorY - margin);
      const scaleByWidth = maxWidthMm / intrinsicWmm;
      const scaleByHeight = maxHeightMm / intrinsicHmm;
      const scale = Math.min(scaleByWidth, scaleByHeight, 1); // never upscale beyond 1
      const drawW = intrinsicWmm * scale;
      const drawH = intrinsicHmm * scale;
      const x = (pageWidth - drawW) / 2;
      const y = cursorY;
      doc.addImage(dataURL, "PNG", x, y, drawW, drawH);
      doc.save(`${sanitizeFilename(filename)}.pdf`);
    };
    img.src = dataURL;
  } catch {}
}

const ExportChartOrIndicator: React.FC<ExportChartOrIndicatorProps> = ({
  modes = ["png", "pdf", "csv"],
  filename = "export",
  title,
  subTitle,
  getImageData,
  csvHeaders,
  csvRows,
  csvRecords,
  size = "small",
  disabled = false,
  tooltip = "Exportar",
  pdfDpi = 96,
  pdfMarginMm = 20,
  pdfMaxWidthMm,
  pdfOrientation = "portrait",
  getSvgElement,
  rasterScale = 2,
  pdfTitlePx = 22,
  pdfSubTitlePx = 14,
  pdfGapBelowTitlePx = 50,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const onExportPNG = async () => {
    let uri: string | undefined;
    if (getSvgElement) {
      const svg = getSvgElement();
      if (svg) uri = await rasterizeSvgToPng(svg, rasterScale);
    }
    if (!uri && getImageData) uri = await getImageData();
    if (!uri) return;
    const composed = await composeImageWithHeader(
      uri,
      title,
      subTitle,
      rasterScale,
    );
    downloadPNG(filename, composed);
  };

  const onExportPDF = async () => {
    let uri: string | undefined;
    if (getSvgElement) {
      const svg = getSvgElement();
      if (svg) uri = await rasterizeSvgToPng(svg, rasterScale);
    }
    if (!uri && getImageData) uri = await getImageData();
    if (!uri) return;
    try {
      uri = await trimPngTransparentBounds(uri);
    } catch {}
    downloadPDF(filename, uri, {
      orientation: pdfOrientation,
      dpi: pdfDpi,
      marginMm: pdfMarginMm,
      maxWidthMm: pdfMaxWidthMm,
      title,
      subTitle,
      titlePx: pdfTitlePx,
      subTitlePx: pdfSubTitlePx,
      gapBelowTitlePx: pdfGapBelowTitlePx,
    });
  };

  const onExportCSV = () =>
    downloadCSV(filename, csvHeaders, csvRows, csvRecords);

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton size={size} disabled={disabled} onClick={handleOpen}>
          <MenuRoundedIcon fontSize={size === "small" ? "small" : "medium"} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
        {modes.includes("png") && (
          <MenuItem
            onClick={() => {
              handleClose();
              onExportPNG();
            }}
          >
            <ListItemIcon>
              <ImageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Baixar PNG</ListItemText>
          </MenuItem>
        )}
        {modes.includes("pdf") && (
          <MenuItem
            onClick={() => {
              handleClose();
              onExportPDF();
            }}
          >
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Baixar PDF</ListItemText>
          </MenuItem>
        )}
        {modes.includes("csv") && (
          <MenuItem
            onClick={() => {
              handleClose();
              onExportCSV();
            }}
          >
            <ListItemIcon>
              <TableViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Baixar CSV</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ExportChartOrIndicator;
