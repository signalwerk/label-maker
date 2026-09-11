import * as fs from "node:fs";
import type { Document } from "mini-pdf";
import { Writer, renderSvgPages } from ".";

const workSansMedium = fs.readFileSync(
  new URL(
    "../../mini-pdf/examples/assets/fonts/Work Sans/WorkSans-Medium.ttf",
    import.meta.url,
  ),
);

const document = (overrides: Partial<Document> = {}): Document => ({
  type: "DOCUMENT" as Document["type"],
  fonts: [{ type: "FONT", id: "F1" } as Document["fonts"][number]],
  children: [
    {
      type: "VIEWPORT",
      attributes: { mediaBox: [0, 0, 300, 200] },
      children: [],
    } as Document["children"][number],
  ],
  ...overrides,
});

test("renders PDF text coordinates into an SVG page", () => {
  const input = document();
  input.children[0].children.push({
    type: "TEXT",
    attributes: {
      x: 20,
      y: 24,
      size: 12,
      font: "F1",
      content: "Hello & <SVG>",
      features: { kern: false, liga: true },
    },
  });

  const svg = Writer(input, { xmlDeclaration: false });

  expect(svg).toContain('width="300pt" height="200pt" viewBox="0 0 300 200"');
  expect(svg).toContain('data-page="1"');
  expect(svg).toContain('x="20" y="176"');
  expect(svg).toContain('font-family="Helvetica, Arial, sans-serif"');
  expect(svg).toContain(
    'style="font-feature-settings: &quot;kern&quot; 0, &quot;liga&quot; 1"',
  );
  expect(svg).toContain("Hello &amp; &lt;SVG&gt;");
});

test("embeds AST font and JPEG bytes as data URLs", () => {
  const input = document({
    fonts: [
      {
        type: "FONT",
        id: "Custom",
        family: "Work Sans",
        weight: 800,
        data: new Uint8Array([0x4f, 0x54, 0x54, 0x4f]),
      },
    ],
  });
  input.children[0].children.push(
    {
      type: "IMAGE",
      attributes: {
        x: 10,
        y: 30,
        width: 40,
        height: 50,
        data: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
      },
    },
    {
      type: "TEXT",
      attributes: {
        x: 10,
        y: 20,
        size: 10,
        font: "Custom",
        content: "Font",
        textAnchor: "end",
      },
    },
  );

  const svg = Writer(input, { xmlDeclaration: false });

  expect(svg).toContain("data:font/otf;base64,T1RUTw==");
  expect(svg).toContain("data:image/jpeg;base64,/9j/2Q==");
  expect(svg).toContain('x="10" y="30" width="40" height="50"');
  expect(svg).toContain('font-family="Work Sans"');
  expect(svg).toContain('font-weight="800"');
  expect(svg).toContain('text-anchor="end"');
});

test("renders lines and boxes with top-left coordinates", () => {
  const input = document();
  input.children[0].children.push(
    {
      type: "LINE",
      attributes: {
        x1: 10,
        y1: 20,
        x2: 30,
        y2: 40,
        borderWidth: 0.5,
        borderColour: [1, 0, 1],
      },
    },
    {
      type: "BOX",
      attributes: {
        x: 50,
        y: 60,
        width: 70,
        height: 80,
      },
    },
  );

  const svg = Writer(input, { xmlDeclaration: false });

  expect(svg).toContain(
    '<line x1="10" y1="20" x2="30" y2="40" fill="none" stroke="rgb(255 0 255)" stroke-width="0.5" />',
  );
  expect(svg).toContain(
    '<rect x="50" y="60" width="70" height="80" fill="none" stroke="rgb(0 0 0)" stroke-width="1" />',
  );
});

test("wraps a textbox into tspans inside its bounds", () => {
  const input = document();
  input.children[0].children.push({
    type: "TEXTBOX",
    attributes: {
      x: 10,
      y: 20,
      width: 30,
      height: 24,
      lineHeight: 8,
      size: 6,
      font: "F1",
      content: "one two three four five six seven",
      textAnchor: "end",
    },
  });

  const svg = Writer(input, { xmlDeclaration: false });
  const tspans = svg.match(/<tspan /g) ?? [];

  expect(svg).toContain('<text font-family="Helvetica, Arial, sans-serif"');
  expect(svg).toContain('text-anchor="end"');
  expect(svg).toContain('<tspan x="40"');
  expect(tspans.length).toBeGreaterThan(1);
});

test("wraps label copy before the active area's right edge", () => {
  const input = document({
    fonts: [
      {
        type: "FONT",
        id: "F1",
        family: "Work Sans",
        weight: 600,
        data: workSansMedium,
      } as Document["fonts"][number],
    ],
  });
  input.children[0].children.push({
    type: "TEXTBOX",
    attributes: {
      x: 6,
      y: 100,
      width: 78,
      height: 26,
      lineHeight: 3.12,
      size: 2.6,
      font: "F1",
      content:
        "2001: A Space Odyssey is a 1968 science fiction film produced and directed by Stanley Kubrick.",
    },
  });

  const svg = Writer(input, { xmlDeclaration: false });

  expect(svg).toContain(
    ">2001: A Space Odyssey is a 1968 science fiction film</tspan>",
  );
  expect(svg).toContain(">produced and directed by Stanley Kubrick.</tspan>");
});

test("preserves all pages in combined and per-page output", () => {
  const input = document({
    children: [
      {
        type: "VIEWPORT",
        attributes: { mediaBox: [0, 0, 100, 50] },
        children: [],
      },
      {
        type: "VIEWPORT",
        attributes: { mediaBox: [0, 0, 200, 100] },
        children: [],
      },
    ],
  });

  const svg = Writer(input, { pageGap: 10, xmlDeclaration: false });

  expect(svg).toContain('width="200pt" height="160pt" viewBox="0 0 200 160"');
  expect(svg).toContain('data-page="1" x="0" y="0"');
  expect(svg).toContain('data-page="2" x="0" y="60"');
  expect(renderSvgPages(input)).toHaveLength(2);
});

test("rejects unknown font ids", () => {
  const input = document();
  input.children[0].children.push({
    type: "TEXT",
    attributes: {
      x: 0,
      y: 0,
      size: 12,
      font: "missing",
      content: "No font",
    },
  });

  expect(() => Writer(input)).toThrow('Unknown font id: "missing".');
});
