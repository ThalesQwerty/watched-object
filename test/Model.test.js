import { Model } from "../lib/Model";

function delay(milliseconds = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

describe("Model", () => {
    test("Read event", () => {
        let readEvent;

        const { controller, watcher } = new Model({
            a: 1,
            b: 2,
            c: 3,
            ignoredKey: 0
        }, { ignoreKeys: ["ignoredKey"] });

        watcher.on("read", event => {
            readEvent = event;
        });

        controller.ignoredKey;
        expect(readEvent).toBeUndefined();

        controller.a;
        expect(readEvent).toEqual({ key: "a", value: 1 });

        controller.b = 20;
        expect(readEvent).toEqual({ key: "a", value: 1 });

        controller.a = controller.b;
        expect(readEvent).toEqual({ key: "b", value: 20 });

        controller.a;
        expect(readEvent).toEqual({ key: "a", value: 20 });

        controller.c;
        expect(readEvent).toEqual({ key: "c", value: 3 });
    });
    
    describe("Write event", () => {
        test("Primitives", () => {
            let writeEvent;

            const { controller, watcher } = new Model({
                a: 1,
                b: 2,
                c: 3,
                ignoredKey: 0
            }, { ignoreKeys: ["ignoredKey"] });
            
            watcher.on("write", event => {
                writeEvent = event;
            });

            controller.ignoredKey = 1;
            expect(writeEvent).toBeUndefined();

            controller.a = 10;
            expect(writeEvent).toEqual({ key: "a", oldValue: 1, newValue: 10 });

            controller.b = 20;
            expect(writeEvent).toEqual({ key: "b", oldValue: 2, newValue: 20 });

            controller.c = 30;
            expect(writeEvent).toEqual({ key: "c", oldValue: 3, newValue: 30 });
        });

        test("Objects", () => {
            let writeEvent;

            const { controller, watcher } = new Model({
                obj: {
                    x: 0,
                    y: 1
                }
            });

            watcher.on("write", event => {
                writeEvent = event;
            });

            const oldObj = controller.obj;

            controller.obj.y = 0;
            expect(writeEvent).toEqual({ key: "obj", oldValue: oldObj, newValue: oldObj });

            const newObj = controller.obj = {
                x: 1,
                y: 0
            };
            expect(writeEvent).toEqual({ key: "obj", oldValue: oldObj, newValue: newObj });

            writeEvent = undefined;
            
            oldObj.z = -1;
            expect(writeEvent).toBeUndefined();

            controller.obj.z = -1;
            expect(writeEvent).toEqual({ key: "obj", oldValue: newObj, newValue: newObj });
        });

        test("Immutability", () => {
            let writeEvent;

            const mutableModel = new Model({
                a: 1
            }, { mutable: true });

            const immutableModel = new Model({
                x: 1
            }, { mutable: false });
            
            mutableModel.watcher.on("write", event => {
                writeEvent = event;
            });

            immutableModel.watcher.on("write", event => {
                writeEvent = event;
            });

            const { controller: mutable } = mutableModel;
            const { controller: immutable } = immutableModel;

            mutable.a = 10;
            expect(writeEvent).toEqual({ key: "a", oldValue: 1, newValue: 10 });
            expect(mutable.a).toBe(10);

            immutable.x = 10;
            expect(writeEvent).toEqual({ key: "x", oldValue: 1, newValue: 10 });
            expect(immutable.x).toBe(1);
        });

        test("Metadata", async () => {
            let writeEvent;
            let changeEvent;

            const model = new Model({
                a: 1,
                b: 2,
                c: 3
            });

            const { watcher, controller } = model;
            
            watcher.on("write", event => {
                writeEvent = event;
            });

            watcher.on("change", event => {
                changeEvent = event;
            });
            
            model.useMetadata({ timestamp: 1707762789488 }, controller => {
                controller.a = 10;
            });
 
            expect(writeEvent).toEqual({ key: "a", oldValue: 1, newValue: 10, metadata: { timestamp: 1707762789488 } });

            controller.a = 10;
            expect(writeEvent).toEqual({ key: "a", oldValue: 1, newValue: 10, metadata: { timestamp: 1707762789488 } });

            controller.a = 20;
            expect(writeEvent).toEqual({ key: "a", oldValue: 10, newValue: 20 });

            model.useMetadata({ author: "ThalesQwerty" }, controller => {
                controller.a = 20;
            });

            expect(writeEvent).toEqual({ key: "a", oldValue: 10, newValue: 20 });

            model.useMetadata({ author: "ThalesQwerty" }, controller => {
                controller.a = 30;
            });

            expect(writeEvent).toEqual({ key: "a", oldValue: 20, newValue: 30, metadata: { author: "ThalesQwerty" } });

            await delay();

            expect(changeEvent).toEqual({ 
                oldValues: { a: 1 }, 
                newValues: { a: 30 },
                metadata: { timestamp: 1707762789488, author: "ThalesQwerty" } 
            });
        })
    });

    describe("Change event", () => {
        test("Primitives", async () => {
            let changeEvent;

            const { controller, watcher } = new Model({
                a: 1,
                b: 2,
                c: 3,
                ignoredKey: 0
            }, { ignoreKeys: ["ignoredKey"] });

            watcher.on("change", event => {
                changeEvent = event;
            });

            controller.a = 1;
            controller.b = 2;
            controller.c = 3;
            await delay();

            expect(changeEvent).toBeUndefined();

            controller.ignoredKey = 3;
            await delay();

            expect(changeEvent).toBeUndefined();

            controller.a = 10;
            await delay();

            expect(changeEvent).toBeDefined();
            expect(changeEvent.newValues).toEqual({
                a: 10
            });

            controller.a = 100;
            controller.b = 200;
            controller.c = 300;
            await delay();

            expect(changeEvent).toBeDefined();
            expect(changeEvent.newValues).toEqual({
                a: 100,
                b: 200,
                c: 300
            });

            controller.ignoredKey = 400;
            await delay();

            expect(changeEvent).toBeDefined();
            expect(changeEvent.newValues).toEqual({
                a: 100,
                b: 200,
                c: 300
            });
        });

        test("Objects", async () => {
            let changeEvent;

            const { controller, watcher } = new Model({
                obj: {
                    x: 0,
                    y: 0
                },
                arr: [0, 1, 2]
            });

            watcher.on("change", event => {
                changeEvent = event;
            });

            controller.obj.x = 0;
            controller.obj.y = 0;
            await delay();

            expect(changeEvent).toBeUndefined();

            controller.obj = {
                x: 0,
                y: 1
            };
            await delay();

            expect(changeEvent).toBeDefined();
            expect(changeEvent.newValues).toEqual({
                obj: {
                    x: 0,
                    y: 1
                }
            });

            controller.obj.x = 1;
            await delay();

            expect(changeEvent).toBeDefined();
            expect(changeEvent.newValues).toEqual({
                obj: {
                    x: 1,
                    y: 1
                }
            });

            controller.arr.push(3);
            controller.arr.shift();
            await delay();

            expect(changeEvent).toBeDefined();
            expect(changeEvent.newValues).toEqual({
                arr: [1, 2, 3]
            });
        });
    });

    describe("Call event", () => {
        test("Functions", () => {
            let callEvent;

            const { controller, watcher } = new Model({
                sum(a = 0, b = 0) {
                    return a + b;
                }
            });

            watcher.on("call", event => {
                callEvent = event;
            });

            const result = controller.sum(7, 5);

            expect(result).toBe(12);
            expect(callEvent).toEqual({ methodName: "sum", parameters: [7, 5], returnedValue: 12 });
        });
    });
});