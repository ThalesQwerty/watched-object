import { WatchedObject } from "./WatchedObject.js";
import * as Types from "./WatchedObject.js";

/**
 * @template {Record<string, any>} T
 * @typedef {{ propertyName: keyof T, oldValue: T[keyof T], newValue: T[keyof T] }} WriteEvent<T>
 */

/**
 * @template {Record<string, any>} T
 * @template {Record<string, any>} U
 */
export class ObjectWatcher {
    /**
     * @type {WatchedObject<T>}
     * @readonly
     */
    target;

    /**
     * @type {WatchedObject<U>|null}
     * @readonly
     */
    view;

    /**
     * @type {((event: WriteEvent) => void)[]}
     */
    #writeEvents = []

    /**
     * @param {WatchedObject<T>} watchedObject 
     * @param {(keyof T)[]|Record<keyof U, (keyof T)|((model:T) => U[keyof U])>|null} mapKeys 
     * @param {Types.Config} config
     */
    constructor(watchedObject, mapKeys = null, config = {}) {
        this.target = watchedObject;
        this.view = new WatchedObject({}, config);

        if (typeof mapKeys !== "object") return;

        const { watcher } = watchedObject;

        if (!mapKeys || mapKeys instanceof Array) {
            /**
             * @param {WriteEvent<T>} event
             */
            const handler = (event) => {
                if (!mapKeys || mapKeys.includes(event.propertyName)) {
                    this.view.proxy[event.propertyName] = event.newValue;
                }
            };

            watcher.on("write", handler);
            this.#writeEvents.push(handler);

            if (mapKeys) {
                for (const key of mapKeys) {
                    this.view.proxy[propertyName] = this.target.proxy[key];
                }
            }
        } else {
            /**
             * @type {Record<keyof U, {
             *  key: keyof U;
             *  method: (keyof T) | ((this: T) => any);
             *  dependencies: (keyof T)[];
             *  update: null | (() => void);
             * }>}
             */
            const inferrences = {};

            /**
             * @param {WriteEvent<T>} event
             */
            const handler = (event) => {
                for (const key in inferrences) {
                    if (!inferrences[key].method) continue;

                    if (inferrences[key].dependencies.includes(event.propertyName)) {
                        if (inferrences[key].method === event.propertyName) {
                            this.view.proxy[key] = event.newValue;
                        } else if (typeof inferrences[key].method === "function") {
                            inferrences[key].update();
                        }
                    }
                }
            };

            watcher.on("write", handler);
            this.#writeEvents.push(handler);

            for (const key in mapKeys) {
                inferrences[key] = {
                    key,
                    dependencies: [],
                    method: mapKeys[key],
                    update: () => {
                        const dependencies = inferrences[key].dependencies;

                        const addDependency = ({ propertyName }) => {
                            if (!dependencies.includes(propertyName)) {
                                dependencies.push(propertyName);
                            }
                        }

                        if (typeof mapKeys[key] === "function") {
                            this.target.watcher.on("read", addDependency);

                            this.view.proxy[key] = mapKeys[key](this.target.proxy);

                            this.target.watcher.off("read", addDependency);
                        } else {
                            addDependency(mapKeys[key]);
                            this.view.proxy[key] = this.target.proxy[key];
                        }
                    }
                }

                inferrences[key].update();
            }
        }
    }

    destroy() {
        for (const writeEvent of this.#writeEvents) {
            this.target.watcher.off("write", writeEvent);
        }
    }
}