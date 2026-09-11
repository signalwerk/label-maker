import workSansMediumUrl from "../mini-pdf/examples/assets/fonts/Work Sans/WorkSans-Medium.ttf?inline";
import workSansExtraBoldUrl from "../mini-pdf/examples/assets/fonts/Work Sans/WorkSans-ExtraBold.ttf?inline";

const FONT_MEDIUM = "WorkSansMedium";
const FONT_EXTRA_BOLD = "WorkSansExtraBold";
const MAGENTA = [1, 0, 1];
const BLACK = [0, 0, 0];
const CROP_GAP = 3;
const CROP_LENGTH = 7;
const CROP_OFFSET = CROP_GAP + CROP_LENGTH;
const CROP_BORDER_WIDTH = 0.1;

const dataUrlBytes = (url) => {
  const encoded = url.slice(url.indexOf(",") + 1);
  const binary = atob(encoded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const WORK_SANS_MEDIUM = dataUrlBytes(workSansMediumUrl);
const WORK_SANS_EXTRA_BOLD = dataUrlBytes(workSansExtraBoldUrl);

const cropmarkNodes = (width, height) => {
  const trimLeft = CROP_OFFSET;
  const trimTop = CROP_OFFSET;
  const trimRight = trimLeft + width;
  const trimBottom = trimTop + height;
  const pageRight = width + CROP_OFFSET * 2;
  const pageBottom = height + CROP_OFFSET * 2;
  const attributes = { borderWidth: CROP_BORDER_WIDTH, borderColour: BLACK };

  return [
    [0, trimTop, CROP_LENGTH, trimTop],
    [trimRight + CROP_GAP, trimTop, pageRight, trimTop],
    [0, trimBottom, CROP_LENGTH, trimBottom],
    [trimRight + CROP_GAP, trimBottom, pageRight, trimBottom],
    [trimLeft, 0, trimLeft, CROP_LENGTH],
    [trimLeft, trimBottom + CROP_GAP, trimLeft, pageBottom],
    [trimRight, 0, trimRight, CROP_LENGTH],
    [trimRight, trimBottom + CROP_GAP, trimRight, pageBottom],
  ].map(([x1, y1, x2, y2]) => ({
    type: "LINE",
    attributes: { x1, y1, x2, y2, ...attributes },
  }));
};

const parseTextLine = (line, sizes) => {
  const heading = line.match(/^(#{1,3})\s+(.*)$/);
  if (heading) {
    const level = heading[1].length;
    return {
      content: heading[2].replace(/\\n/g, "\n"),
      font: FONT_EXTRA_BOLD,
      size: level === 1 ? sizes.h1 : level === 2 ? sizes.h2 : sizes.small,
      kind: level < 3 ? "heading" : "small",
    };
  }

  if (line.trim() === "") return null;
  return {
    content: line.replace(/\\n/g, "\n"),
    font: FONT_MEDIUM,
    size: sizes.small,
    kind: "small",
  };
};

const sectionTextNodes = ({
  content,
  sectionIndex,
  sectionTop,
  sectionHeight,
  left,
  contentWidth,
  borderWidth,
  sizes,
}) => {
  const nodes = [];
  const sectionBottom = sectionTop + sectionHeight;
  const textAnchor = sectionIndex === 0 ? "end" : "start";
  let cursor = sectionTop;
  let isFirstSmallLine = true;

  content.split(/\r?\n/).forEach((line) => {
    const parsed = parseTextLine(line, sizes);
    if (!parsed) return;

    if (parsed.kind === "heading") {
      cursor += parsed.size * 0.1;
    } else if (isFirstSmallLine) {
      cursor += borderWidth * 1.6;
      isFirstSmallLine = false;
    }
    if (cursor >= sectionBottom) return;

    const lineHeight = parsed.size * (parsed.kind === "heading" ? 1 : 1.2);
    nodes.push({
      type: "TEXTBOX",
      attributes: {
        x: left,
        y: cursor,
        width: contentWidth,
        height: sectionBottom - cursor,
        lineHeight,
        size: parsed.size,
        font: parsed.font,
        content: parsed.content,
        textAnchor,
      },
    });

    cursor += lineHeight;
    if (parsed.kind === "heading") cursor += parsed.size * 0.1;
  });

  return nodes;
};

export const createLabelDocument = ({
  text,
  width,
  height,
  top,
  right,
  bottom,
  left,
  pScale,
  h1Scale,
  cropmark = false,
  debugBorder = false,
}) => {
  const pageOffset = cropmark ? CROP_OFFSET : 0;
  const pageWidth = width + pageOffset * 2;
  const pageHeight = height + pageOffset * 2;
  const contentWidth = Math.max(0, width - left - right);
  const activeHeight = Math.max(0, height - top - bottom);
  const sectionHeight = activeHeight / 4;
  const borderWidth = height / 250;
  const contentLeft = pageOffset + left;
  const contentTop = pageOffset + top;
  const sizes = {
    h1: (contentWidth / 6.5) * (h1Scale / 100),
    small: (contentWidth / 30) * (pScale / 100),
  };
  sizes.h2 = (sizes.small + sizes.h1) / 2;

  const children = cropmark ? cropmarkNodes(width, height) : [];

  if (debugBorder) {
    children.push({
      type: "BOX",
      attributes: {
        x: contentLeft,
        y: contentTop,
        width: contentWidth,
        height: activeHeight,
        borderWidth,
        borderColour: MAGENTA,
      },
    });
  }

  const sections = text.split("----").slice(0, 4);
  const lastFilledIndex = sections.findLastIndex(
    (section) => section.trim() !== ""
  );

  sections
    .slice(0, lastFilledIndex + 1)
    .forEach((section, sectionIndex) => {
      const sectionTop = contentTop + sectionHeight * sectionIndex;
      children.push({
        type: "LINE",
        attributes: {
          x1: contentLeft,
          y1: sectionTop,
          x2: contentLeft + contentWidth,
          y2: sectionTop,
          borderWidth,
          borderColour: BLACK,
        },
      });
      children.push(
        ...sectionTextNodes({
          content: section,
          sectionIndex,
          sectionTop,
          sectionHeight,
          left: contentLeft,
          contentWidth,
          borderWidth,
          sizes,
        })
      );
    });

  return {
    type: "DOCUMENT",
    fonts: [
      {
        type: "FONT",
        id: FONT_MEDIUM,
        family: "Work Sans",
        weight: 600,
        data: WORK_SANS_MEDIUM,
      },
      {
        type: "FONT",
        id: FONT_EXTRA_BOLD,
        family: "Work Sans",
        weight: 800,
        data: WORK_SANS_EXTRA_BOLD,
      },
    ],
    children: [
      {
        type: "VIEWPORT",
        attributes: { mediaBox: [0, 0, pageWidth, pageHeight] },
        children,
      },
    ],
  };
};
