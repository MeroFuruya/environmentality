type EnvironmentalityErrorCallback = (err: string[]) => void

type AddError = (message: string) => void

type EnvironmentalityValueBasicTypes = string | number | boolean
type EnvironmentalityValueTypes =
  | EnvironmentalityValueBasicTypes
  | EnvironmentalityValueBasicTypes[]
// eslint-disable-next-line @typescript-eslint/ban-types
type EnvironmentalityPropertyTypes = String | Number | Boolean

function convertValue(
  value: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: EnvironmentalityPropertyOptions<any>,
  name: string,
  add_error: AddError
): EnvironmentalityValueTypes {
  const type = options.type || String
  function checkEnumValues(value: EnvironmentalityValueTypes) {
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
            add_error(
              `Invalid value for ${name}: '${v}'. Must be one of '${options.enumValues.join(
                "', '"
              )}'`
            )
          }
        })
        return valid
      }

      if (!options.enumValues.includes(value)) {
        add_error(
          `Invalid value for ${name}: '${value}'. Must be one of '${options.enumValues.join(
            "', '"
          )}'`
        )
        return false
      } else {
        return true
      }
    }
  }
  switch (type.name) {
    case "String": {
      if (options.array) {
        const array = value.split(",")
        if (checkEnumValues(array)) {
          return array
        } else {
          return value
        }
      }
      checkEnumValues(value)
      return value
    }
    case "Number": {
      if (options.array) {
        let valid = true
        const array = value.split(",").map((v) => {
          const number = Number(v)
          if (isNaN(number)) {
            add_error(`Invalid value for ${name}: '${v}'. Must be a number`)
            valid = false
          }
          return number
        })
        if (valid && checkEnumValues(array)) {
          return array
        } else {
          return value
        }
      }
      const number = Number(value)
      if (isNaN(number)) {
        add_error(`Invalid value for ${name}: '${value}'. Must be a number`)
      }
      checkEnumValues(number)
      return number
    }
    case "Boolean": {
      if (options.array) {
        console.log(value)
        const array = value.split(",").map((v) => {
          if (!["true", "false"].includes(v.toLowerCase())) {
            add_error(
              `Invalid value for ${name}: '${v}'. Must be true or false`
            )
          }
          return v.toLowerCase() === "true"
        })
        return array
      }
      if (!["true", "false"].includes(value.toLowerCase())) {
        add_error(
          `Invalid value for ${name}: '${value}'. Must be true or false`
        )
      }
      const bool = value.toLowerCase() === "true"
      return bool
    }
    default: {
      add_error(`Unsupported type ${type} for ${name}`)
      return value
    }
  }
}

// class decorator
type EnvironmentalityOptions = {
  error_callback?: EnvironmentalityErrorCallback
}
export function Env(options: EnvironmentalityOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function (target: object) {
    const _errors: string[] = []

    // iterate over all properties
    Object.keys(_env_vars).forEach((propertyKey) => {
      const options = _env_vars[propertyKey]
      const name = options.name || propertyKey
      const required = options.required === undefined ? true : options.required
      const value = process.env[name]
      let converted_value: EnvironmentalityValueTypes | undefined = undefined
      if (value === undefined) {
        if (required) {
          if (options.default !== undefined) {
            converted_value = options.default
          } else {
            _errors.push(`Missing required environment variable ${name}`)
          }
        }
      } else {
        converted_value = convertValue(
          value,
          options,
          name,
          (message: string) => {
            _errors.push(message)
          }
        )
      }
      if (!converted_value) {
        return
      }
      _data[propertyKey] = converted_value
    })
    // call error callback
    if (_errors.length > 0) {
      if (options.error_callback) {
        options.error_callback(_errors)
      } else {
        console.error(
          [
            "During environmentality validation the following errors occurred:",
            ..._errors.map((message) => {
              return `  ${message}`
            }),
          ].join("\n")
        )
        process.exit(1)
      }
    }
  }
}

// property decorator
interface EnvironmentalityPropertyOptions<
  T extends EnvironmentalityPropertyTypes
> {
  name?: string
  required?: boolean
  default?: T
  type?: T
  array?: boolean
  enumValues?: T[]
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _env_vars: { [key: string]: EnvironmentalityPropertyOptions<any> } = {}
const _data: { [key: string]: EnvironmentalityValueTypes } = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EnvVar(options: EnvironmentalityPropertyOptions<any> = {}) {
  return function <TClass extends object>(target: TClass, propertyKey: string) {
    // add property to _env_vars
    _env_vars[propertyKey] = options
    // getter
    Object.defineProperty(target, propertyKey, {
      get: function () {
        return _data[propertyKey]
      },
    })
  }
}
