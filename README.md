# Watched Object

This is a very simple JavaScript/TypeScript library dedicated to whenever you need to watch an object for its changes.

## Installation

You can easily install it in your NodeJS project using npm or yarn:

```bash
npm install watched-object

# or 

yarn add watched-object
```

## Usage examples

```js
import { Model } from "watched-object";

const position = new Model({
    x: 0,
    y: 0
});

let writeCounter = 0;

// Use the watcher to listen to the events
// The "write" event fires immediately whenever a key is altered
position.watcher.on("write", () => {
    writeCounter ++;
});

// Use the controller to alter the object
position.controller.x = 1;
position.controller.y = 2;

console.log(writeCounter);
// > 2

// The "change" event waits a few milliseconds before firing, 
// in order to group several keys into one single event
position.watcher.on("change", event => {
    console.log("new position", event.newValues);
    // > new position { x: [...], y: [...] }
});

// Change position randomly every second
setInterval(() => {
    position.controller.x = Math.random() * 10;
    position.controller.y = Math.random() * 10;
}, 1000);
```

Besides the `Model` class, there's also a `View` class that can be used to create objects that automatically react to changes in other objects!

```js
import { Model, View } from "watched-object";

const gradeRawData = new Model({
    grades: [9, 3, 5, 8, 4]
});

// These values will be automatically updated whenever the grades change
const gradeStatistics = new View(gradeRawData, {
    highest: model => Math.max(...model.grades),
    lowest: model => Math.min(...model.grades),
    average: model => model.grades.reduce((sum, grade) => sum + grade, 0) / model.grades.length
});

console.log(gradeStatistics.controller);
// > { highest: 9, lowest: 4, average: 5.8 }

gradeRawData.controller.grades.push(10);
gradeRawData.controller.grades.push(0);

console.log(gradeStatistics.controller);
// > { highest: 10, lowest: 0, average: 5.571428571428571 }
```
The view is basically a model that reacts to other models, which means you can also apply the functionalities of the `Model` class to the `View` class:

```js
// The view can also be watched, if needed
gradeStatistics.watcher.on("write", event => {
    if (event.key === "average") console.log("new average", event.newValue);
});

gradeRawData.controller.grades.push(7);
// > new average 5.75

// And... you can create views of views
const evenMoreGradeStatistics = new View(gradeStatistics.model, {
    span: model => model.highest - model.lowest
});

console.log("span", evenMoreGradeStatistics.controller.span);
// > span 10

gradeRawData.controller.grades = [4, 5, 6];
// > new average 5

console.log("span", evenMoreGradeStatistics.controller.span);
// > span 2
```