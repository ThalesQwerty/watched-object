import { Model } from "./Model.js";
import * as Types from "./Model.js";

/**
 * @template {Record<string, any>} T
 * @typedef {{ key: keyof T, oldValue: T[keyof T], newValue: T[keyof T] }} WriteEvent<T>
 */

/**
 * @template {Record<string, any>} T
 * @template {Record<string, any>} U
 */
export class View {
    /**
     * The model from which this view will be reacting to changes
     * 
     * @type {Model<T>}
     * @readonly
     */
    target;

    /**
     * The model generated from this view
     * 
     * @type {Model<U>|null}
     * @readonly
     */
    model;

    /**
     * The `controller` of the model generated from this view
     */
    get controller() {
        return this.model.controller;
    }

    /**
     * The `watcher` (event emitter) of the model generated from this view
     */
    get watcher() {
        return this.model.watcher;
    }

    /**
     * @type {((event: WriteEvent) => void)[]}
     */
    #writeEvents = [];

    /**
     * @param {Model<T>} target 
     * @param {(keyof T)[]|Record<keyof U, (keyof T)|((target:T) => U[keyof U])>|null} mapKeys 
     * @param {Types.Config} config
     */
    constructor(targetModel, mapKeys = null, config = {}) {
        this.target = targetModel;
        this.model = new Model({}, config);

        if (typeof mapKeys !== "object") return;

        const { watcher } = this.target;

        if (!mapKeys || mapKeys instanceof Array) {
            /**
             * @param {WriteEvent<T>} event
             */
            const handler = (event) => {
                if (!mapKeys || mapKeys.includes(event.key)) {
                    this.model.controller[event.key] = event.newValue;
                }
            };

            watcher.on("write", handler);
            this.#writeEvents.push(handler);

            if (mapKeys) {
                for (const key of mapKeys) {
                    this.model.controller[key] = this.target.controller[key];
                }
            } else {
                for (const key of Object.keys(this.target.controller)) {
                    this.model.controller[key] = this.target.controller[key];
                }
            }
        } else {
            /**
             * @type {Record<keyof U, {
             *  dependencies: (keyof T)[];
             *  update: () => void;
             * }>}
             */
            const inferrences = {};

            /**
             * @param {WriteEvent<T>} event
             */
            const handler = (event) => {
                for (const key in inferrences) {
                    if (inferrences[key].dependencies.includes(event.key)) {
                        inferrences[key].update();
                    }
                }
            };

            watcher.on("write", handler);
            this.#writeEvents.push(handler);

            for (const key in mapKeys) {
                inferrences[key] = {
                    dependencies: [],
                    update: () => {
                        const dependencies = inferrences[key].dependencies;

                        const addDependency = ({ key }) => {
                            if (!dependencies.includes(key)) {
                                dependencies.push(key);
                            }
                        }

                        if (typeof mapKeys[key] === "function") {
                            this.target.watcher.on("read", addDependency);

                            this.model.controller[key] = mapKeys[key](this.target.controller);

                            this.target.watcher.off("read", addDependency);
                        } else {
                            addDependency({ key: mapKeys[key] });
                            this.model.controller[key] = this.target.controller[mapKeys[key]];
                        }
                    }
                }

                inferrences[key].update();
            }
        }
    }

    /**
     * Permanently disables this view (it won't be updated anymore)
     */
    destroy() {
        for (const writeEvent of this.#writeEvents) {
            this.target.watcher.off("write", writeEvent);
        }
    }
}