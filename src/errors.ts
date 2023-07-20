export type EnvironmentalityErrorCallback = (err: string[]) => void

export class ConvertErrors {
  private errors: string[] = []
  private error_callback!: EnvironmentalityErrorCallback

  constructor(error_callback?: EnvironmentalityErrorCallback) {
    this.errors = []
    if (error_callback) {
      this.error_callback = error_callback
    }
  }
  add_error(error: string) {
    this.errors.push(error)
  }

  unsupported_type(type: string, name: string) {
    this.add_error(`Unsupported type '${type}' for ${name}`)
  }

  missing_required(name: string) {
    this.add_error(`Missing required environment variable ${name}`)
  }

  invalid_value(value: any, name: string, must_be?: string) {
    if (must_be) {
      this.add_error(`Invalid value '${value}' for ${name}, must be ${must_be}`)
    } else {
      this.add_error(`Invalid value '${value}' for ${name}`)
    }
  }

  invalid_default(value: any, name: string, must_be?: string) {
    if (must_be) {
      this.add_error(
        `Invalid default value '${value}' for ${name}, must be ${must_be}`
      )
    } else {
      this.add_error(`Invalid default value '${value}' for ${name}`)
    }
  }

  getErrors() {
    return this.errors
  }

  hasErrors() {
    return this.errors.length > 0
  }

  getErrorString() {
    return [
      "During environmentality validation the following errors occurred:",
      ...this.errors.map((message) => {
        return `  ${message}`
      }),
    ].join("\n")
  }

  finish() {
    if (this.hasErrors()) {
      if (this.error_callback) {
        this.error_callback(this.errors)
      } else {
        console.error(this.getErrorString())
        // process.stderr.write(this.getErrorString())
        process.exit(1)
      }
    }
  }
}
