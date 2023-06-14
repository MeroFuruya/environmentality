import { describe, test } from "@jest/globals"
import { Env, EnvVar } from "../src/index"

@Env()
class TestClass_UnsupportedType {
  @EnvVar({ type: undefined })
  readonly TEST_UNSUPPORTED?: string
}

@Env()
class TestClass_WillRecieveEnvVariables {
  @EnvVar()
  readonly TEST_STRING?: string
  @EnvVar({ type: "number" })
  readonly TEST_NUMBER?: number
  @EnvVar({ type: "boolean" })
  readonly TEST_BOOLEAN?: boolean
  @EnvVar({ type: "enum", enumValues: ["test"] })
  readonly TEST_ENUM?: "test"
}

@Env()
class TestClass_WillRecieveEnvVariables_CustomNames {
  @EnvVar({ name: "TEST_STRING" })
  readonly string?: string
  @EnvVar({ name: "TEST_NUMBER", type: "number" })
  readonly number?: number
  @EnvVar({ name: "TEST_BOOLEAN", type: "boolean" })
  readonly boolean?: boolean
  @EnvVar({ name: "TEST_ENUM", type: "enum", enumValues: ["test"] })
  readonly enum?: "test"
}

@Env()
class TestClass_WillRecieveEnvVariables_CustomNamesAndDefaultValues {
  @EnvVar({ name: "TEST_STRING", default: "default" })
  readonly string?: string
  @EnvVar({ name: "TEST_NUMBER", type: "number", default: "456" })
  readonly number?: number
  @EnvVar({ name: "TEST_BOOLEAN", type: "boolean", default: "false" })
  readonly boolean?: boolean
  @EnvVar({ name: "TEST_ENUM", default: "default" })
  readonly enum?: "test"
}

@Env()
class TestClass_EnumInvalidValue {
  @EnvVar({ type: "enum", enumValues: ["invalid"] })
  readonly TEST_ENUM?: "test"
}

describe("EnvVar", () => {
  beforeEach(() => {
    process.env.TEST_STRING = "test"
    process.env.TEST_NUMBER = "123"
    process.env.TEST_BOOLEAN = "true"
    process.env.TEST_ENUM = "test"
    process.env.TEST_UNSUPPORTED = "test"
  })

  test("should throw error if type is not supported", () => {
    expect(() => {
      new TestClass_UnsupportedType()
    }).toThrowError("Unsupported type unsupported for TEST_UNSUPPORTED")
  })

  test("will recieve env variables", () => {
    const testClass = new TestClass_WillRecieveEnvVariables()
    expect(testClass.TEST_STRING).toBe("test")
    expect(testClass.TEST_NUMBER).toBe(123)
    expect(testClass.TEST_BOOLEAN).toBe(true)
    expect(testClass.TEST_ENUM).toBe("test")
  })

  test("will recieve env variables with custom names", () => {
    const testClass = new TestClass_WillRecieveEnvVariables_CustomNames()
    expect(testClass.string).toBe("test")
    expect(testClass.number).toBe(123)
    expect(testClass.boolean).toBe(true)
    expect(testClass.enum).toBe("test")
  })

  test("will recieve env variables with custom names and default values", () => {
    const testClass =
      new TestClass_WillRecieveEnvVariables_CustomNamesAndDefaultValues()
    expect(testClass.string).toBe("test")
    expect(testClass.number).toBe(123)
    expect(testClass.boolean).toBe(true)
    expect(testClass.enum).toBe("test")
  })

  test("will throw error if enum value is not valid", () => {
    expect(() => {
      new TestClass_EnumInvalidValue()
    }).toThrowError("Invalid value invalid for TEST_ENUM")
  })
})
