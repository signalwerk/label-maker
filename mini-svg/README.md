# mini-svg

Render the document AST exported by [`mini-pdf`](../mini-pdf) as SVG instead
of PDF. The package is intentionally separate so the same AST can be sent to
either renderer.

## Usage

```ts
import { AstTypesEnum, type Document } from "mini-pdf";
import { Writer as SvgWriter } from "mini-svg";

const document: Document = {
  type: AstTypesEnum.DOCUMENT,
  fonts: [
    {
      type: AstTypesEnum.FONT,
      id: "WorkSansExtraBold",
      family: "Work Sans",
      weight: 800,
    },
  ],
  children: [
    {
      type: AstTypesEnum.VIEWPORT,
      attributes: { mediaBox: [0, 0, 300, 200] },
      children: [
        {
          type: AstTypesEnum.LINE,
          attributes: { x1: 20, y1: 50, x2: 280, y2: 50 },
        },
        {
          type: AstTypesEnum.BOX,
          attributes: {
            x: 20,
            y: 70,
            width: 260,
            height: 100,
            borderColour: [1, 0, 1],
          },
        },
        {
          type: AstTypesEnum.TEXT,
          attributes: {
            x: 20,
            y: 24,
            size: 24,
            font: "WorkSansExtraBold",
            content: "hello SVG",
          },
        },
      ],
    },
  ],
};

const svg = SvgWriter(document);
```

`Writer(document)` returns one SVG string. A document with multiple viewports
keeps every page as a vertically stacked nested SVG. Use
`renderSvgPages(document)` to receive one standalone SVG string per viewport.

`TEXTBOX` nodes accept top-left `x`, `y`, `width`, `height`, an absolute
`lineHeight`, and the normal text attributes. The SVG renderer wraps their
content into `<tspan>` lines and omits lines whose baselines exceed the box.
Fonts with embedded `data` are measured from fontkit's shaped glyph advances;
data-less fonts use a conservative fallback estimate.

Coordinates follow the current `mini-pdf` AST behavior: text uses PDF page
coordinates with a bottom-left origin, while images, lines, and boxes use a
top-left origin. Lines and boxes are unfilled borders; optional `borderWidth`
and normalized RGB `borderColour` values default to `1` and black. Embedded
font and JPEG byte arrays become data URLs, so the generated SVG is
self-contained.
Data-less fonts may specify `family` and `weight` to use fonts already loaded
by the containing page. Text nodes may set `textAnchor` to `start`, `middle`,
or `end`.

## Commands

```sh
npm --prefix ../mini-pdf install
npm --prefix ../mini-pdf run build
npm install
npm test
npm run build
```

The first two commands are only needed when developing from this repository,
where `mini-pdf` is linked from source rather than installed as a published
package containing `dist/`.
