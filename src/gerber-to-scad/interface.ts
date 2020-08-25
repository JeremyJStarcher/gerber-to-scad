type AllowedUnits = 'in' | 'mm';


export interface Coord {
  x: number; // x coordinate
  y: number; // y coordiate
  i?: number; // (Optional) x-offset of arc center
  j?: number; // (Optional) y-offset of arc center
  a?: number; // (Optional) arc radius (mutually exclusive with i and j)
}

export interface ToolCircle {
  shape: 'circle';
  params: [number];
}

export interface ToolRect {
  shape: 'rect';
  params: [number, number];
}

export interface ToolObRound {
  shape: 'obround';
  params: [number, number];
}

export type ToolType = ToolCircle | ToolRect | ToolObRound;

export interface PlotState {
  toolShape: ToolShapes;
  coord: Coord;
  layerName: string;
  epsilon: number;
  units: AllowedUnits;
}

export interface CommandBase {
  line: number;
}

// ///////////////////////////////////////////////

export interface DoneCommand extends CommandBase {
  type: 'done';
}

// ///////////////////////////////////////////////

export interface SetCommandBase extends CommandBase {
  type: 'set';
}

export interface SetModeCommand extends SetCommandBase {
  prop: 'mode'; // draw mode
  value: [
    'i', // linear
    'cw', // CW-arc
    'ccw' //  CW-arc
  ];
}

export interface SetArcCommand extends SetCommandBase {
  prop: 'arc'; // arc mode
  value: [
    's', // single-quadrant
    'm' // multi-quadrant
  ];
}

export interface SetRegionCommand extends SetCommandBase {
  prop: 'region'; // region mode
  value: ['true', 'false'];
}

export interface SetUnitsCommand extends SetCommandBase {
  prop: 'units'; // units
  value: AllowedUnits;
}

export interface SetBackupUnitsCommand extends SetCommandBase {
  prop: 'backupUnits'; // 	backup units (used if units missing)
  value: AllowedUnits;
}

export interface SetEpsilonCommand extends SetCommandBase {
  prop: 'epsilon'; // backup units (used if units missing)
  value: number;
}

export interface SetNotaCommand extends SetCommandBase {
  prop: 'nota'; // absolute or incremental coord notation
  value: 'A' | 'I';
}

export interface SetBackupNotaCommand extends SetCommandBase {
  prop: 'backupNota'; // absolute or incremental coord notation
  value: ['A', 'I'];
}

export interface SetToolCommand extends SetCommandBase {
  prop: 'tool'; // absolute or incremental coord notation
  value: string;
}

export interface SetHolePlatingCommand extends SetCommandBase {
  prop: 'holePlating'; // absolute or incremental coord notation
  value: [
    'pth', // Plated through hole
    'npth' // Non-plated through hole
  ];
}

export type SetCommands =
    | SetModeCommand
    | SetArcCommand
    | SetRegionCommand
    | SetUnitsCommand
    | SetBackupUnitsCommand
    | SetEpsilonCommand
    | SetNotaCommand
    | SetBackupUnitsCommand
    | SetToolCommand
    | SetHolePlatingCommand;

// ///////////////////////////////////////////////

export interface OpCommandBase extends CommandBase {
  type: 'op';
  coord: Coord;
}

export interface OpIntCommand extends OpCommandBase {
  op: 'int'; // interpolate (draw) to COORDINATE based on current tool and mode
}

export interface OpMoveCommand extends OpCommandBase {
  op: 'move'; // move to COORDINATE without affecting the image
}

export interface OpFlashCommand extends OpCommandBase {
  op: 'flash'; // add image of current tool to the layer image at COORDINATE
}

export interface OpLastCommand extends OpCommandBase {
  op: 'last'; // do whatever the last operation was (deprectated)
}

export type OpCommands =
    | OpIntCommand
    | OpMoveCommand
    | OpFlashCommand
    | OpLastCommand;

// ///////////////////////////////////////////////

export interface LevelCommandBase extends CommandBase {
  type: 'level';
}

export interface LevelPolarityCommand extends LevelCommandBase {
  level: 'polarity'; // do whatever the last operation was (deprectated)
  value: [
    | 'C' // Clear image polarity
    | 'D' // Dark image polarity
  ];
}

export interface LevelStepRepCommand extends LevelCommandBase {
  level: 'stepRep'; // do whatever the last operation was (deprectated)
  val: { x: number; y: number; i: number; j: number };
}

export type LevelCommands = LevelPolarityCommand | LevelStepRepCommand;

// ///////////////////////////////////////////////
export interface ToolShapeBase {
  hole: number[];
  // No hole 	[]
  // Circle hole 	[DIA]
  //  Rectangle hole 	[WIDTH, HEIGHT]
}

export interface ToolShapeCircle extends ToolShapeBase {
  shape: 'circle';
  params: [number];
}

export interface ToolShapeRect extends ToolShapeBase {
  shape: 'rect';
  params: [number, number];
}

export interface ToolShapeObround extends ToolShapeBase {
  shape: 'obround';
  params: [number, number];
}

export interface ToolShapePoly extends ToolShapeBase {
  shape: 'obround';
  params: number[];
}

  type ToolShapes =
    | ToolShapeCircle
    | ToolShapeRect
    | ToolShapeObround
    | ToolShapePoly;

export interface ToolCommand extends CommandBase {
  type: 'tool';
  code: string;
  tool: ToolShapes;
}

export type PlotCommand =
    | DoneCommand
    | SetCommands
    | OpCommands
    | LevelCommands
    | ToolCommand;

