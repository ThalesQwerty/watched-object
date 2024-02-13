import { EventEmitter } from "events";
import { TypedEmitter } from "tiny-typed-emitter";

const IGNORED_KEYS = [...Object.keys(EventEmitter.prototype), ...Object.keys(new EventEmitter())].flat();

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
    "change": (event: {newValues: Partial<T>, oldValues: Partial<T>, metadata: Record<string, any>|undefined}) => void;
    "read": (event: {[K in keyof T]: {key: K, value: T[K], metadata: Record<string, any>|undefined}}[keyof T]) => void;
    "write": (event: {[K in keyof T]: {key: K, oldValue: T[K], newValue: T[K], metadata: Record<string, any>|undefined}[keyof T]}) => void;
    "call": (event: {[K in keyof T]: T[K] extends (...params: infer P) => infer R ? {methodName: K, parameters: P, returnedValue: R, metadata: Record<string, any>|undefined} : never}[keyof T]) => void;
 * }} WatcherEvent
 */

/**
 * @template {Record<string, any>} T
 * @extends {TypedEmitter<WatcherEvent<T>>}
 */
class Watcher extends EventEmitter {
    constructor() {
        super();
    }
}

/**
 * A watched object
 * 
 * @template {Record<string, any>} T
 * 
 */
export class Model {
    /**
     * Use this to change the values of the `soruce` object`
     * 
     * @type {T}
     * @readonly
     */
    controller;

    /**
     * Original object
     * 
     * @type {T}
     * @readonly
     */
    source;

    /**
     * Emits events whenever the `controller` is used or altered in some way.
     * 
     * @type {Watcher<T>}
     * @readonly
     */
    watcher;

    /**
     * Metadata that will be emitted on this model's events
     */
    #metadata;

    /**
     * @param {T} source 
     * @param {Config} config
     */
    constructor(source, config = {}) {
        const ignoredKeys = [...IGNORED_KEYS, ...(config.ignoreKeys ?? [])];
        const events = config.events ?? ["call", "change", "read", "write"];
        const isMutable = config.mutable ?? true;

        this.source = source;
        const watcher = this.watcher = new Watcher();

        this.useMetadata = this.useMetadata.bind(this);
        const event = (payload) => this.#metadata ? {...payload, metadata: this.#metadata } : payload;

        const changes = {
            newValues: {},
            oldValues: {},
            emitting: false,
            metadata: void 0
        };

        const emitChange = (key, newValue, oldValue) => {
            if (ignoredKeys.includes(key)) return;
            if (events.includes("write")) watcher.emit("write", event({ key, newValue, oldValue }));

            changes.newValues[key] = newValue;
            if (!Object.keys(changes.oldValues).includes(key)) changes.oldValues[key] = oldValue;
            if (this.#metadata) changes.metadata = {...changes.metadata, ...this.#metadata};

            if (!changes.emitting) {
                changes.emitting = true;

                setTimeout(() => {
                    const eventParams = {
                        newValues: changes.newValues,
                        oldValues: changes.oldValues,
                        metadata: changes.metadata
                    };

                    changes.newValues = {};
                    changes.oldValues = {};
                    changes.emitting = false;
                    changes.metadata = void 0;

                    if (events.includes("change")) watcher.emit("change", eventParams);
                }, 0);
            }
        }

        /**
         * @type {Model[]}
         */
        const duplicates = [];

        this.controller = new Proxy(source, {
            get(target, key) {
                const value = target[key];
                if (ignoredKeys.includes(key)) return value;

                if (events.includes("read")) watcher.emit("read", event({ key, value }));

                if (typeof value === "object") {
                    const duplicate = duplicates.find(duplicate => duplicate.source === value);

                    if (duplicate) {
                        return duplicate.controller;
                    } else {
                        const watchedChild = new Model(value instanceof Model ? value.source : value, { events });

                        watchedChild.watcher.on("write", () => {
                            if (target[key] === watchedChild.source) {
                                emitChange(key, value, value);
                            }
                        });

                        duplicates.push(watchedChild);

                        return watchedChild.controller;
                    }
                } else if (typeof value === "function") {
                    return new Proxy(value, {
                        /**
                         * @param {Function} target 
                         * @param {object} thisArg 
                         * @param {any[]} params 
                         * @returns {any}
                         */
                        apply(target, thisArg, parameters) {
                            const returnedValue = target.apply(thisArg, parameters);

                            if (events.includes("call")) watcher.emit("call", event({ parameters, returnedValue, methodName: key }));

                            return returnedValue;
                        }
                    });
                } else {
                    return value;
                }
            },
            set(target, key, value) {
                const previousValue = target[key];
                if (isMutable) target[key] = value;

                if (value !== previousValue) {
                    emitChange(key, value, previousValue);
                }

                return true;
            },
            deleteProperty(target, key) {
                if (Object.keys(target).includes(key)) {
                    const previousValue = target[key];
                    if (isMutable) delete target[key];

                    emitChange(key, undefined, previousValue);
                }

                return true;
            }
        });
    }

    /**
     * Applies a given metadata to events emitted from this model. The metadata will be applied only inside this function.
     * 
     * @template {Record<string,any>} D
     * @param {D} metadata The metadata to be used
     * @param {(controller: T) => void} procedure What to do with the model
     */
    useMetadata(metadata, procedure) {
        const oldMetadata = this.#metadata;
        this.#metadata = metadata;
        procedure(this.controller);
        this.#metadata = oldMetadata;
    }
}