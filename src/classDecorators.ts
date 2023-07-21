import { EnvConverter, EnvironmentalityValueTypes } from "./convert"
import {
  defaultEnvironmentalityPropertyOptions,
  EnvironmentalityOptions,
  EnvironmentalityPropertyOptions,
  EnvironmentalityPropertyOptionsAny,
  EnvironmentalityPropertyOptionsList,
  EnvironmentalityPropertyTypes,
} from "./types"

export function EnvVar<T extends EnvironmentalityPropertyTypes>(
  options: EnvironmentalityPropertyOptions<T> = defaultEnvironmentalityPropertyOptions
) {
  return function <T extends object>(target: T, propertyKey: string) {
    if (!options) {
      options = defaultEnvironmentalityPropertyOptions
    }
    // set property name
    if (!options.name) {
      options.name = propertyKey
    }

    // create property options if they don't exist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(target as any)._environmentality_property_options) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(target as any)._environmentality_property_options = {}
    }
    // add property options to property options list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(target as any)._environmentality_property_options[propertyKey] = options

    Object.defineProperty(target, propertyKey, {
      get: function () {
        return this._environmentality_data[propertyKey]
      },
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type arbitraryClass = { new (...args: any[]): any }

// type EnvironmentalityClass = ReturnType<ReturnType<typeof Env>>
export function Env(options: EnvironmentalityOptions | undefined = undefined) {
  function _Env<T extends arbitraryClass>(target: T) {
    // create new class
    return class newClass extends target {
      // static _environmentality_data: {
      //   [key: string]: EnvironmentalityValueTypes
      // } = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        super(...args)
        // type target
        const _a = Object.getPrototypeOf(this)
        const _b = Object.getPrototypeOf(_a)

        const _target = Object.getPrototypeOf(Object.getPrototypeOf(this))
        // create property options and data if they don't exist
        if (!_target._environmentality_property_options) {
          _target._environmentality_property_options = {}
        }
        if (!_target._environmentality_data) {
          _target._environmentality_data = {}
        }
        // create variable property map and property options list
        const variablePropertyMap: { [key: string]: string } = {}
        const propertyOptionsList: EnvironmentalityPropertyOptionsList = []
        // iterate through property options and add to variable property map and property options list
        Object.keys(_target._environmentality_property_options).forEach(
          (propertyKey) => {
            // get property options
            const propertyOptions =
              _target._environmentality_property_options[propertyKey]
            // add property key to variable property map
            if (propertyOptions.name) {
              variablePropertyMap[propertyOptions.name] = propertyKey
            } else {
              variablePropertyMap[propertyKey] = propertyKey
            }
            // add property options to property options list
            propertyOptionsList.push(propertyOptions)
          }
        )
        // convert environment variables to class properties
        const converted = EnvConverter.convert(propertyOptionsList, options)
        // iterate through converted properties and add to data store
        Object.keys(converted).forEach((name) => {
          // just to make typescript happy
          if (!_target._environmentality_data) {
            _target._environmentality_data = {}
          }
          // get property key from variable property map
          const propertyKey = variablePropertyMap[name]
          // add converted property to data store
          if (propertyKey) {
            _target._environmentality_data[propertyKey] = converted[name]
          } else {
            _target._environmentality_data[name] = converted[name]
          }
        })
      }
    }
  }
  return _Env
}
