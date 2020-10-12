export enum InputType {
  float,
  integer,
  str,
  options,
}

export interface ConfigOptionBase {
  shortDesc: string,
  longDesc: string,
}

export interface ConfigOptionFloat extends ConfigOptionBase {
  type: InputType.float,
  value: number,
}

export interface ConfigOptionOptions extends ConfigOptionBase {
  type: InputType.options,
  value: string,
  options: string[],
}

export interface ConfigOptionInteger extends ConfigOptionBase {
  type: InputType.integer,
  value: number,
}

export interface ConfigOptionString extends ConfigOptionBase {
  type: InputType.str,
  value: string,
}

type ConfigOptionType =
ConfigOptionFloat |
ConfigOptionInteger |
ConfigOptionOptions |
ConfigOptionString;

interface ConfigOptionTypes {
  [key: string]: ConfigOptionType
}

export const configOptions: ConfigOptionTypes = {
  minHoleDiameter:
  {
    type: InputType.float,
    value: 0,
    shortDesc: "Minimum hole diameter",
    longDesc: "Set this to the minimum hole size your printer can do."
  },
  copperThickness:
  {
    type: InputType.float,
    value: 0.5,
    shortDesc: "Copper Thickness",
    longDesc: "Positive value to raise copper, negative number to make a channel",
  },
  boardThickness:
  {
    type: InputType.float,
    value: 1.6,
    shortDesc: "Board Thickness",
    longDesc: "Board Thickness",
  },
};