import { ConvertErrors } from "./errors"
import {
  EnvironmentalityPropertyOptionsList,
  EnvironmentalityPropertyTypesConstructor,
  EnvironmentalityOptions,
  EnvironmentalityPropertyOptionsAny,
} from "./types"

export type EnvironmentalityValueBasicTypes =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EnvironmentalityPropertyTypesConstructor<any>
// string | number | boolean
export type EnvironmentalityValueTypes =
  | EnvironmentalityValueBasicTypes
  | EnvironmentalityValueBasicTypes[]

export class EnvConverter {
  private errors: ConvertErrors

  constructor(errors: ConvertErrors) {
    this.errors = errors
  }

  static convert(
    property_options: EnvironmentalityPropertyOptionsList,
    class_options?: EnvironmentalityOptions
  ): {
    [key: string]: EnvironmentalityValueTypes
  } {
    const errors = new ConvertErrors(
      class_options ? class_options.error_callback : undefined
    )
    const converter = new EnvConverter(errors)
    const converted = converter.convert(property_options, class_options)
    if (errors.hasErrors()) {
      errors.finish()
    }
    return converted
  }

  convert(
    property_options: EnvironmentalityPropertyOptionsList,
    class_options?: EnvironmentalityOptions
  ): {
    [key: string]: EnvironmentalityValueTypes
  } {
    // create object to store converted values
    const _converted: { [key: string]: EnvironmentalityValueTypes } = {}
    // iterate over property options
    property_options.forEach((options) => {
      // get name of property
      const name = options.name
      // check if name is defined
      if (!name) {
        return
      }
      // get value from environment variables
      const value = this.getEnvValue(name, class_options)
      // check if value is defined
      if (!value) {
        // check if default value is defined
        if (!options.default) {
          // check if property is required
          if (options.required) {
            // if required, throw error
            this.errors.missing_required(name)
          }
          // set value to null
          _converted[name] = null
        } else {
          // if default value is defined, set value to default value
          _converted[name] = options.default
        }
      } else {
        // convert value
        const converted_value = this.convertValue(value, name, options)
        if (!converted_value) {
          // if value is invalid, set value to null
          _converted[name] = null
        } else {
          // set value to converted value
          _converted[name] = converted_value
        }
      }
    })
    return _converted
  }

  private getEnvValue(
    name: string,
    class_options?: EnvironmentalityOptions
  ): string | undefined {
    const _env: { [key: string]: string | undefined } = process.env
    switch (class_options?.name_matching_strategy) {
      default:
      case "case-sensitive": {
        return _env[name]
      }
      case "case-insensitive": {
        // match case-insensitive
        const keys = Object.keys(_env)
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].toLowerCase() === name.toLowerCase()) {
            return _env[keys[i]]
          }
        }
        return undefined
      }
    }
  }

  private parseStringArray(value: string): string[] {
    let skip = 0
    let current = ""
    const array: string[] = []
    for (let i = 0; i < value.length; i++) {
      if (skip > 0) {
        skip -= 1
        continue
      }
      const c = value[i]
      switch (c) {
        case "\\": {
          current += value[i + 1]
          skip += 1
          break
        }
        case ",": {
          array.push(current)
          current = ""
          break
        }
        default: {
          current += c
        }
      }
    }
    // push last value
    array.push(current)
    return array
  }

  convertValue(
    value: string,
    name: string,
    options: EnvironmentalityPropertyOptionsAny
  ): EnvironmentalityValueTypes {
    switch (options.type) {
      case undefined:
      case "string": {
        return this.convertStringValue(value, name, options) as
          | string
          | string[]
      }
      case "number": {
        return this.convertNumberValue(value, name, options) as
          | number
          | number[]
      }
      case "boolean": {
        return this.convertBooleanValue(value, name, options) as
          | boolean
          | boolean[]
      }
      default: {
        this.errors.unsupported_type(options.type, name)
        return null
      }
    }
  }

  convertStringValue(
    value: string,
    name: string,
    options: EnvironmentalityPropertyOptionsAny
  ): string | null | (string | null)[] {
    if (options.array) {
      const array = this.parseStringArray(value)
      if (!this.checkEnumValues(array, name, options)) {
        return null
      }
      return array
    }
    if (!this.checkEnumValues(value, name, options)) {
      return null
    }
    return value
  }

  convertNumberValue(
    value: string,
    name: string,
    options: EnvironmentalityPropertyOptionsAny
  ): number | null | (number | null)[] {
    if (options.array) {
      let valid = true
      const array = this.parseStringArray(value).map((v) => {
        const number = Number(v)
        if (isNaN(number)) {
          this.errors.invalid_value(v, name, "a number")
          valid = false
          return null
        }
        return number
      })
      if (!valid) {
        return null
      }
      if (!this.checkEnumValues(array as number[] | number, name, options)) {
        return null
      }
      return array
    }
    const number = Number(value)
    if (isNaN(number)) {
      this.errors.invalid_value(value, name, "a number")
      return null
    }
    if (!this.checkEnumValues(number, name, options)) {
      return null
    }
    return number
  }

  convertBooleanValue(
    value: string,
    name: string,
    options: EnvironmentalityPropertyOptionsAny
  ): boolean | null | (boolean | null)[] {
    if (options.array) {
      const array = this.parseStringArray(value).map((v) => {
        if (!["true", "false"].includes(v.toLowerCase())) {
          this.errors.invalid_value(v, name, "'true' or 'false'")
          return null
        }
        return v.toLowerCase() === "true"
      })
      return array
    }
    if (!["true", "false"].includes(value.toLowerCase())) {
      this.errors.invalid_value(value, name, "'true' or 'false'")
      return null
    }
    const bool = value.toLowerCase() === "true"
    return bool
  }

  checkEnumValues(
    value: EnvironmentalityValueTypes,
    name: string,
    options: EnvironmentalityPropertyOptionsAny
  ): boolean {
    if (options.enumValues === undefined) {
      return true
    } else {
      // check if value is array
      if (Array.isArray(value)) {
        let valid = true
        value.forEach((v) => {
          if (!options.enumValues) {
            return false
          }
          if (!options.enumValues.includes(v)) {
            valid = false
            this.errors.invalid_value(
              value,
              name,
              `one of '${options.enumValues.join("', '")}'`
            )
          }
        })
        return valid
      }

      if (!options.enumValues.includes(value)) {
        this.errors.invalid_value(
          value,
          name,
          `one of '${options.enumValues.join("', '")}'`
        )
        return false
      } else {
        return true
      }
    }
  }
}
