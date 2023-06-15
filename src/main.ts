import { Env, EnvVar } from "."
import { config } from "dotenv"

config()

@Env()
class Environement {
  @EnvVar({ type: String, default: "localhost" })
  readonly HOST!: string

  @EnvVar({ type: Number, default: 3000 })
  readonly PORT!: number

  @EnvVar({ type: Boolean, default: false })
  readonly DEBUG!: boolean

  @EnvVar({ type: String, array: true, default: [] })
  readonly ARRAY!: string[]

  @EnvVar({ type: Number, array: true, default: [] })
  readonly ARRAY_NUMBERS!: number[]

  @EnvVar({ type: Boolean, array: true, default: [] })
  readonly ARRAY_BOOLEANS!: boolean[]

  @EnvVar({
    type: String,
    array: true,
    default: [],
    enumValues: ["a", "b", "c"],
  })
  readonly ARRAY_ENUM!: ("a" | "b" | "c")[]

  @EnvVar({ type: Number, array: true, default: [], enumValues: [1, 2, 3] })
  readonly ARRAY_NUMBERS_ENUM!: (1 | 2 | 3)[]
}

const env = new Environement()

console.log(env.HOST)
console.log(env.PORT)
console.log(env.DEBUG)
console.log(env.ARRAY)
console.log(env.ARRAY_NUMBERS)
console.log(env.ARRAY_BOOLEANS)
console.log(env.ARRAY_ENUM)
console.log(env.ARRAY_NUMBERS_ENUM)
