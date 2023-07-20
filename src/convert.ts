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
    const converted = converter.convert(property_options)
    if (errors.hasErrors()) {
      errors.finish()
    }
    return converted
  }

  convert(property_options: EnvironmentalityPropertyOptionsList): {
    [key: string]: EnvironmentalityValueTypes
  } {
    // get environment variables
    const _env: { [key: string]: string | undefined } = process.env
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
      const value = _env[name]
      // check if value is defined
      if (!value) {
        // check if default value is defined
        if (!options.default) {
          // check if property is required
          if (!options.required) {
            // if not required, set value to null
            _converted[name] = null
          } else {
            // if required, throw error
            this.errors.missing_required(name)
          }
        } else {
          // if default value is defined, set value to default value
          _converted[name] = options.default
        }
      } else {
        const converted_value = this.convertValue(value, name, options)
        if (converted_value !== null) {
          _converted[name] = converted_value
        }
      }
    })
    return _converted
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
        return value
      }
    }
  }

  convertStringValue(
    value: string,
    name: string,
    options: EnvironmentalityPropertyOptionsAny
  ): string | null | (string | null)[] {
    if (options.array) {
      const array = value.split(",")
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
      const array = value.split(",").map((v) => {
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
    this.checkEnumValues(number, name, options)
    return number
  }

  convertBooleanValue(
    value: string,
    name: string,
    options: EnvironmentalityPropertyOptionsAny
  ): boolean | null | (boolean | null)[] {
    if (options.array) {
      const array = value.split(",").map((v) => {
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
