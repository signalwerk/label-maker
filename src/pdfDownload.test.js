import {
  MM_TO_PDF_POINTS,
  documentMillimetresToPdfPoints,
  renderPdf,
} from "./pdfDownload";
import { createLabelDocument } from "./labelAst";

test("converts page geometry and border widths from millimetres to PDF points", () => {
  const source = {
    type: "DOCUMENT",
    fonts: [],
    children: [
      {
        type: "VIEWPORT",
        attributes: { mediaBox: [0, 0, 120, 100] },
        children: [
          {
            type: "LINE",
            attributes: {
              x1: 0,
              y1: 10,
              x2: 7,
              y2: 10,
              borderWidth: 0.1,
              borderColour: [0, 0, 0],
            },
          },
          {
            type: "TEXTBOX",
            attributes: {
              x: 20,
              y: 20,
              width: 80,
              height: 20,
              lineHeight: 4,
              size: 3,
              font: "F1",
              content: "Text",
            },
          },
        ],
      },
    ],
  };

  const converted = documentMillimetresToPdfPoints(source);
  const [line, textbox] = converted.children[0].children;

  expect(converted.children[0].attributes.mediaBox[2]).toBeCloseTo(
    120 * MM_TO_PDF_POINTS
  );
  expect(line.attributes.x2).toBeCloseTo(7 * MM_TO_PDF_POINTS);
  expect(line.attributes.borderWidth).toBeCloseTo(
    0.1 * MM_TO_PDF_POINTS
  );
  expect(textbox.attributes.width).toBeCloseTo(80 * MM_TO_PDF_POINTS);
  expect(textbox.attributes.size).toBeCloseTo(3 * MM_TO_PDF_POINTS);
  expect(source.children[0].attributes.mediaBox).toEqual([0, 0, 120, 100]);
});

test("renders the converted document with mini-pdf", async () => {
  const pdf = await renderPdf({
    type: "DOCUMENT",
    fonts: [],
    children: [
      {
        type: "VIEWPORT",
        attributes: { mediaBox: [0, 0, 120, 100] },
        children: [],
      },
    ],
  });

  expect(pdf.startsWith("%PDF-1.3")).toBe(true);
  const mediaBox = pdf.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);
  expect(Number(mediaBox[1])).toBeCloseTo(120 * MM_TO_PDF_POINTS);
  expect(Number(mediaBox[2])).toBeCloseTo(100 * MM_TO_PDF_POINTS);
  expect(pdf.endsWith("%%EOF")).toBe(true);
});

test("renders a cropmarked label with embedded Work Sans", async () => {
  const pdf = await renderPdf(
    createLabelDocument({
      text: "# Label",
      width: 90,
      height: 130,
      top: 3,
      right: 6,
      bottom: 4,
      left: 6,
      pScale: 100,
      h1Scale: 100,
      cropmark: true,
    })
  );
  const mediaBox = pdf.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);

  expect(Number(mediaBox[1])).toBeCloseTo(110 * MM_TO_PDF_POINTS);
  expect(Number(mediaBox[2])).toBeCloseTo(150 * MM_TO_PDF_POINTS);
  expect(pdf).toContain("/Subtype /Type0");
  expect(pdf).toContain("/FontFile2");
});
