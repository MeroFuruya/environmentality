type EnvironmentalityErrorCallback = (err: string[]) => void;
type EnvironmentalityOptions = {
    error_callback?: EnvironmentalityErrorCallback;
};
export declare function Env(options?: EnvironmentalityOptions): (target: Object) => void;
type EnvironmentalityPropertyOptions = {
    name?: string;
    required?: boolean;
    default?: string;
    type?: "string" | "number" | "boolean" | "enum";
    enumValues?: string[];
};
export declare function EnvVar(options?: EnvironmentalityPropertyOptions): <TClass extends object>(target: TClass, propertyKey: string) => void;
export {};
//# sourceMappingURL=index.d.ts.map