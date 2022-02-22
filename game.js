var grid;
var easteregg = false;
var Play = false;
var gen = 0;
var genCount = document.getElementById('genCount');
var togglePlayBtn = document.getElementById('togglePlay');
var nextGenBtn = document.getElementById("nextGenBtn");

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function setup () {
  generate();
}

function jsonLoad() {
  var CustomJSON = JSON.parse(document.getElementById("json").value);
  if(CustomJSON == '') {
    console.log('Got no Input in CustomJSON Input with ID "json"');
  } else {
    canvas = createCanvas(CustomJSON['width'], CustomJSON['height']);
    canvas.id('canvas');
    grid = new Grid(CustomJSON['gridSize']);
  
    if(CustomJSON['random'] == "true") {
      grid.randomize();
    } else {
      var array = CustomJSON['grid'];
      for(var i of array) {
        var column = i['y'];
        var row = i['x'];
        var IsAlive = i['isAlive'];
        if(IsAlive == 1) {
          var Alive = true;
        } else {
          var Alive = "";
        }
        grid.cells[column][row].setIsAlive(Alive);
      }
    }
    updateButtons();
    grid.draw();
  }
}

function generate() {
  Play = false
  gen = -1;
  genCount.innerText = gen;
  var width = document.getElementById('width').value;
  var height = document.getElementById('height').value;
  var grid_size = document.getElementById('grid_size').value;
  easteregg = false;
  if(width == 0) {
    width = 600;
  }
  if(height == 0) {
    height = 600;
  }
  if(grid_size == 0) {
    grid_size = 10;
  }
  if(grid_size == 6.9 || grid_size == 4.20) {
    easteregg = true;
  }
  canvas = createCanvas(width, height);
  canvas.id('canvas');
  grid = new Grid(grid_size);
  nextGen();
  updateButtons();
}

function togglePlay() {
  
  if(togglePlayBtn.innerText =='Play') {
    togglePlayBtn.innerText = 'Pause';
    Play = true;
  } 
  else {
    togglePlayBtn.innerText = 'Play';
    Play = false;
  }
  draw();
  updateButtons();
}

function updateButtons() {
  try {
    if(Play == false) {
      nextGenBtn.classList.remove("game_button_inactive");
      nextGenBtn.classList.add("game_button_active");
      togglePlayBtn.innerText = 'Play'
    } else {
      nextGenBtn.classList.add("game_button_inactive");
      nextGenBtn.classList.remove("game_button_active");
      togglePlayBtn.innerText = 'Pause'
    }
  } catch {

  }
}

function nextGen() {
  background(47, 47, 47);
  gen += 1;
  genCount.innerText = 'Generation: ' + gen;

  grid.updateNeighborCounts();
  grid.updatePopulation();
  grid.draw();
}

function draw() {
  if(Play == true) {
    gen += 1;
    genCount.innerText = 'Generation: ' + gen;
    background(47, 47, 47);

    grid.updateNeighborCounts();
    grid.updatePopulation();
    grid.draw();
  }
}


class Grid {
  constructor (cellSize) {
    this.cellSize = cellSize;
    this.numberOfColumns = floor(width / this.cellSize);
    this.numberOfRows = floor(height / this.cellSize);

    this.cells = new Array(this.numberOfColumns);
    for (var column = 0; column < this.numberOfColumns; column ++) {
      this.cells[column] = new Array(this.numberOfRows);
    }

    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        this.cells[column][row] = new Cell(column, row, cellSize)
      }
    }
    print(this.cells);
  }

  draw () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        this.cells[column][row].draw();
      }
    }
  }

  randomize () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        var value = floor(random(2));
        this.cells[column][row].setIsAlive(value);
      }
    }
    nextGen();
    gen = 0;
    genCount.innerText = 'Generation: ' + gen;
    Play = false;
    updateButtons();
  }

  updateNeighborCounts () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        var currentCell = this.cells[column][row]
        currentCell.liveNeighborCount = 0;

        var neighborsArray = this.getNeighbors(currentCell);

        for (var position in neighborsArray) {
          if (neighborsArray[position].isAlive) {
            currentCell.liveNeighborCount += 1;
          }
        }
      }
    }
  }

  getNeighbors(currentCell) {
    var neighbors = [];

    for (var columnOffset = -1; columnOffset <= 1; columnOffset++) {
      for (var rowOffset = -1; rowOffset <= 1; rowOffset++) {
        var neighborX = currentCell.column + columnOffset;
        var neighborY = currentCell.row + rowOffset;

        if (this.isValidPosition(neighborX, neighborY)) {
          var neighborCell = this.cells[neighborX][neighborY];

          if (neighborCell != currentCell) {
            neighbors.push(neighborCell);
          }
        }
      }
    }

    return neighbors;
  }

  isValidPosition (column, row) {
    var validColumn = column >= 0 && column < this.numberOfColumns;
    var validRow = row >= 0 && row < this.numberOfRows

    return  validColumn && validRow;
  }

  updatePopulation () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        this.cells[column][row].liveOrDie();
      }
    }
  }
}

class Cell {
  constructor (column, row, size) {
    this.column = column;
    this.row = row;
    this.size = size;
    this.isAlive = false;
    this.liveNeighborCount = 0;
  }

  draw () {
    if (this.isAlive) {
      if(easteregg == true) {
        fill(color(getRandomColor()));
      } else {
        fill(color(240, 0, 240))
      }
    } else {
      fill(color(187));
    }
    noStroke();
    rect(this.column * this.size + 1, this.row * this.size + 1, this.size - 1, this.size - 1);
  }

  setIsAlive (value) {
    if (value) {
      this.isAlive = true;
    } else {
      this.isAlive = false;
    }
  }

  liveOrDie () {
    if      (this.isAlive && this.liveNeighborCount <  2) this.isAlive = false;   // Loneliness
    else if (this.isAlive && this.liveNeighborCount >  3) this.isAlive = false;   // Overpopulation
    else if (!this.isAlive && this.liveNeighborCount === 3)  this.isAlive = true; // Reproduction
    // otherwise stay the same
  }
}
