export type AllowedUnits = 'in' | 'mm';

import {
  Coord,
  PlotState,
} from "./interface";


function point(s: Coord, state: PlotState): string {
  const fix = state.units === 'mm' ? 1 : 25.4;

  return `[${s.x * fix}, ${s.y * fix}, 0]`;
}

function flash(state: PlotState): string {
  const tool = state.toolShape;
  const fix = state.units === 'mm' ? 1 : 25.4;

  if (tool.shape === 'circle') {
    return ` color("black") cylinder(h = BT, r = ${(tool.params[0] / 2) *
      fix}, center=true)`;
  }

  if (tool.shape === 'rect') {
    return `color("green") cube([${tool.params[0] * fix},
            ${tool.params[1] * fix},
            BT
          ], center=true)`;
  }

  if (tool.shape === 'obround') {
    return `color("red") cube([
            ${tool.params[0] * fix},
            ${tool.params[1] * fix},
            BT
          ], center=true);`;
  }

  throw new Error('Unknown tool shape of ' + (tool as any).shape);
}

function drawLine(s: Coord, e: Coord, state: PlotState): string {
  if (!s) {
    throw new Error("drawline 's' cannot be null");
  }
  if (!e) {
    throw new Error("drawline 'e' cannot be null");
  }

  return `
        hull() {
          translate(${point(s, state)}) ${flash(state)};
          translate(${point(e, state)}) ${flash(state)};
        }
        `;
}
export const render = {
  drawLine,
  flash,
  point
};
