/**
 * A watched object
 *
 * @template {Record<string, any>} T
 *
 */
export class Model<T extends Record<string, any>> {
    /**
     * @param {T} source
     * @param {Config} config
     */
    constructor(source: T, config?: Config);
    /**
     * Use this to change the values of the `soruce` object`
     *
     * @type {T}
     * @readonly
     */
    readonly controller: T;
    /**
     * Original object
     *
     * @type {T}
     * @readonly
     */
    readonly source: T;
    /**
     * Emits events whenever the `controller` is used or altered in some way.
     *
     * @type {Watcher<T>}
     * @readonly
     */
    readonly watcher: Watcher<T>;
}
export type Config = {
    ignoreKeys?: (keyof T)[];
    events?: (keyof WatcherEvent<T>)[];
    mutable?: boolean;
};
export type WatcherEvent<T extends Record<string, any>> = {
    change: (event: {
        newValues: Partial<T>;
        oldValues: Partial<T>;
    }) => void;
    read: (event: { [K in keyof T]: {
        propertyName: K;
        value: T[K];
    }; }[keyof T]) => void;
    write: (event: { [K_1 in keyof T]: {
        propertyName: K_1;
        oldValue: T[K_1];
        newValue: T[K_1];
    }; }[keyof T]) => void;
    call: (event: { [K_2 in keyof T]: T[K_2] extends (...params: infer P) => infer R ? {
        methodName: K_2;
        parameters: P;
        returnedValue: R;
    } : never; }[keyof T]) => void;
};
/**
 * @typedef {{
 *   ignoreKeys?: (keyof T)[],
 *   events?: (keyof WatcherEvent<T>)[],
 *   mutable?: boolean
 * }} Config
 */
/**
 * @template {Record<string, any>} T
 * @typedef {{
    "change": (event: {newValues: Partial<T>, oldValues: Partial<T>}) => void,
    "read": (event: {[K in keyof T]: {propertyName: K, value: T[K]}}[keyof T]) => void,
    "write": (event: {[K in keyof T]: {propertyName: K, oldValue: T[K], newValue: T[K]}}[keyof T]) => void,
    "call": (event: {[K in keyof T]: T[K] extends (...params: infer P) => infer R ? {methodName: K, parameters: P, returnedValue: R} : never}[keyof T]) => void
 * }} WatcherEvent
 */
/**
 * @template {Record<string, any>} T
 * @extends {TypedEmitter<WatcherEvent<T>>}
 */
declare class Watcher<T extends Record<string, any>> extends TypedEmitter<WatcherEvent<T>> {
    constructor();
}
import { TypedEmitter } from "tiny-typed-emitter";
export {};
//# sourceMappingURL=Model.d.ts.map