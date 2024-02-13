/**
 * @template {Record<string, any>} T
 * @typedef {{ key: keyof T, oldValue: T[keyof T], newValue: T[keyof T] }} WriteEvent<T>
 */
/**
 * @template {Record<string, any>} T
 * @template {Record<string, any>} U
 */
export class View<T extends Record<string, any>, U extends Record<string, any>> {
    /**
     * @param {Model<T>} target
     * @param {(keyof T & keyof U)[] | {[K in keyof U]: (keyof T) | ((this: U, target:T, self:T) => U[K])} | null} mapKeys
     * @param {Types.Config} config
     */
    constructor(targetModel: any, mapKeys?: { [K in keyof U]: keyof T | ((this: U, target: T, self: T) => U[K]); } | (keyof T & keyof U)[], config?: any);
    /**
     * The model from which this view will be reacting to changes
     *
     * @type {Model<T>}
     * @readonly
     */
    readonly target: Model<T>;
    /**
     * The model generated from this view
     *
     * @type {Model<U>|null}
     * @readonly
     */
    readonly self: Model<U> | null;
    /**
     * The model generated from this view
     */
    get model(): Model<U>;
    /**
     * The `controller` of the model generated from this view
     */
    get controller(): U;
    /**
     * The `watcher` (event emitter) of the model generated from this view
     */
    get watcher(): {
        addListener<U_1 extends string | number | symbol>(event: U_1, listener: WatcherEvent<T_1>): any;
        prependListener<U_2 extends string | number | symbol>(event: U_2, listener: WatcherEvent<T_1>): any;
        prependOnceListener<U_3 extends string | number | symbol>(event: U_3, listener: WatcherEvent<T_1>): any;
        removeListener<U_4 extends string | number | symbol>(event: U_4, listener: WatcherEvent<T_1>): any;
        removeAllListeners(event?: string | number | symbol): any;
        once<U_5 extends string | number | symbol>(event: U_5, listener: WatcherEvent<T_1>): any;
        on<U_6 extends string | number | symbol>(event: U_6, listener: WatcherEvent<T_1>): any;
        off<U_7 extends string | number | symbol>(event: U_7, listener: WatcherEvent<T_1>): any;
        emit<U_8 extends string | number | symbol>(event: U_8, ...args: unknown[]): boolean;
        eventNames<U_9 extends string | number | symbol>(): U_9[];
        listenerCount(type: string | number | symbol): number;
        listeners<U_10 extends string | number | symbol>(type: U_10): WatcherEvent<T_1>[];
        rawListeners<U_11 extends string | number | symbol>(type: U_11): WatcherEvent<T_1>[];
        getMaxListeners(): number;
        setMaxListeners(n: number): any;
    };
    /**
     * Permanently disables this view (it won't be updated anymore)
     */
    destroy(): void;
    #private;
}
/**
 * <T>
 */
export type WriteEvent<T extends Record<string, any>> = {
    key: keyof T;
    oldValue: T[keyof T];
    newValue: T[keyof T];
};
import { Model } from "./Model.js";
//# sourceMappingURL=View.d.ts.map