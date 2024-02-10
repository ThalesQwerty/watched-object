import { Model } from "./Model.js";
import * as Types from "./Model.js";

/**
 * @template {Record<string, any>} T
 * @typedef {{ propertyName: keyof T, oldValue: T[keyof T], newValue: T[keyof T] }} WriteEvent<T>
 */

/**
 * @template {Record<string, any>} T
 * @template {Record<string, any>} U
 */
export class View {
    /**
     * @type {Model<T>}
     * @readonly
     */
    model;

    /**
     * @type {Model<U>|null}
     * @readonly
     */
    view;

    get controller() {
        return this.view.controller;
    }

    get watcher() {
        return this.view.watcher;
    }

    /**
     * @type {((event: WriteEvent) => void)[]}
     */
    #writeEvents = [];

    /**
     * @param {Model<T>} model 
     * @param {(keyof T)[]|Record<keyof U, (keyof T)|((model:T) => U[keyof U])>|null} mapKeys 
     * @param {Types.Config} config
     */
    constructor(model, mapKeys = null, config = {}) {
        this.model = model;
        this.view = new Model({}, config);

        if (typeof mapKeys !== "object") return;

        const { watcher } = model;

        if (!mapKeys || mapKeys instanceof Array) {
            /**
             * @param {WriteEvent<T>} event
             */
            const handler = (event) => {
                if (!mapKeys || mapKeys.includes(event.propertyName)) {
                    this.view.controller[event.propertyName] = event.newValue;
                }
            };

            watcher.on("write", handler);
            this.#writeEvents.push(handler);

            if (mapKeys) {
                for (const key of mapKeys) {
                    this.view.controller[key] = this.model.controller[key];
                }
            } else {
                for (const key of Object.keys(this.model.controller)) {
                    this.view.controller[key] = this.model.controller[key];
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
                    if (inferrences[key].dependencies.includes(event.propertyName)) {
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

                        const addDependency = ({ propertyName }) => {
                            if (!dependencies.includes(propertyName)) {
                                dependencies.push(propertyName);
                            }
                        }

                        if (typeof mapKeys[key] === "function") {
                            this.model.watcher.on("read", addDependency);

                            this.view.controller[key] = mapKeys[key](this.model.controller);

                            this.model.watcher.off("read", addDependency);
                        } else {
                            addDependency({ propertyName: mapKeys[key] });
                            this.view.controller[key] = this.model.controller[mapKeys[key]];
                        }
                    }
                }

                inferrences[key].update();
            }
        }
    }

    destroy() {
        for (const writeEvent of this.#writeEvents) {
            this.model.watcher.off("write", writeEvent);
        }
    }
}