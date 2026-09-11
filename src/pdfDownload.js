export const MM_TO_PDF_POINTS = 72 / 25.4;

const scale = (value) => value * MM_TO_PDF_POINTS;

const scaleNode = (node) => {
  const attributes = node.attributes;

  switch (node.type) {
    case "TEXT":
      return {
        ...node,
        attributes: {
          ...attributes,
          x: scale(attributes.x),
          y: scale(attributes.y),
          size: scale(attributes.size),
        },
      };
    case "TEXTBOX":
      return {
        ...node,
        attributes: {
          ...attributes,
          x: scale(attributes.x),
          y: scale(attributes.y),
          width: scale(attributes.width),
          height: scale(attributes.height),
          lineHeight: scale(attributes.lineHeight),
          size: scale(attributes.size),
        },
      };
    case "IMAGE":
    case "BOX":
      return {
        ...node,
        attributes: {
          ...attributes,
          x: scale(attributes.x),
          y: scale(attributes.y),
          width: scale(attributes.width),
          height: scale(attributes.height),
          ...(attributes.borderWidth === undefined
            ? {}
            : { borderWidth: scale(attributes.borderWidth) }),
        },
      };
    case "LINE":
      return {
        ...node,
        attributes: {
          ...attributes,
          x1: scale(attributes.x1),
          y1: scale(attributes.y1),
          x2: scale(attributes.x2),
          y2: scale(attributes.y2),
          ...(attributes.borderWidth === undefined
            ? {}
            : { borderWidth: scale(attributes.borderWidth) }),
        },
      };
    default:
      throw new Error(`Unsupported PDF content node: ${node.type}`);
  }
};

export const documentMillimetresToPdfPoints = (document) => ({
  ...document,
  fonts: document.fonts.map((font) => ({ ...font })),
  children: document.children.map((viewport) => ({
    ...viewport,
    attributes: {
      ...viewport.attributes,
      mediaBox: viewport.attributes.mediaBox.map(scale),
    },
    children: viewport.children.map(scaleNode),
  })),
});

export const renderPdf = async (document) => {
  const { Writer: PdfWriter } = await import("mini-pdf");
  return PdfWriter(documentMillimetresToPdfPoints(document));
};

export const downloadPdf = async (document, filename = "label.pdf") => {
  const pdf = await renderPdf(document);
  const blob = new Blob([new TextEncoder().encode(pdf)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
