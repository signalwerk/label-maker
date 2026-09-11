declare module "fontkit" {
  export type FontFeatureSettings =
    | Array<string>
    | { [feature: string]: boolean };

  export type FontKitGlyphPosition = {
    xAdvance: number;
    yAdvance: number;
    xOffset: number;
    yOffset: number;
  };

  export type FontKitGlyphRun = {
    positions: Array<FontKitGlyphPosition>;
  };

  export type FontKitFont = {
    unitsPerEm: number;
    layout(
      text: string,
      features?: FontFeatureSettings,
      script?: string,
      language?: string,
      direction?: string,
    ): FontKitGlyphRun;
  };

  export function create(
    data: Uint8Array,
    postscriptName?: string,
  ): FontKitFont;
}
