import { GlassId } from "../types";

/** Форма бокала: набор SVG-путей для отрисовки. */
export interface GlassShape {
  /** Внешний контур во viewBox 100x140. */
  outline: string;
  /** Внутренний контур во viewBox 100x120 для клиппатха жидкости. */
  innerOutline: string;
  /** Путь ручки (только для mug), во viewBox 100x140. */
  handlePath?: string;
  /** Путь блика на стекле, во viewBox 100x140. */
  highlightPath: string;
}

const PINT: GlassShape = {
  outline: "M 22 10 L 78 10 L 72 130 L 28 130 Z",
  innerOutline: "M 24 0 L 76 0 L 70 120 L 30 120 Z",
  highlightPath: "M 28 20 L 34 120",
};

const TULIP: GlassShape = {
  outline:
    "M 30 10 Q 18 50, 30 80 Q 38 100, 35 130 L 65 130 Q 62 100, 70 80 Q 82 50, 70 10 Z",
  innerOutline:
    "M 32 0 Q 22 45, 32 75 Q 40 95, 37 120 L 63 120 Q 60 95, 68 75 Q 78 45, 68 0 Z",
  highlightPath: "M 34 15 Q 26 50, 34 75",
};

const SNIFTER: GlassShape = {
  outline: "M 25 10 Q 10 50, 35 80 L 40 130 L 60 130 L 65 80 Q 90 50, 75 10 Z",
  innerOutline:
    "M 27 0 Q 14 45, 37 75 L 42 120 L 58 120 L 63 75 Q 86 45, 73 0 Z",
  highlightPath: "M 28 15 Q 18 45, 38 70",
};

const MUG: GlassShape = {
  outline: "M 20 10 L 65 10 L 65 130 L 20 130 Z",
  innerOutline: "M 22 0 L 63 0 L 63 120 L 22 120 Z",
  handlePath: "M 65 30 Q 90 30, 90 70 Q 90 110, 65 110",
  highlightPath: "M 26 20 L 26 120",
};

const WEIZEN: GlassShape = {
  outline: "M 25 10 L 75 10 L 65 130 L 35 130 Z",
  innerOutline: "M 27 0 L 73 0 L 63 120 L 37 120 Z",
  highlightPath: "M 30 15 L 40 120",
};

const SHAPES: Record<GlassId, GlassShape> = {
  pint: PINT,
  tulip: TULIP,
  snifter: SNIFTER,
  mug: MUG,
  weizen: WEIZEN,
};

/** Возвращает SVG-форму бокала по идентификатору. */
export function getGlassShape(id: GlassId): GlassShape {
  return SHAPES[id] ?? PINT;
}
