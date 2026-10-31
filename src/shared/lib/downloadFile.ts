export const downloadTextFile = (
  content: string,
  fileName: string,
  mimeType: string,
): void => {
  const url = window.URL.createObjectURL(
    new Blob([content], { type: mimeType }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const escapeCsvValue = (value: string | number): string => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
