/**
 * @template {Record<string, any>}  T
 */
export class WatchedObject<T extends Record<string, any>> {
    /**
     * @param {T} source
     * @param {{
     *  ignoreKeys?: (keyof T)[],
     *  events?: (keyof WatcherEvent<T>)[]
     * }} config
     */
    constructor(source: T, config?: {
        ignoreKeys?: (keyof T)[];
        events?: (keyof WatcherEvent<T>)[];
    });
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
//# sourceMappingURL=WatchedObject.d.ts.map