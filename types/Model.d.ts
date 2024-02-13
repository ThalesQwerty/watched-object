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
    constructor(source: T, config?: any);
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
    /**
     * Applies a given metadata to events emitted from this model. The metadata will be applied only inside this function.
     *
     * @template {Record<string,any>} D
     * @param {D} metadata The metadata to be used
     * @param {(controller: T) => void} procedure What to do with the model
     */
    useMetadata<D extends Record<string, any>>(metadata: D, procedure: (controller: T) => void): void;
    #private;
}
export type Config<T extends Record<string, any>> = {
    ignoreKeys?: (keyof T)[];
    events?: (keyof WatcherEvent<T>)[];
    mutable?: boolean;
};
/**
 * @template {Record<string, any>} T
 * @typedef {{
 *   ignoreKeys?: (keyof T)[],
 *   events?: (keyof WatcherEvent<T>)[],
 *   mutable?: boolean
 * }} Config
 */
/**
 * @template {Record<string, any>} T
 * @typedef {{
    "change": (event: {newValues: Partial<T>, oldValues: Partial<T>, metadata: Record<string, any>|undefined}) => void,
    "read": (event: {[K in keyof T]: {key: K, value: T[K], metadata: Record<string, any>|undefined}}[keyof T]) => void,
    "write": (event: {[K in keyof T]: {key: K, oldValue: T[K], newValue: T[K]}, metadata: Record<string, any>|undefined}[keyof T]) => void,
    "call": (event: {[K in keyof T]: T[K] extends (...params: infer P) => infer R ? {methodName: K, parameters: P, returnedValue: R, metadata: Record<string, any>|undefined} : never}[keyof T]) => void
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