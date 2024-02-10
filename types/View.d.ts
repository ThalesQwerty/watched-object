/**
 * @template {Record<string, any>} T
 * @typedef {{ propertyName: keyof T, oldValue: T[keyof T], newValue: T[keyof T] }} WriteEvent<T>
 */
/**
 * @template {Record<string, any>} T
 * @template {Record<string, any>} U
 */
export class View<T extends Record<string, any>, U extends Record<string, any>> {
    /**
     * @param {Model<T>} model
     * @param {(keyof T)[]|Record<keyof U, (keyof T)|((model:T) => U[keyof U])>|null} mapKeys
     * @param {Types.Config} config
     */
    constructor(model: Model<T>, mapKeys?: Record<keyof U, keyof T | ((model: T) => U[keyof U])> | (keyof T)[], config?: Types.Config);
    /**
     * @type {Model<T>}
     * @readonly
     */
    readonly model: Model<T>;
    /**
     * @type {Model<U>|null}
     * @readonly
     */
    readonly view: Model<U> | null;
    get controller(): U;
    get watcher(): {
        addListener<U_1 extends keyof Types.WatcherEvent<U>>(event: U_1, listener: Types.WatcherEvent<U>[U_1]): any;
        prependListener<U_2 extends keyof Types.WatcherEvent<U>>(event: U_2, listener: Types.WatcherEvent<U>[U_2]): any;
        prependOnceListener<U_3 extends keyof Types.WatcherEvent<U>>(event: U_3, listener: Types.WatcherEvent<U>[U_3]): any;
        removeListener<U_4 extends keyof Types.WatcherEvent<U>>(event: U_4, listener: Types.WatcherEvent<U>[U_4]): any;
        removeAllListeners(event?: keyof Types.WatcherEvent<U>): any;
        once<U_5 extends keyof Types.WatcherEvent<U>>(event: U_5, listener: Types.WatcherEvent<U>[U_5]): any;
        on<U_6 extends keyof Types.WatcherEvent<U>>(event: U_6, listener: Types.WatcherEvent<U>[U_6]): any;
        off<U_7 extends keyof Types.WatcherEvent<U>>(event: U_7, listener: Types.WatcherEvent<U>[U_7]): any;
        emit<U_8 extends keyof Types.WatcherEvent<U>>(event: U_8, ...args: Parameters<Types.WatcherEvent<U>[U_8]>): boolean;
        eventNames<U_9 extends keyof Types.WatcherEvent<U>>(): U_9[];
        listenerCount(type: keyof Types.WatcherEvent<U>): number;
        listeners<U_10 extends keyof Types.WatcherEvent<U>>(type: U_10): Types.WatcherEvent<U>[U_10][];
        rawListeners<U_11 extends keyof Types.WatcherEvent<U>>(type: U_11): Types.WatcherEvent<U>[U_11][];
        getMaxListeners(): number;
        setMaxListeners(n: number): any;
    };
    destroy(): void;
    #private;
}
/**
 * <T>
 */
export type WriteEvent<T extends Record<string, any>> = {
    propertyName: keyof T;
    oldValue: T[keyof T];
    newValue: T[keyof T];
};
import { Model } from "./Model.js";
import * as Types from "./Model.js";
//# sourceMappingURL=View.d.ts.map