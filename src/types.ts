import { EnvironmentalityValueTypes } from "./convert"
import { EnvironmentalityErrorCallback } from "./errors"

export type EnvironmentalityPropertyTypes = "string" | "number" | "boolean"

export type EnvironmentalityPropertyTypesConstructor<
  T extends EnvironmentalityPropertyTypes,
> = T extends "string"
  ? string
  : T extends "number"
  ? number
  : T extends "boolean"
  ? boolean
  : null

/*
 * | required | default value set | environment variable set | result                         |
 * |----------|-------------------|--------------------------|--------------------------------|
 * | true     | false             | false                    | trows error, returns undefined |
 * | true     | false             | true                     | returns environment variable   |
 * | true     | true              | false                    | returns default value          |
 * | true     | true              | true                     | returns environment variable   |
 * | false    | false             | false                    | returns undefined              |
 * | false    | false             | true                     | returns environment variable   |
 * | false    | true              | false                    | returns default value          |
 * | false    | true              | true                     | returns environment variable   |
 */
export interface EnvironmentalityPropertyOptions<
  T extends EnvironmentalityPropertyTypes,
> {
  /*
   * The name of the environment variable to use. Defaults to the property name.
   */
  name?: string
  /*
   * Whether the environment variable is required. Defaults to true.
   */
  required?: boolean
  /*
   * The default value to use if the environment variable is not set. Defaults to undefined.
   */
  default?: EnvironmentalityPropertyTypesConstructor<T>
  /*
   * The type of the environment variable. Defaults to string.
   */
  type?: T
  array?: boolean
  enumValues?: EnvironmentalityPropertyTypesConstructor<T>[]
}

export type EnvironmentalityPropertyOptionsAny =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EnvironmentalityPropertyOptions<any>

export type EnvironmentalityPropertyOptionsList =
  EnvironmentalityPropertyOptionsAny[]

export const defaultEnvironmentalityPropertyOptions: EnvironmentalityPropertyOptionsAny =
  {
    required: true,
    type: String,
    default: undefined,
    array: false,
    enumValues: undefined,
  }

export type EnvironmentalityOptions = {
  error_callback?: EnvironmentalityErrorCallback
}

export declare class EnvironmentalityClassDeclaration {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[])
  static _environmentality_class_options: EnvironmentalityOptions | undefined
  static _environmentality_property_options: {
    [key: string]: EnvironmentalityPropertyOptionsAny
  }
  _environmentality_data: { [key: string]: EnvironmentalityValueTypes }
}

export type EnvironmentalityClassPublic = {
  _environmentality_property_options: {
    [key: string]: EnvironmentalityPropertyOptionsAny
  }
  _environmentality_data: { [key: string]: EnvironmentalityValueTypes }
}
