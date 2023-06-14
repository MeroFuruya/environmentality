type EnvironmentalityErrorCallback = (err: string[]) => void

type AddError = (message: string) => void

function convertValue(
  value: string,
  options: EnvironmentalityPropertyOptions,
  name: string,
  add_error: AddError
): string | number | boolean {
  const type = options.type || "string"
  switch (type) {
    case "string":
      return value
    case "number": {
      const number = Number(value)
      if (isNaN(number)) {
        add_error(`Invalid value for ${name}: ${value}. Must be a number`)
      }
      return number
    }
    case "boolean": {
      if (["true", "false"].includes(value.toLowerCase())) {
        return value.toLowerCase() === "true"
      }
      add_error(`Invalid value for ${name}: ${value}. Must be true or false`)
      return value === "true"
    }
    case "enum": {
      if (options.enumValues === undefined) {
        add_error(`Missing enumValues for ${name}`)
        return value
      }
      if (!options.enumValues.includes(value)) {
        add_error(
          `Invalid value for ${name}: ${value}. Must be one of ${options.enumValues.join(
            ", "
          )}`
        )
      }
      return value
    }

    default: {
      console.warn(`Unsupported type ${type} for ${name}`)
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
      let converted_value: string | number | boolean | undefined = undefined
      if (value === undefined) {
        if (required) {
          if (options.default !== undefined) {
            converted_value = convertValue(
              options.default,
              options,
              name,
              (message: string) => {
                _errors.push(message)
              }
            )
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
type EnvironmentalityPropertyOptions = {
  name?: string
  required?: boolean
  default?: string
  type?: "string" | "number" | "boolean" | "enum"
  enumValues?: string[]
}
const _env_vars: { [key: string]: EnvironmentalityPropertyOptions } = {}
const _data: { [key: string]: string | number | boolean } = {}
export function EnvVar(options: EnvironmentalityPropertyOptions = {}) {
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
