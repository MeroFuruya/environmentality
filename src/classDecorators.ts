import { EnvConverter } from "./convert"
import {
  defaultEnvironmentalityPropertyOptions,
  EnvironmentalityOptions,
  EnvironmentalityPropertyOptions,
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

    // type target
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _target = target as any
    // create property options if they don't exist
    if (!_target._environmentality_property_options) {
      _target._environmentality_property_options = {}
    }
    // add property options to property options list
    _target._environmentality_property_options[propertyKey] = options

    Object.defineProperty(target, propertyKey, {
      get: function () {
        return _target._environmentality_data[propertyKey]
      },
    })
  }
}

type arbitraryClass = { new (...args: any[]): any }
// type EnvironmentalityClass = ReturnType<ReturnType<typeof Env>>
export function Env(options: EnvironmentalityOptions | undefined = undefined) {
  function _Env<T extends arbitraryClass>(target: T) {
    // create new class
    return class newClass extends target {
      static _environmentality_data: { [key: string]: any } = {}
      constructor(...args: any[]) {
        super(...args)
        // type target
        const _target = target as unknown as {
          prototype: {
            _environmentality_property_options: {
              [key: string]: EnvironmentalityPropertyOptions<any>
            }
            _environmentality_data: { [key: string]: any } | undefined
          }
        }
        // create property options and data if they don't exist
        if (!_target.prototype._environmentality_property_options) {
          _target.prototype._environmentality_property_options = {}
        }
        if (!_target.prototype._environmentality_data) {
          _target.prototype._environmentality_data = {}
        }
        // create variable property map and property options list
        const variablePropertyMap: { [key: string]: string } = {}
        const propertyOptionsList: EnvironmentalityPropertyOptionsList = []
        // iterate through property options and add to variable property map and property options list
        Object.keys(
          _target.prototype._environmentality_property_options
        ).forEach((propertyKey) => {
          // get property options
          const propertyOptions =
            _target.prototype._environmentality_property_options[propertyKey]
          // add property key to variable property map
          if (propertyOptions.name) {
            variablePropertyMap[propertyOptions.name] = propertyKey
          } else {
            variablePropertyMap[propertyKey] = propertyKey
          }
          // add property options to property options list
          propertyOptionsList.push(propertyOptions)
        })
        // convert environment variables to class properties
        const converted = EnvConverter.convert(propertyOptionsList, options)
        // iterate through converted properties and add to data store
        Object.keys(converted).forEach((name) => {
          // just to make typescript happy
          if (!_target.prototype._environmentality_data) {
            _target.prototype._environmentality_data = {}
          }
          // get property key from variable property map
          const propertyKey = variablePropertyMap[name]
          // add converted property to data store
          if (propertyKey) {
            _target.prototype._environmentality_data[propertyKey] =
              converted[name]
          } else {
            _target.prototype._environmentality_data[name] = converted[name]
          }
        })
      }
    }
  }
  return _Env
}
