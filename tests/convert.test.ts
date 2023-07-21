import { describe, test, expect, beforeEach, jest } from "@jest/globals"
// import { mocked } from "ts-jest/cli"
import { EnvConverter } from "../src/convert"
import { ConvertErrors } from "../src/errors"

jest.mock("../src/errors", () => {
  return {
    ConvertErrors: jest.fn().mockImplementation(() => {
      return {
        add_error: jest.fn(),
        unsupported_type: jest.fn(),
        missing_required: jest.fn(),
        invalid_value: jest.fn(),
        invalid_default: jest.fn(),
        getErrors: jest.fn(),
        hasErrors: jest.fn(),
        getErrorString: jest.fn(),
        finish: jest.fn(),
      }
    }),
  }
})

let envConverter: EnvConverter
let errors: ConvertErrors

describe("decorators_read_env", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(ConvertErrors as any).mockClear()

    process.env = {
      STRING: "string",
      NUMBER: "1",
      FLOAT: "1.1",
      BOOLEAN: "true",
      STRING_ARRAY: "string1,string2,string3",
      NUMBER_ARRAY: "1,2,3",
      FLOAT_ARRAY: "1.1,2.2,3.3",
      BOOLEAN_ARRAY: "true,false,true",
      WONG_BOOLEAN: "wrong",
      WRONG_NUMBER: "wrong",
      WRONG_FLOAT: "wrong",
    }
    errors = new ConvertErrors()
    envConverter = new EnvConverter(errors)
  })

  test("read_env_string", () => {
    const result = envConverter.convert([
      {
        name: "STRING",
        type: "string",
      },
    ])
    expect(result).toEqual({ STRING: "string" })
    expect(errors.add_error).not.toHaveBeenCalled()
  })

  test("read_env_number", () => {
    const result = envConverter.convert([
      {
        name: "NUMBER",
        type: "number",
      },
    ])
    expect(result).toEqual({ NUMBER: 1 })
    expect(errors.add_error).not.toHaveBeenCalled()
  })

  test("read_env_float", () => {
    const result = envConverter.convert([
      {
        name: "FLOAT",
        type: "number",
      },
    ])
    expect(result).toEqual({ FLOAT: 1.1 })
    expect(errors.add_error).not.toHaveBeenCalled()
  })

  test("read_env_boolean", () => {
    const result = envConverter.convert([
      {
        name: "BOOLEAN",
        type: "boolean",
      },
    ])
    expect(result).toEqual({ BOOLEAN: true })
    expect(errors.add_error).not.toHaveBeenCalled()
  })

  test("read_env_string_array", () => {
    const result = envConverter.convert([
      {
        name: "STRING_ARRAY",
        type: "string",
        array: true,
      },
    ])
    expect(result).toEqual({ STRING_ARRAY: ["string1", "string2", "string3"] })
    expect(errors.add_error).not.toHaveBeenCalled()
  })

  test("read_env_number_array", () => {
    const result = envConverter.convert([
      {
        name: "NUMBER_ARRAY",
        type: "number",
        array: true,
      },
    ])
    expect(result).toEqual({ NUMBER_ARRAY: [1, 2, 3] })
    expect(errors.add_error).not.toHaveBeenCalled()
  })

  test("read_env_float_array", () => {
    const result = envConverter.convert([
      {
        name: "FLOAT_ARRAY",
        type: "number",
        array: true,
      },
    ])
    expect(result).toEqual({ FLOAT_ARRAY: [1.1, 2.2, 3.3] })
    expect(errors.add_error).not.toHaveBeenCalled()
  })

  test("read_env_boolean_array", () => {
    const result = envConverter.convert([
      {
        name: "BOOLEAN_ARRAY",
        type: "boolean",
        array: true,
      },
    ])
    expect(result).toEqual({ BOOLEAN_ARRAY: [true, false, true] })
    expect(errors.add_error).not.toHaveBeenCalled()
  })

  test("read_env_wrong_boolean", () => {
    const result = envConverter.convert([
      {
        name: "WONG_BOOLEAN",
        type: "boolean",
      },
    ])
    expect(result).toEqual({ WONG_BOOLEAN: null })
    expect(errors.add_error).toHaveBeenCalled()
  })

  test("read_env_wrong_number", () => {
    const result = envConverter.convert([
      {
        name: "WRONG_NUMBER",
        type: "number",
      },
    ])
    expect(result).toEqual({ WRONG_NUMBER: null })
    expect(errors.add_error).toHaveBeenCalled()
  })

  test("read_env_wrong_float", () => {
    const result = envConverter.convert([
      {
        name: "WRONG_FLOAT",
        type: "number",
      },
    ])
    expect(result).toEqual({ WRONG_FLOAT: null })
    expect(errors.add_error).toHaveBeenCalled()
  })

  test("read_env_missing_required", () => {
    const result = envConverter.convert([
      {
        name: "MISSING_REQUIRED",
        type: "string",
        required: true,
      },
    ])
    expect(result).toEqual({ MISSING_REQUIRED: null })
    expect(errors.add_error).toHaveBeenCalled()
  })

  test("read_env_default", () => {
    const result = envConverter.convert([
      {
        name: "DEFAULT",
        type: "string",
        default: "default",
      },
    ])
    expect(result).toEqual({ DEFAULT: "default" })
    expect(errors.add_error).not.toHaveBeenCalled()
  })

  test("read_env_default_array", () => {
    const result = envConverter.convert([
      {
        name: "DEFAULT_ARRAY",
        type: "string",
        array: true,
        default: ["default1", "default2", "default3"],
      },
    ])
    expect(result).toEqual({
      DEFAULT_ARRAY: ["default1", "default2", "default3"],
    })
    expect(errors.add_error).not.toHaveBeenCalled()
  })
})
