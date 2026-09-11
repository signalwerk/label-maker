import type {
  Document,
  BoxNode,
  Font,
  Image,
  Line,
  OpenTypeFeatures,
  RgbColor,
  Text,
  TextBox,
  Viewport,
} from "mini-pdf";
import { create as createFont, type FontKitFont } from "fontkit";

export type { Document } from "mini-pdf";

export type SvgWriterOptions = {
  /** Space between pages in a combined, multi-page SVG. */
  pageGap?: number;
  /** Include an XML declaration. Defaults to true. */
  xmlDeclaration?: boolean;
};

type PageGeometry = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

type FontEntry = {
  node: Font;
  family: string;
  weight: number;
  font?: FontKitFont;
};

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const formatNumber = (value: number, label = "value"): string => {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }

  const rounded = Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
  return `${Object.is(rounded, -0) ? 0 : rounded}`;
};

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const escapeAttribute = (value: string): string =>
  escapeXml(value).replaceAll('"', "&quot;").replaceAll("'", "&apos;");

const escapeCssString = (value: string): string =>
  value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("&", "\\26 ")
    .replaceAll("<", "\\3c ")
    .replaceAll(">", "\\3e ")
    .replaceAll("\r", "\\d ")
    .replaceAll("\n", "\\a ");

const bytesToBase64 = (bytes: Uint8Array): string => {
  const output: Array<string> = [];

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = index + 1 < bytes.length ? bytes[index + 1] : 0;
    const third = index + 2 < bytes.length ? bytes[index + 2] : 0;
    const value = (first << 16) | (second << 8) | third;

    output.push(
      BASE64_ALPHABET[(value >>> 18) & 63],
      BASE64_ALPHABET[(value >>> 12) & 63],
      index + 1 < bytes.length ? BASE64_ALPHABET[(value >>> 6) & 63] : "=",
      index + 2 < bytes.length ? BASE64_ALPHABET[value & 63] : "=",
    );
  }

  return output.join("");
};

const fontMimeType = (data: Uint8Array): string => {
  const signature = String.fromCharCode(...data.slice(0, 4));
  return signature === "OTTO" ? "font/otf" : "font/ttf";
};

const pageGeometry = (viewport: Viewport): PageGeometry => {
  const [minX, minY, maxX, maxY] = viewport.attributes.mediaBox;
  [minX, minY, maxX, maxY].forEach((value, index) =>
    formatNumber(value, `mediaBox[${index}]`),
  );

  const width = maxX - minX;
  const height = maxY - minY;
  if (width <= 0 || height <= 0) {
    throw new Error("A viewport mediaBox must have a positive width and height.");
  }

  return { minX, minY, maxX, maxY, width, height };
};

const collectFonts = (document: Document): Map<string, FontEntry> => {
  const fonts = new Map<string, FontEntry>();

  document.fonts.forEach((font) => {
    if (fonts.has(font.id)) {
      throw new Error(`Duplicate font id: "${font.id}".`);
    }

    fonts.set(font.id, {
      node: font,
      family:
        font.family ??
        (font.data ? font.id : "Helvetica, Arial, sans-serif"),
      weight: font.weight ?? 400,
    });
  });

  return fonts;
};

const fontDefinitions = (fonts: Map<string, FontEntry>): string => {
  const rules = Array.from(fonts.values())
    .filter(({ node }) => node.data)
    .map(({ node }) => {
      const data = node.data as Uint8Array;
      return `@font-face{font-family:"${escapeCssString(node.family ?? node.id)}";font-weight:${node.weight ?? 400};src:url("data:${fontMimeType(data)};base64,${bytesToBase64(data)}")}`;
    });

  return rules.length === 0 ? "" : `<defs><style>${rules.join("")}</style></defs>`;
};

const featureSettings = (features?: OpenTypeFeatures): string => {
  if (!features) return "";

  const settings = Array.isArray(features)
    ? features.map((feature) => `"${escapeCssString(feature)}" 1`)
    : Object.entries(features).map(
        ([feature, enabled]) =>
          `"${escapeCssString(feature)}" ${enabled ? 1 : 0}`,
      );

  return settings.length === 0
    ? ""
    : ` style="font-feature-settings: ${escapeAttribute(settings.join(", "))}"`;
};

