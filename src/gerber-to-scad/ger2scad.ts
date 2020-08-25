/* eslint-disable @typescript-eslint/naming-convention */
import gerberParser from 'gerber-parser'
import gerberToSvg from 'gerber-to-svg';
import whatsThatGerber from "whats-that-gerber";
import {
  GerberProps,

  // layer types
  TYPE_COPPER, // 'copper'
  TYPE_SOLDERMASK, // 'soldermask'
  TYPE_SILKSCREEN, // 'silkscreen'
  TYPE_SOLDERPASTE, // 'solderpaste'
  TYPE_DRILL, // 'drill'
  TYPE_OUTLINE, // 'outline'
  TYPE_DRAWING, // 'drawing'

  // board sides
  SIDE_TOP, // 'top'
  SIDE_BOTTOM, // 'bottom'
  SIDE_INNER, // 'inner'
  SIDE_ALL, // 'all'
} from "whats-that-gerber";

import jszip from 'jszip';

import {
  Coord,
  OpCommands,
  PlotCommand,
  PlotState,
  render,
  SetCommands,
  SetToolCommand,
  ToolCommand
} from './render';

export const log = (...p: any) => {
  // tslint:disable-next-line: no-console
  console.log(p);
};

/**
 * Multiplies a value by 2. (Also a full example of Typedoc's functionality.)
 *
 * ### Example (es module)
 * ```js
 * import { double } from 'typescript-starter'
 * console.log(double(4))
 * // => 8
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var double = require('typescript-starter').double;
 * console.log(double(4))
 * // => 8
 * ```
 *
 * @param value   Comment describing the `value` parameter.
 * @returns       Comment describing the return type.
 * @anotherNote   Some other value.
 */
export function double(value: number): number {
  return value * 2;
}

/**
 * Raise the value of the first parameter to the power of the second using the es7 `**` operator.
 *
 * ### Example (es module)
 * ```js
 * import { power } from 'typescript-starter'
 * console.log(power(2,3))
 * // => 8
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var power = require('typescript-starter').power;
 * console.log(power(2,3))
 * // => 8
 * ```
 */
export function power(base: number, exponent: number): number {
  // This is a proposed es7 operator, which should be transpiled by Typescript
  return base ** exponent;
}

export interface GerberContainer {
  readonly content: readonly string[];
  readonly name: string;
  readonly layerType: GerberProps;
}

/**
 * Extract ZIP file into an array of gerber files
 *
 * ### Example
 * ```js
 * import { power } from 'typescript-starter'
 * console.log(power(2,3))
 * // => 8
 * ```
 *
 */
export async function unzipGerbers(
  data: Buffer | ArrayBuffer
): Promise<readonly GerberContainer[]> {
  const zip = new jszip();

  // tslint:disable:no-expression-statement
  await zip.loadAsync(data);

  // tslint:disable-next-line:readonly-array
  const nameArray: jszip.JSZipObject[] = [];
  // tslint:disable-next-line:readonly-array
  const resArray: GerberContainer[] = [];

  zip.forEach(async (_, file) => {
    nameArray.push(file);
  });

  for (const file of nameArray) {
    const content = await file.async('string');
    const lines = content.split(/\r\n|\r|\n/);

    resArray.push({
      content: lines,
      layerType: identifyFileType(file.name, lines),
      name: file.name
    });
  }

  const result: ReadonlyArray<any> = [...resArray];
  return result;
}

function identifyFileType(filename: string, content: readonly string[]): GerberProps {
  const gerberIdObj = whatsThatGerber([filename]);
  const gerberType = gerberIdObj[filename];
  return gerberType;
}

const getStream = (stream: any) => {
  return new Promise<readonly object[]>(resolve => {
    // tslint:disable-next-line:readonly-array
    const chunks: any[] = [];

    // Buffer.from is required if chunk is a String, see comments
    stream.on('data', (chunk: any) => {
      // if (false) log(chunk);
      // chunks.push(Buffer.from(chunk))
      // throw new Error('CHUNK IS ' + JSON.stringify(chunk));
      chunks.push(chunk);
    });
    stream.on('end', () => resolve(chunks));
  });
};

export interface SvgResultType {
  readonly svg: string;
  readonly parsed: readonly object[];
}

