import { Model } from "./Model";
import * as Types from "./Model";

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
    self;

    /**
     * The model generated from this view
     */
    get model() {
        return this.self;
    }

    /**
     * The `controller` of the model generated from this view
     */
    get controller() {
        return this.self.controller;
    }

    /**
     * The `watcher` (event emitter) of the model generated from this view
     */
    get watcher() {
        return this.self.watcher;
    }

    /**
     * @readonly
     * @type {{target: ((event: WriteEvent) => void)[], self: ((event: WriteEvent) => void)[]}}
     */
    #writeEvents = {
        target: [],
        self: []
    };

    /**
     * @param {Model<T>} target 
     * @param {(keyof T & keyof U)[] | {[K in keyof U]: (keyof T) | ((this: U, target:T, self:T) => U[K])} | null} mapKeys 
     * @param {Types.Config} config
     */
    constructor(targetModel, mapKeys = null, config = {}) {
        this.target = targetModel;
        this.self = new Model({}, config);

        if (typeof mapKeys !== "object") return;

        if (!mapKeys || mapKeys instanceof Array) {
            /**
             * @param {WriteEvent<T>} event
             */
            const handler = (event) => {
                if (!mapKeys || mapKeys.includes(event.key)) {
                    this.self.controller[event.key] = event.newValue;
                }
            };

            this.target.watcher.on("write", handler);
            this.#writeEvents.target.push(handler);

            if (mapKeys) {
                for (const key of mapKeys) {
                    this.self.controller[key] = this.target.controller[key];
                }
            } else {
                for (const key of Object.keys(this.target.controller)) {
                    this.self.controller[key] = this.target.controller[key];
                }
            }
        } else {
            /**
             * @type {Record<keyof U, {
             *  dependencies: {
             *      target: (keyof T)[];
             *      self: (keyof U)[];
             *  }
             *  update: () => void;
             * }>}
             */
            const inferrences = {};

            /**
             * @param {WriteEvent<T>} event
             */
            const targetHandler = (event) => {
                for (const key in inferrences) {
                    if (inferrences[key].dependencies.target.includes(event.key)) {
                        inferrences[key].update();
                    }
                }
            };

            this.target.watcher.on("write", targetHandler);
            this.#writeEvents.target.push(targetHandler);

            /**
             * @param {WriteEvent<T>} event
             */
            const selfHandler = (event) => {
                for (const key in inferrences) {
                    if (inferrences[key].dependencies.self.includes(event.key)) {
                        inferrences[key].update();
                    }
                }
            };

            this.self.watcher.on("write", selfHandler);
            this.#writeEvents.self.push(selfHandler);

            for (const key in mapKeys) {
                inferrences[key] = {
                    dependencies: {
                        target: [],
                        self: []
                    },
                    update: () => {
                        const dependencies = inferrences[key].dependencies;

                        const addTargetDependency = ({ key }) => {
                            if (!dependencies.target.includes(key)) {
                                dependencies.target.push(key);
                            }
                        }

                        const addSelfDependency = ({ key }) => {
                            if (!dependencies.self.includes(key)) {
                                dependencies.self.push(key);
                            }
                        }

                        if (typeof mapKeys[key] === "function") {
                            this.target.watcher.on("read", addTargetDependency);
                            this.self.watcher.on("read", addSelfDependency);

                            this.self.controller[key] = mapKeys[key].call(this.self.controller, this.target.controller, this.self.controller);

                            this.target.watcher.off("read", addTargetDependency);
                            this.self.watcher.on("read", addSelfDependency);
                        } else {
                            addTargetDependency({ key: mapKeys[key] });
                            this.self.controller[key] = this.target.controller[mapKeys[key]];
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
        for (const targetWriteEvent of this.#writeEvents.target) {
            this.target.watcher.off("write", targetWriteEvent);
        }

        for (const selfWriteEvent of this.#writeEvents.self) {
            this.self.watcher.off("write", selfWriteEvent);
        }
    }
}