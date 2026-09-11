import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MainPage from ".";
import { downloadPdf } from "../../pdfDownload";

vi.mock("../../pdfDownload", () => ({ downloadPdf: vi.fn() }));

describe("URL-connected label settings", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/?width=92&isUiVisible=1");
  });

  it("reads settings from the URL and writes changes back", () => {
    render(<MainPage />);

    const widthInput = screen.getByDisplayValue("92");
    fireEvent.change(widthInput, { target: { value: "95" } });

    expect(new URLSearchParams(window.location.search).get("width")).toBe("95");
    expect(screen.getByDisplayValue("95")).toBeInTheDocument();
  });

  it("unwraps text links whose percent escapes were encoded twice", () => {
    window.history.replaceState(
      {},
      "",
      "/?isUiVisible=1&text=%2523%2523%2523+1+%257C+5%250A----%250A%2523+Font+%255CnMachinists"
    );

    render(<MainPage />);

    expect(screen.getByRole("textbox")).toHaveValue(
      "### 1 | 5\n----\n# Font \\nMachinists"
    );
  });

  it("keeps rendering with the last valid width while the input is empty", () => {
    render(<MainPage />);

    const widthInput = screen.getByDisplayValue("92");
    const svg = screen.getByTestId("svg-label").querySelector("svg");

    expect(() =>
      fireEvent.change(widthInput, { target: { value: "" } })
    ).not.toThrow();
    expect(widthInput.value).toBe("");
    expect(new URLSearchParams(window.location.search).get("width")).toBe(
      "92"
    );
    expect(svg).toHaveAttribute("viewBox", "0 0 92 130");

    fireEvent.change(widthInput, { target: { value: "95" } });

    expect(new URLSearchParams(window.location.search).get("width")).toBe(
      "95"
    );
    expect(widthInput).toHaveValue(95);
    expect(screen.getByTestId("svg-label").querySelector("svg")).toHaveAttribute(
      "viewBox",
      "0 0 95 130"
    );
  });

  it("renders the configured viewport and active area from the AST", () => {
    window.history.replaceState(
      {},
      "",
      "/?width=100&height=80&top=5&right=10&bottom=15&left=20&debugBorder=1"
    );

    render(<MainPage />);

    const astOverlay = screen.getByTestId("label-ast");
    const svgLabel = screen.getByTestId("svg-label");
    const ast = JSON.parse(astOverlay.textContent);
    const svg = svgLabel.querySelector("svg");
    const activeArea = svgLabel.querySelector("rect");
    const sectionLines = svgLabel.querySelectorAll("line");
    const textNodes = svgLabel.querySelectorAll("text");
    const wrappedLines = svgLabel.querySelectorAll("tspan");

    expect(ast.children[0].attributes.mediaBox).toEqual([0, 0, 100, 80]);
    expect(ast.children[0].children[0]).toEqual({
      type: "BOX",
      attributes: {
        x: 20,
        y: 5,
        width: 70,
        height: 60,
        borderWidth: 0.32,
        borderColour: [1, 0, 1],
      },
    });
    expect(astOverlay.parentElement.nextElementSibling).toBe(svgLabel);
    expect(svg).toHaveAttribute("viewBox", "0 0 100 80");
    expect(activeArea).toHaveAttribute("x", "20");
    expect(activeArea).toHaveAttribute("y", "5");
    expect(activeArea).toHaveAttribute("width", "70");
    expect(activeArea).toHaveAttribute("height", "60");
    expect(activeArea).toHaveAttribute("fill", "none");
    expect(activeArea).toHaveAttribute("stroke", "rgb(255 0 255)");
    expect(activeArea).toHaveAttribute("stroke-width", "0.32");
    expect(sectionLines).toHaveLength(4);
    sectionLines.forEach((line) => {
      expect(line).toHaveAttribute("x1", "20");
      expect(line).toHaveAttribute("x2", "90");
      expect(line).toHaveAttribute("stroke", "rgb(0 0 0)");
      expect(line).toHaveAttribute("stroke-width", "0.32");
    });
    ast.children[0].children
      .filter(({ type }) => type === "TEXTBOX")
      .forEach(({ attributes }) => expect(attributes.width).toBe(70));
    expect(Array.from(textNodes, ({ textContent }) => textContent)).toContain(
      "2001"
    );
    expect(textNodes[0]).toHaveAttribute("font-family", "Work Sans");
    expect(textNodes[0]).toHaveAttribute("font-weight", "800");
    expect(textNodes[0]).toHaveAttribute("text-anchor", "end");
    expect(wrappedLines.length).toBeGreaterThan(textNodes.length);
  });

  it("toggles guides and cropmarks and downloads the current PDF", () => {
    render(<MainPage />);

    const cropmarks = screen.getByRole("checkbox", { name: "Cropmarks" });
    const guide = screen.getByRole("checkbox", {
      name: "Show active-area guide",
    });

    expect(cropmarks).not.toBeChecked();
    expect(guide).not.toBeChecked();
    expect(screen.getByTestId("svg-label").querySelector("rect")).toBeNull();

    fireEvent.click(guide);
    expect(new URLSearchParams(window.location.search).get("debugBorder")).toBe(
      "1"
    );
    expect(screen.getByTestId("svg-label").querySelector("rect")).not.toBeNull();

    fireEvent.click(cropmarks);
    expect(new URLSearchParams(window.location.search).get("cropmark")).toBe(
      "1"
    );
    expect(
      screen.getByTestId("svg-label").querySelector("svg")
    ).toHaveAttribute("viewBox", "0 0 112 150");

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
    expect(downloadPdf).toHaveBeenCalledOnce();
    expect(downloadPdf.mock.calls[0][1]).toBe("label-92x130mm.pdf");
  });
});
