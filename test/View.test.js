import { Model, View } from "../lib";

function delay(milliseconds = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

describe("View", () => {
    describe("State", () => {
        test("Direct mapping", () => {
            const model = new Model({
                name: "Thales",
                age: 23,
                sum: [1, 2, 3, 4]
            });

            const { view: mapAll } = new View(model);
            const { view: mapSome } = new View(model, ["name", "age"]);
            const { view: mapNone } = new View(model, []);

            expect(mapAll.controller.name).toBe("Thales");
            expect(mapAll.controller.age).toBe(23);
            expect(mapAll.controller.sum).toEqual([1, 2, 3, 4]);

            expect(mapSome.controller.name).toBe("Thales");
            expect(mapSome.controller.age).toBe(23);
            expect(mapSome.controller.sum).toBeUndefined();

            expect(mapNone.controller.name).toBeUndefined();
            expect(mapNone.controller.age).toBeUndefined();
            expect(mapNone.controller.sum).toBeUndefined();

            model.controller.name = "ThalesQwerty";
            model.controller.age = 20;
            model.controller.sum.push(5);

            expect(mapAll.controller.name).toBe("ThalesQwerty");
            expect(mapAll.controller.age).toBe(20);
            expect(mapAll.controller.sum).toEqual([1, 2, 3, 4, 5]);

            expect(mapSome.controller.name).toBe("ThalesQwerty");
            expect(mapSome.controller.age).toBe(20);
            expect(mapSome.controller.sum).toBeUndefined();

            expect(mapNone.controller.name).toBeUndefined();
            expect(mapNone.controller.age).toBeUndefined();
            expect(mapNone.controller.sum).toBeUndefined();
        });

        test("Inferrences", () => {
            const model = new Model({
                name: "Thales",
                age: 23,
                sum: [1, 2, 3, 4]
            });

            const { view } = new View(model, {
                name: "name",
                years: "age",
                months: m => m.age * 12,
                sum: m => m.sum.reduce((s, n) => s + n, 0)
            });

            expect(view.controller.name).toBe("Thales");
            expect(view.controller.months).toBe(23 * 12);
            expect(view.controller.years).toBe(23);
            expect(view.controller.sum).toBe(10);
            expect(view.controller.age).toBeUndefined();

            model.controller.name = "ThalesQwerty";
            model.controller.age = 20;
            model.controller.sum.push(5);

            expect(view.controller.name).toBe("ThalesQwerty");
            expect(view.controller.months).toBe(20 * 12);
            expect(view.controller.years).toBe(20);
            expect(view.controller.sum).toBe(15);
            expect(view.controller.age).toBeUndefined();
        });
    });

    describe("Events", () => {
        test("Write Event", () => {
            let writeEvent;

            const model = new Model({
                a: 1,
                b: 2,
                c: 3
            });

            const { controller } = model;

            const { watcher } = new View(model, {
                x: "a",
                y: m => m.b * m.c
            });
            
            watcher.on("write", event => {
                writeEvent = event;
            });

            controller.a = 10;
            expect(writeEvent).toEqual({ propertyName: "x", oldValue: 1, newValue: 10 });

            controller.b = 20;
            expect(writeEvent).toEqual({ propertyName: "y", oldValue: 6, newValue: 60 });

            controller.c = 30;
            expect(writeEvent).toEqual({ propertyName: "y", oldValue: 60, newValue: 600 });
        });

        test("Change Event", async () => {
            let changeEvent;

            const model = new Model({
                a: 1,
                b: 2,
                c: 3
            });

            const { controller } = model;

            const { watcher } = new View(model, {
                ab: m => m.a * m.b,
                ac: m => m.a * m.c,
                bc: m => m.b * m.c,
                abc: m => m.a * m.b * m.c
            });
            
            watcher.on("change", event => {
                changeEvent = event;
            });

            await delay();

            controller.a = 10;
            await delay();
            expect(changeEvent).toEqual({ oldValues: { ab: 2, ac: 3, abc: 6 }, newValues: { ab: 20, ac: 30, abc: 60 } });
            
            controller.b = 20;
            await delay();
            expect(changeEvent).toEqual({ oldValues: { ab: 20, bc: 6, abc: 60 }, newValues: { ab: 200, bc: 60, abc: 600 } });

            controller.c = 30;
            await delay();
            expect(changeEvent).toEqual({ oldValues: { ac: 30, bc: 60, abc: 600 }, newValues: { ac: 300, bc: 600, abc: 6000 } });
        });
    })
});