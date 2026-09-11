import { createLabelDocument } from "./labelAst";

test("converts label sections into active-area, line, and text nodes", () => {
  const document = createLabelDocument({
    text: "# First\n----\nParagraph text\n----\n\n----\n## Fourth",
    width: 100,
    height: 80,
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
    pScale: 100,
    h1Scale: 100,
    debugBorder: true,
  });
  const children = document.children[0].children;
  const lines = children.filter(({ type }) => type === "LINE");
  const text = children.filter(({ type }) => type === "TEXTBOX");

  expect(document.children[0].attributes.mediaBox).toEqual([0, 0, 100, 80]);
  expect(children[0]).toEqual({
    type: "BOX",
    attributes: {
      x: 10,
      y: 10,
      width: 80,
      height: 60,
      borderWidth: 0.32,
      borderColour: [1, 0, 1],
    },
  });
  expect(lines.map(({ attributes }) => attributes.y1)).toEqual([10, 25, 55]);
  expect(
    lines.map(({ attributes }) => attributes.x2 - attributes.x1)
  ).toEqual([80, 80, 80]);
  expect(lines.map(({ attributes }) => attributes.borderWidth)).toEqual([
    0.32, 0.32, 0.32,
  ]);
  expect(lines.map(({ attributes }) => attributes.borderColour)).toEqual([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  expect(text.map(({ attributes }) => attributes.content)).toEqual([
    "First",
    "Paragraph text",
    "Fourth",
  ]);
  expect(text.map(({ attributes }) => attributes.width)).toEqual([80, 80, 80]);
  expect(text[0].attributes).toMatchObject({
    x: 10,
    width: 80,
    font: "WorkSansExtraBold",
    textAnchor: "end",
  });
});

test("adds 3 mm crop gaps and 7 mm marks on a page extended by 10 mm per side", () => {
  const document = createLabelDocument({
    text: "",
    width: 100,
    height: 80,
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
    pScale: 100,
    h1Scale: 100,
    cropmark: true,
  });
  const marks = document.children[0].children;

  expect(document.children[0].attributes.mediaBox).toEqual([0, 0, 120, 100]);
  expect(marks).toHaveLength(8);
  expect(marks.every(({ type }) => type === "LINE")).toBe(true);
  expect(marks.map(({ attributes }) => attributes)).toContainEqual({
    x1: 0,
    y1: 10,
    x2: 7,
    y2: 10,
    borderWidth: 0.1,
    borderColour: [0, 0, 0],
  });
  expect(marks.map(({ attributes }) => attributes)).toContainEqual({
    x1: 113,
    y1: 90,
    x2: 120,
    y2: 90,
    borderWidth: 0.1,
    borderColour: [0, 0, 0],
  });
});

test("leaves long paragraph wrapping to a single textbox node", () => {
  const document = createLabelDocument({
    text: "A paragraph with enough words to require multiple rendered lines",
    width: 60,
    height: 100,
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
    pScale: 100,
    h1Scale: 100,
  });
  const textNodes = document.children[0].children.filter(
    ({ type }) => type === "TEXTBOX"
  );

  expect(textNodes).toHaveLength(1);
  expect(textNodes[0].attributes).toMatchObject({
    width: 50,
    content: "A paragraph with enough words to require multiple rendered lines",
  });
});

test("converts a literal backslash-n into a forced textbox line break", () => {
  const document = createLabelDocument({
    text: "First line\\nSecond line",
    width: 100,
    height: 80,
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
    pScale: 100,
    h1Scale: 100,
  });
  const textboxes = document.children[0].children.filter(
    ({ type }) => type === "TEXTBOX"
  );

  expect(textboxes).toHaveLength(1);
  expect(textboxes[0].attributes.content).toBe("First line\nSecond line");
});
