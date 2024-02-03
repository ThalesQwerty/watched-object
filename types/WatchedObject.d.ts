/**
 * @template {Record<string, any>}  T
 */
export class WatchedObject<T extends Record<string, any>> {
    /**
     * @param {T} source
     * @param {(keyof T)[]} excludeKeys
     */
    constructor(source: T, excludeKeys?: (keyof T)[]);
    /**
     * @type {T}
     */
    proxy: T;
    /**
     * @type {T}
     */
    source: T;
    /**
     * @type {Watcher<T>}
     */
    watcher: Watcher<T>;
}
/**
 * @template {Record<string, any>} T
 * @extends {TypedEmitter<{
    "change": (event: {newValues: Partial<T>, oldValues: Partial<T>}) => void,
    "write": <K extends keyof T>(event: {propertyName: K, oldValue: T[K], newValue: T[K]}) => void,
    "call": <K extends keyof T>(event: {methodName: K, parameters: Parameters<T[K]>, returnedValue: ReturnValue<T[K]>}) => void
 * }>}
 */
declare class Watcher<T extends Record<string, any>> extends TypedEmitter<{
    change: (event: {
        newValues: Partial<T>;
        oldValues: Partial<T>;
    }) => void;
    write: <K extends keyof T>(event: {
        propertyName: K;
        oldValue: T[K];
        newValue: T[K];
    }) => void;
    call: <K_1 extends keyof T>(event: {
        methodName: K_1;
        parameters: Parameters<T[K_1]>;
        returnedValue: ReturnValue<T[K_1]>;
    }) => void;
}> {
    constructor();
}
import { TypedEmitter } from "tiny-typed-emitter";
export {};
//# sourceMappingURL=WatchedObject.d.ts.map