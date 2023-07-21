import { ConvertErrors } from "../src/errors"
import { describe, test, expect, beforeEach, jest } from "@jest/globals"

const custom_callback: jest.Mock = jest.fn()
let errors: ConvertErrors

describe("errors", () => {
  beforeEach(() => {
    custom_callback.mockClear()
    errors = new ConvertErrors(custom_callback)
  })

  test("convert_errors_custom_callback", () => {
    errors.add_error("error")
    errors.finish()
    expect(custom_callback).toHaveBeenCalled()
  })
})