export async function convertGerberToSvg(
  gerberLayer: GerberContainer
): Promise<SvgResultType> {
  const options: gerberToSvg.Options =
    gerberLayer.layerType.type === TYPE_DRILL
      ? {
        filetype: 'drill',
        places: null /* [2, 4], */,
        zero: null
      }
      : {};

  const Readable = require('stream').Readable;

  const gerberStream = new Readable();
  gerberStream.push(gerberLayer.content.join('\n')); // the string you want
  gerberStream.push(null); // indicates end-of-file basically - the end of the stream
  const parser = gerberParser(options);

  const parsed = await getStream(gerberStream.pipe(parser));

  return new Promise<SvgResultType>((resolve, reject) => {
    gerberToSvg(gerberLayer.content.join('\r'), options, (error, svg) => {
      const res: SvgResultType = {
        parsed,
        svg
      };

      error ? reject(error) : resolve(res);
    });
  });
}

export async function exportToScad(layers: readonly GerberContainer[]): Promise<string> {
  const header = ['BT = 1.6;', '$fs = 0.5;'];

  // tslint:disable-next-line
  let text: string[] = [];
  text = [...text, ...header];

  text = [...text, `module profile() {`];

  const profile = layers.filter(l => l.layerType.type === TYPE_OUTLINE);
  for (const layer of profile) {
    const svg = await convertGerberToSvg(layer);
    const scad = await convertLayerToScad(svg, layer.name);
    text = [...text, ...scad];
  }
  text = [...text, `} // profile()`];

  text = [...text, `module top() {`];
  const top = layers.filter(l => l.layerType.type === TYPE_COPPER && l.layerType.side === SIDE_TOP);
  for (const layer of top) {
    const svg = await convertGerberToSvg(layer);
    const scad = await convertLayerToScad(svg, layer.name);
    text = [...text, ...scad];
  }
  text = [...text, `} // top()`];

  if (1) {
    text = [...text, `module drill() {`];
    const drillLayers = layers.filter(
      l => l.layerType.type === TYPE_DRILL
    );

    for (const layer of drillLayers) {
      const svg = await convertGerberToSvg(layer);
      const scad = await convertLayerToScad(svg, layer.name);
      text = [...text, ...scad];
    }
    text = [...text, `} // drill()`];
  }

  text = [
    ...text,
    `
    difference() {
        union() {
            hull() profile();
            translate([0, 0, BT/2]) top();
        }
        union() {
            scale([1, 1, 10]) drill();
        }
    }
    `
  ];

  return text.join('\r\n');
}

// tslint:disable-next-line
let state: PlotState = null;

state = {
  coord: { x: 0, y: 0 },
  epsilon: 0,
  layerName: '--NONE--',
  toolShape: { shape: 'circle', params: [0], hole: [] },
  units: 'mm'
};

function processSetCommand(
  cmd: SetCommands,
  commands: PlotCommand[]
): string | null {
  if (cmd.prop === 'tool') {
    for (const c of commands) {
      if (c.type === 'tool') {
        if (c.code === cmd.value) {
          state.toolShape = c.tool;
          return null;
        }
      }
    }

    // throw new Error(
    //   //`Unknown Tool command of: "${cmd.value}" in line ${cmd.line}`
    // );
    return null;
  }

  if (cmd.prop === 'nota') {
    if (cmd.value !== 'A') {
      throw new Error(`Only a NOTA value of 'A' is allowed.`);
    }
    return null;
  }

  if (cmd.prop === 'epsilon') {
    state.epsilon = cmd.value;
    return null;
  }

  if (cmd.prop === 'units') {
    state.units = cmd.value;
    return null;
  }

  if (cmd.prop === 'backupUnits') {
    // state.units = cmd.value;
    return null;
  }

  throw new Error(`Unknown SET command of: "${cmd.prop}"`);
}

function processOpCommand(line: OpCommands, _: PlotCommand[]): string | null {
  if (line.op === 'move') {
    state.coord = line.coord;
    return null;
  }

  if (line.op === 'int') {
    return render.drawLine(state.coord, line.coord, state);
  }

  if (line.op === 'flash') {
    const l = render.flash(state);
    return `translate(${render.point(line.coord, state)}) ${l};`;
  }

  throw new Error(`Unknown op.type of ${line.op}`);
}

export async function convertLayerToScad(
  layer: SvgResultType,
  layerName: string
): Promise<readonly string[]> {
  //  const tools = (layer.parsed as any).filter(l => l.type === 'tool');

  // tslint:disable-next-line:readonly-array
  const res: string[] = [];
  const p = layer.parsed as PlotCommand[];

  state.layerName = layerName;

  for (const line1 of layer.parsed) {
    const line = line1 as PlotCommand;

    if (line.type === 'set') {
      processSetCommand(line, p);
    }

    if (line.type === 'op') {
      const ret = processOpCommand(line, p);
      if (ret) {
        res.push(ret);
      }
    }
  }
  return res;
}