const textAnchorAttribute = (
  textAnchor?: "start" | "middle" | "end",
): string => {
  if (!textAnchor) return "";
  if (!["start", "middle", "end"].includes(textAnchor)) {
    throw new Error(`Unsupported text anchor: "${textAnchor}".`);
  }
  return ` text-anchor="${textAnchor}"`;
};

const textCharacterWidth = (character: string): number => {
  if (/\s/.test(character)) return 0.33;
  if (/[ilI.,:;!'|]/.test(character)) return 0.35;
  if (/[mwMW@%]/.test(character)) return 1;
  if (/[A-Z]/.test(character)) return 0.69;
  if (/[0-9]/.test(character)) return 0.65;
  return 0.56;
};

const estimateTextWidth = (text: string, size: number): number =>
  Array.from(text).reduce(
    (width, character) => width + textCharacterWidth(character) * size,
    0,
  );

const defaultOpenTypeFeatures = [
  "kern",
  "rlig",
  "liga",
  "clig",
  "calt",
  "locl",
  "ccmp",
  "mark",
  "mkmk",
];

const fontFeatureSettings = (features?: OpenTypeFeatures) =>
  Array.isArray(features)
    ? Array.from(new Set([...defaultOpenTypeFeatures, ...features]))
    : {
        ...Object.fromEntries(
          defaultOpenTypeFeatures.map((feature) => [feature, true]),
        ),
        ...(features || {}),
      };

const measureText = (
  font: FontEntry,
  text: string,
  size: number,
  features?: OpenTypeFeatures,
): number => {
  if (!font.node.data) return estimateTextWidth(text, size);
  if (!font.font) {
    font.font = createFont(font.node.data);
    if (!font.font.layout) {
      throw new Error(
        `Font "${font.node.id}" is a collection; provide a single OpenType font face.`,
      );
    }
  }

  const run = font.font.layout(text, fontFeatureSettings(features));
  const advance = run.positions.reduce(
    (width, position) => width + position.xAdvance,
    0,
  );
  return (advance / font.font.unitsPerEm) * size;
};

const wrapTextBoxContent = (
  content: string,
  width: number,
  measure: (text: string) => number,
): Array<string> =>
  content.split(/\r?\n/).flatMap((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [""];

    const lines: Array<string> = [];
    let line = words[0];
    words.slice(1).forEach((word) => {
      const candidate = `${line} ${word}`;
      if (measure(candidate) <= width) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    });
    lines.push(line);
    return lines;
  });

const renderText = (
  node: Text,
  geometry: PageGeometry,
  fonts: Map<string, FontEntry>,
): string => {
  const { x, y, size, font, content, features, textAnchor } = node.attributes;
  const fontEntry = fonts.get(font);
  if (!fontEntry) {
    throw new Error(`Unknown font id: "${font}".`);
  }

  return [
    `<text x="${formatNumber(x - geometry.minX, "text x")}"`,
    ` y="${formatNumber(geometry.maxY - y, "text y")}"`,
    ` font-family="${escapeAttribute(fontEntry.family)}"`,
    ` font-weight="${formatNumber(fontEntry.weight, "font weight")}"`,
    ` font-size="${formatNumber(size, "text size")}"`,
    textAnchorAttribute(textAnchor),
    `${featureSettings(features)}>`,
    escapeXml(content),
    "</text>",
  ].join("");
};

const renderTextBox = (
  node: TextBox,
  geometry: PageGeometry,
  fonts: Map<string, FontEntry>,
): string => {
  const {
    x,
    y,
    width,
    height,
    lineHeight,
    size,
    font,
    content,
    features,
    textAnchor = "start",
  } = node.attributes;
  const fontEntry = fonts.get(font);
  if (!fontEntry) {
    throw new Error(`Unknown font id: "${font}".`);
  }
  if (width < 0 || height < 0) {
    throw new Error("TextBox width and height must be zero or greater.");
  }
  if (lineHeight <= 0) {
    throw new Error("TextBox lineHeight must be greater than zero.");
  }
  if (size < 0) {
    throw new Error("TextBox size must be zero or greater.");
  }

  textAnchorAttribute(textAnchor);

  const anchorX =
    textAnchor === "end"
      ? x + width
      : textAnchor === "middle"
        ? x + width / 2
        : x;
  const measure = (text: string) =>
    measureText(fontEntry, text, size, features);
  const lines = wrapTextBoxContent(content, width, measure)
    .map((line, index) => ({
      content: line,
      y: y + size * 0.82 + index * lineHeight,
    }))
    .filter((line) => line.y <= y + height);

  return [
    `<text font-family="${escapeAttribute(fontEntry.family)}"`,
    ` font-weight="${formatNumber(fontEntry.weight, "font weight")}"`,
    ` font-size="${formatNumber(size, "text size")}"`,
    textAnchorAttribute(textAnchor),
    `${featureSettings(features)}>`,
    ...lines.map(
      (line) =>
        `<tspan x="${formatNumber(anchorX - geometry.minX, "textbox x")}" y="${formatNumber(line.y, "textbox y")}">${escapeXml(line.content)}</tspan>`,
    ),
    "</text>",
  ].join("");
};

const renderImage = (node: Image, geometry: PageGeometry): string => {
  const { x, y, width, height, data } = node.attributes;
  if (!(data instanceof Uint8Array)) {
    throw new Error("Image data must be a Uint8Array containing JPEG bytes.");
  }

  return [
    `<image x="${formatNumber(x - geometry.minX, "image x")}"`,
    ` y="${formatNumber(y, "image y")}"`,
    ` width="${formatNumber(width, "image width")}"`,
    ` height="${formatNumber(height, "image height")}"`,
    ' preserveAspectRatio="none"',
    ` href="data:image/jpeg;base64,${bytesToBase64(data)}" />`,
  ].join("");
};

const renderBorderColour = (borderColour: RgbColor = [0, 0, 0]): string => {
  borderColour.forEach((component) => {
    if (!Number.isFinite(component) || component < 0 || component > 1) {
      throw new Error(
        "Border colour RGB components must be finite numbers from 0 to 1.",
      );
    }
  });

  return `rgb(${borderColour.map((component) => Math.round(component * 255)).join(" ")})`;
};

const renderLine = (node: Line, geometry: PageGeometry): string => {
  const {
    x1,
    y1,
    x2,
    y2,
    borderWidth = 1,
    borderColour,
  } = node.attributes;
  if (borderWidth < 0) {
    throw new Error("Line borderWidth must be zero or greater.");
  }

  return [
    `<line x1="${formatNumber(x1 - geometry.minX, "line x1")}"`,
    ` y1="${formatNumber(y1, "line y1")}"`,
    ` x2="${formatNumber(x2 - geometry.minX, "line x2")}"`,
    ` y2="${formatNumber(y2, "line y2")}"`,
    ` fill="none" stroke="${renderBorderColour(borderColour)}"`,
    ` stroke-width="${formatNumber(borderWidth, "line borderWidth")}" />`,
  ].join("");
};

const renderBox = (node: BoxNode, geometry: PageGeometry): string => {
  const {
    x,
    y,
    width,
    height,
    borderWidth = 1,
    borderColour,
  } = node.attributes;
  if (width < 0 || height < 0) {
    throw new Error("Box width and height must be zero or greater.");
  }
  if (borderWidth < 0) {
    throw new Error("Box borderWidth must be zero or greater.");
  }

  return [
    `<rect x="${formatNumber(x - geometry.minX, "box x")}"`,
    ` y="${formatNumber(y, "box y")}"`,
    ` width="${formatNumber(width, "box width")}"`,
    ` height="${formatNumber(height, "box height")}"`,
    ` fill="none" stroke="${renderBorderColour(borderColour)}"`,
    ` stroke-width="${formatNumber(borderWidth, "box borderWidth")}" />`,
  ].join("");
};

const renderPageContent = (
  viewport: Viewport,
  fonts: Map<string, FontEntry>,
): string => {
  const geometry = pageGeometry(viewport);

  return viewport.children
    .map((node) => {
      switch (node.type) {
        case "TEXT":
          return renderText(node, geometry, fonts);
        case "TEXTBOX":
          return renderTextBox(node, geometry, fonts);
        case "IMAGE":
          return renderImage(node, geometry);
        case "LINE":
          return renderLine(node, geometry);
        case "BOX":
          return renderBox(node, geometry);
        default: {
          const unreachable: never = node;
          throw new Error(
            `Unsupported viewport child type: ${String((unreachable as { type?: string }).type)}`,
          );
        }
      }
    })
    .join("");
};

const documentDescription = (document: Document): string => {
  const output: Array<string> = [];
  if (document.info?.title) output.push(`<title>${escapeXml(document.info.title)}</title>`);
  if (document.info?.subject) output.push(`<desc>${escapeXml(document.info.subject)}</desc>`);
  return output.join("");
};

const svgRoot = ({
  width,
  height,
  body,
  description,
  definitions,
  xmlDeclaration,
}: {
  width: number;
  height: number;
  body: string;
  description: string;
  definitions: string;
  xmlDeclaration: boolean;
}): string => {
  const svg = [
    `<svg xmlns="${SVG_NAMESPACE}" width="${formatNumber(width)}pt" height="${formatNumber(height)}pt" viewBox="0 0 ${formatNumber(width)} ${formatNumber(height)}">`,
    description,
    definitions,
    body,
    "</svg>",
  ].join("");

  return xmlDeclaration ? `${XML_DECLARATION}\n${svg}` : svg;
};

/** Render every viewport as its own standalone SVG document. */
export const renderSvgPages = (
  document: Document,
  options: Pick<SvgWriterOptions, "xmlDeclaration"> = {},
): Array<string> => {
  if (document.type !== "DOCUMENT") {
    throw new Error("The SVG renderer expects a DOCUMENT root node.");
  }

  const fonts = collectFonts(document);
  const definitions = fontDefinitions(fonts);
  const description = documentDescription(document);
  const xmlDeclaration = options.xmlDeclaration ?? true;

  return document.children.map((viewport) => {
    const geometry = pageGeometry(viewport);
    return svgRoot({
      width: geometry.width,
      height: geometry.height,
      body: renderPageContent(viewport, fonts),
      description,
      definitions,
      xmlDeclaration,
    });
  });
};

/**
 * Render a mini-pdf document AST as one SVG string.
 *
 * A one-page document maps directly to one SVG canvas. Multiple pages are
 * retained as vertically stacked nested SVG elements. Use `renderSvgPages`
 * when each page should be written to a separate file.
 */
export const Writer = (
  document: Document,
  options: SvgWriterOptions = {},
): string => {
  if (document.type !== "DOCUMENT") {
    throw new Error("The SVG renderer expects a DOCUMENT root node.");
  }
  if (document.children.length === 0) {
    throw new Error("The SVG renderer requires at least one VIEWPORT.");
  }

  const pageGap = options.pageGap ?? 0;
  if (pageGap < 0) {
    throw new Error("pageGap must be zero or greater.");
  }

  const fonts = collectFonts(document);
  const geometries = document.children.map(pageGeometry);
  const width = Math.max(...geometries.map((geometry) => geometry.width));
  const height =
    geometries.reduce((total, geometry) => total + geometry.height, 0) +
    pageGap * (geometries.length - 1);
  let offsetY = 0;

  const pages = document.children
    .map((viewport, index) => {
      const geometry = geometries[index];
      const page = [
        `<svg data-page="${index + 1}" x="0" y="${formatNumber(offsetY)}"`,
        ` width="${formatNumber(geometry.width)}" height="${formatNumber(geometry.height)}"`,
        ` viewBox="0 0 ${formatNumber(geometry.width)} ${formatNumber(geometry.height)}">`,
        renderPageContent(viewport, fonts),
        "</svg>",
      ].join("");

      offsetY += geometry.height + pageGap;
      return page;
    })
    .join("");

  return svgRoot({
    width,
    height,
    body: pages,
    description: documentDescription(document),
    definitions: fontDefinitions(fonts),
    xmlDeclaration: options.xmlDeclaration ?? true,
  });
};

export const renderSvg = Writer;

const MiniSvg = { Writer, renderSvg, renderSvgPages };
export default MiniSvg;
