import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Writer as SvgWriter } from "mini-svg";
import "./Page.css";

const astJson = (document) =>
  JSON.stringify(
    document,
    (_key, value) =>
      value instanceof Uint8Array
        ? `[Uint8Array ${value.byteLength} bytes]`
        : value,
    2
  );

class Page extends PureComponent {
  render() {
    const { document } = this.props;
    const [minX, minY, maxX, maxY] =
      document.children[0].attributes.mediaBox;
    const width = maxX - minX;
    const height = maxY - minY;
    const svg = SvgWriter(document, { xmlDeclaration: false });

    return (
      <main className="previewWorkspace">
        <aside className="astOverlay" aria-label="Label AST">
          <div className="astOverlay__title">AST</div>
          <pre className="astOverlay__code" data-testid="label-ast">
            {astJson(document)}
          </pre>
        </aside>

        <div
          className="svgLabel"
          data-testid="svg-label"
          style={{
            "--preview-width": `${width * 4}px`,
            "--preview-aspect": `${width} / ${height}`,
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </main>
    );
  }
}

Page.propTypes = {
  document: PropTypes.object.isRequired,
};

export default Page;
