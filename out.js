// src/shapes.ts
var tetrominoes = [
  [
    [1],
    [1],
    [1],
    [1]
  ],
  [
    [0, 1],
    [0, 1],
    [0, 1],
    [1, 1]
  ],
  [
    [1, 0],
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  [
    [1, 1],
    [1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ]
];
var colors = [
  "cyan",
  "blue",
  "orange",
  "yellow",
  "green",
  "purple",
  "red"
];

// src/window-proxy.ts
var windowProxy = {
  eventListenerMap: {
    mousedown: {},
    mousemove: {},
    mouseup: {}
  },
  addEventListener: function(eventName, id, listener) {
    console.log("added");
    if (!this.eventListenerMap[eventName])
      this.eventListenerMap[eventName] = {};
    this.eventListenerMap[eventName][id] = listener;
    window.addEventListener(eventName, listener);
  },
  removeEventListener: function(event, id) {
    window.removeEventListener(event, this.eventListenerMap[event][id]);
    delete this.eventListenerMap[event][id];
  }
};

// index.ts
var main = function() {
  init();
  update();
  render();
  root.append(canvas);
};
var getRandomIndex = function() {
  return Math.floor(Math.random() * tetrominoes.length);
};
var onkeydown = function(e) {
  if (data.isOver)
    return;
  if (e.key === "ArrowLeft") {
    if (data.columnPointer > 0)
      data.columnPointer--;
    clearFootprint();
    move();
    render();
  } else if (e.key === "ArrowRight") {
    if (data.columnPointer + data.currentShapeWidth < COLUMN_COUNT)
      data.columnPointer++;
    clearFootprint();
    move();
    render();
  } else if (e.key === "t") {
    if (canTick) {
      canTick = false;
      tick();
    }
  }
};
var init = function() {
  data.changeShape();
  console.log("onkeydown attached");
  windowProxy.addEventListener("click", "tetris", function(e) {
    console.log("keyup");
    onkeydown(e);
  });
  initField();
};
var initField = function() {
  for (let y = 0;y < ROW_COUNT; y++) {
    if (!data.field[y])
      data.field[y] = [];
    for (let x = 0;x < COLUMN_COUNT; x++) {
      data.field[y][x] = 0;
    }
  }
};
var clearFootprint = function() {
  if (data.shapeFootprint.length !== 0) {
    for (let index = 0;index < data.shapeFootprint.length; index++) {
      const [x, y] = data.shapeFootprint[index];
      data.field[y][x] = 0;
    }
  }
};
var move = function() {
  for (let rowIndex = 0;rowIndex < data.currentShape.length; rowIndex++) {
    for (let columnIndex = 0;columnIndex < data.currentShapeWidth; columnIndex++) {
      const value = data.currentShape[rowIndex][columnIndex];
      if (data.field[rowIndex + data.rowPointer]) {
        if (data.field[rowIndex + data.rowPointer][columnIndex + data.columnPointer] !== 1) {
          data.field[rowIndex + data.rowPointer][columnIndex + data.columnPointer] = value;
        }
        if (value === 1) {
          data.shapeFootprint.push([columnIndex + data.columnPointer, rowIndex + data.rowPointer]);
        }
      }
    }
  }
};
var removeLine = function() {
  let markedRowIndexes = [];
  for (let rowIndex = 0;rowIndex < data.field.length; rowIndex++) {
    let shouldRemove = true;
    const columns = data.field[rowIndex];
    if (columns.includes(0))
      shouldRemove = false;
    if (shouldRemove) {
      markedRowIndexes.push(rowIndex);
    }
  }
  for (let index = 0;index < markedRowIndexes.length; index++) {
    const deletedRowIndex = markedRowIndexes[index];
    data.field.splice(deletedRowIndex, 1);
    data.field.unshift([...data.field[0].map(() => 0)]);
  }
};
var newTurn = function() {
  removeLine();
  data.isOver = data.field[0].includes(1);
  if (data.isOver) {
    const c = confirm("game over. restart?");
    if (c) {
      data.isOver = false;
      initField();
    }
  }
  data.changeShape();
  data.rowPointer = 0;
  data.shapeFootprint = [];
  if (data.columnPointer + data.currentShapeWidth > COLUMN_COUNT)
    data.columnPointer--;
};
var update = function() {
  const isGrounded = data.rowPointer + data.currentShape.length + 1 > ROW_COUNT;
  let isLanded = false;
  if (isGrounded) {
    newTurn();
  } else {
    let edgePoints = [];
    for (let rowIndex = 0;rowIndex < data.currentShape.length; rowIndex++) {
      const columns = data.currentShape[rowIndex];
      for (let columnIndex = 0;columnIndex < columns.length; columnIndex++) {
        const value = columns[columnIndex];
        if (rowIndex === data.currentShape.length - 1) {
          if (value === 1)
            edgePoints.push([data.columnPointer + columnIndex, data.rowPointer + rowIndex]);
        } else {
          if (value === 1 && data.currentShape[rowIndex + 1][columnIndex] === 0) {
            edgePoints.push([data.columnPointer + columnIndex, data.rowPointer + rowIndex]);
          }
        }
      }
    }
    for (let index = 0;index < edgePoints.length; index++) {
      const [x, y] = edgePoints[index];
      if (data.field[y + 1][x] === 1)
        isLanded = true;
    }
    if (isLanded) {
      newTurn();
    }
  }
  if (!isLanded && !isGrounded) {
    clearFootprint();
    data.rowPointer++;
  }
  move();
  for (let index = 0;index < data.field.length; index++) {
    const row = data.field[index];
    console.log(row);
  }
  console.log(``);
};
var render = function() {
  if (!ctx)
    return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let rowIndex = 0;rowIndex < data.field.length; rowIndex++) {
    const columns = data.field[rowIndex];
    if (!columns)
      continue;
    for (let columnIndex = 0;columnIndex < columns.length; columnIndex++) {
      const value = columns[columnIndex];
      if (value === 1) {
        ctx.fillStyle = colors[data.currentShapeIndex];
        ctx?.fillRect(columnIndex * GRID_SIZE, rowIndex * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        ctx.fillStyle = "black";
      }
    }
  }
  let edgePoints = [];
  for (let rowIndex = 0;rowIndex < data.currentShape.length; rowIndex++) {
    const columns = data.currentShape[rowIndex];
    for (let columnIndex = 0;columnIndex < columns.length; columnIndex++) {
      const value = columns[columnIndex];
      if (rowIndex === data.currentShape.length - 1) {
        if (value === 1)
          edgePoints.push([data.columnPointer + columnIndex, data.rowPointer + rowIndex]);
      } else {
        if (value === 1 && data.currentShape[rowIndex + 1][columnIndex] === 0) {
          edgePoints.push([data.columnPointer + columnIndex, data.rowPointer + rowIndex]);
        }
      }
    }
  }
  for (let index = 0;index < edgePoints.length; index++) {
    const [x, y] = edgePoints[index];
    ctx.fillStyle = "magenta";
    ctx?.fillRect(x * GRID_SIZE, (y + 1) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.fillStyle = "black";
  }
  ctx.fillStyle = "gray";
  ctx?.fillRect(data.columnPointer * GRID_SIZE, data.rowPointer * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  ctx.fillStyle = "black";
  canTick = true;
};
var tick = function() {
  update();
  render();
  console.log("tick");
};
var COLUMN_COUNT = 10;
var ROW_COUNT = 20;
var GRID_SIZE = 20;
var root = document.body;
var canvas = document.createElement("canvas");
canvas.width = COLUMN_COUNT * GRID_SIZE;
canvas.height = ROW_COUNT * GRID_SIZE;
canvas.style.display = "block";
canvas.style.margin = "0 auto";
canvas.style.background = "#ddd";
var ctx = canvas.getContext("2d");
var data = {
  isOver: false,
  x: 0,
  y: 0,
  rowPointer: -1,
  columnPointer: 0,
  rightPointer: 0,
  bottomPointer: 0,
  field: [[0]],
  shapeFootprint: [],
  currentShapeIndex: getRandomIndex(),
  currentShape: tetrominoes[0],
  currentShapeWidth: 0,
  currentShapeHeight: 0,
  changeShape: function() {
    this.currentShapeIndex = getRandomIndex();
    this.currentShape = tetrominoes[this.currentShapeIndex];
    const currentShapeRowLength = this.currentShape.length;
    const currentShapeColumnLength = this.currentShape[0].length;
    this.bottomPointer = currentShapeRowLength;
    this.rightPointer = currentShapeColumnLength;
    this.currentShapeWidth = currentShapeColumnLength;
    this.currentShapeHeight = currentShapeRowLength;
  }
};
main();
console.log(windowProxy);
var canTick = true;
