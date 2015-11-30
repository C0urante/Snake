// Remain constant throughout the entire session
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const INIT_SNAKE_LENGTH = 5;
const SNAKE_LENGTH_DELTA = 5;
const MAX_OPACITY = 0.5;
const OPACITY_CYCLE = 25;
const DIRECTIONS = [LEFT, UP, RIGHT, DOWN];
// Remain constant through a game, but can change between games
var WIDTH;
var HEIGHT;
var BOARD;
// Change throughout a game
var snakeDirection;
var snakeLength;
var snakeBody;
var snakePosition;
var interval;
var speed;
var score;

function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.clone = function() {
  return new Point(this.x, this.y);
};

Point.prototype.setX = function(x) {
  this.x = x;
};

Point.prototype.setY = function(y) {
  this.y = y;
};

Point.prototype.setAll = function(x, y) {
  this.setY(x);
  this.setX(y);
};

Point.prototype.toString = function() {
  return '(' + this.x + ', ' + this.y + ')';
};

Point.fromString = function(s) {
  var x = s.substring(1, s.indexOf(','));
  var y = s.substring(s.indexOf(' '), s.length - 1);
  return new Point(x, y);
};

function Queue() {
  this.data = [];
}

Queue.prototype.clone = function() {
  var result = new Queue();
  result.data = this.data.slice();
  return result;
};

Queue.prototype.offer = function(e) {
  return this.data.push(e);
};

Queue.prototype.poll = function() {
  if (this.data.length > 0) {
    return this.data.shift();
  } else {
    return null;
  }
};

Queue.prototype.peek = function() {
  if (this.data.length > 0) {
    return this.data[0];
  } else {
    return null;
  }
};

Queue.prototype.length = function() {
  return this.data.length;
};

function resetFields() {
  WIDTH = parseInt($('#width_value').val(), 10);
  HEIGHT = parseInt($('#height_value').val(), 10);
  score = 0;
}

function resetBoard() {
  var boardElement = $('#board');
  boardElement.empty();
  BOARD = [];
  for (var y = 0; y < HEIGHT; y++) {
    var row = $('<tr />');
    BOARD.push([]);
    for (var x = 0; x < WIDTH; x++) {
      var square = $('<td />', {
        'class': 'empty'
      });
      row.append(square);
      BOARD[y].push(square);
    }
    boardElement.append(row);
  }
}

function resetSnake() {
  snakeDirection = DIRECTIONS[randRange(0, DIRECTIONS.length)];
  snakeLength = INIT_SNAKE_LENGTH;
  snakeBody = new Queue();
  snakePosition = getEmptySquare();
  snakeBody.offer(snakePosition.clone());
  setSquareSnake(snakePosition);
}

function resetInterval(state) {
  if (interval != null) {
    clearInterval(interval);
  }
  if (state) {
    interval = setInterval(tick, speed);
  } else {
    interval = null;
  }
}

function newGame() {
  resetFields();
  resetBoard();
  resetSnake();
  createNewTarget();
  play();
}

function setSquareSnake(point) {
  var green = Math.floor(point.x * 256 / WIDTH);
  var blue = Math.floor(point.y * 256 / HEIGHT);
  var color = 'rgb(127, ' + green + ', ' + blue + ')';
  return BOARD[point.y][point.x].removeClass().addClass('snake').
                                 css('background-color', color);
}

function setSquareEmpty(point) {
  var square = BOARD[point.y][point.x];
  if (square.hasClass('snake')) {
    var green = Math.floor(point.x * 256 / WIDTH);
    var blue = Math.floor(point.y * 256 / HEIGHT);
    var opacity = MAX_OPACITY *
                  (score % OPACITY_CYCLE) /
                  (OPACITY_CYCLE - 1);
    var color = 'rgba(127,' + green + ', ' + blue + ', ' + opacity + ')';
    return square.removeClass().addClass('empty').
                                css('background-color', color);
  } else {
    return square.removeClass().addClass('empty').
                                css('background-color', 'rgb(255, 255, 255)');
  }
}

function setSquareTarget(point) {
  return BOARD[point.y][point.x].removeClass().addClass('target').
                                 css('background-color', 'rgb(255, 0, 0)');
}

function updateTitle(s) {
  if (typeof s !== 'undefined') {
    document.title = 'Snake | ' + s;
  } else {
    document.title = 'Snake';
  }
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getEmptySquare() {
  var x = randRange(0, WIDTH);
  var y = randRange(0, HEIGHT);
  var xStart = x;
  var yStart = y;
  while (!BOARD[y][x].hasClass('empty')) {
    x++;
    if (x == WIDTH) {
      x = 0;
      y++;
      if (y == HEIGHT) {
        y = 0;
      }
    }
    if (x == xStart && y == yStart) {
      return null;
    }
  }
  return new Point(x, y);
}

function createNewTarget() {
  var point = getEmptySquare();
  if (point === null) {
    return false;
  } else {
    setSquareTarget(point);
    return true;
  }
}

function truncateSnakeBody() {
  if (snakeBody.length() >= snakeLength) {
    setSquareEmpty(snakeBody.poll());
  }
}

function updateSnakePosition() {
  var x = snakePosition.x;
  var y = snakePosition.y;
  switch (snakeDirection) {
    case UP:
      snakePosition.setY(mod(snakePosition.y - 1, HEIGHT));
      break;
    case RIGHT:
      snakePosition.setX(mod(snakePosition.x + 1, WIDTH));
      break;
    case DOWN:
      snakePosition.setY(mod(snakePosition.y + 1, HEIGHT));
      break;
    case LEFT:
      snakePosition.setX(mod(snakePosition.x - 1, WIDTH));
      break;
    default:
      alert('Fatal error: invalid direction: ' + snakeDirection);
      return;
  }
}

function checkSnakePosition() {
  var x = snakePosition.x;
  var y = snakePosition.y;
  if (BOARD[y][x].hasClass('snake')) {
    alert('You lose! Press space to start a new game.');
    over();
    return false;
  }
  var scored = BOARD[y][x].hasClass('target');
  setSquareSnake(snakePosition);
  if (scored) {
    if (createNewTarget()) {
      snakeLength += SNAKE_LENGTH_DELTA;
      score++;
      updateTitle(score);
    } else {
      alert('You win! Press space to start a new game.');
      over();
      return false;
    }
  }
  return true;
}

function tick() {
  truncateSnakeBody();
  updateSnakePosition();
  if (checkSnakePosition()) {
    snakeBody.offer(snakePosition.clone());
  }
}

function clearKeyEvents() {
  return $(document).off('keydown').off('keypress');
}

function keyDownPlay(event) {
  switch (event.which) {
    case 'A'.charCodeAt(0):
    case 'a'.charCodeAt(0):
    case LEFT:
      event.preventDefault();
      if (snakeDirection != RIGHT && snakeDirection != LEFT) {
        snakeDirection = LEFT;
      } else {
        return;
      }
      break;
    case 'W'.charCodeAt(0):
    case 'w'.charCodeAt(0):
    case UP:
      event.preventDefault();
      if (snakeDirection != DOWN && snakeDirection != UP) {
        snakeDirection = UP;
      } else {
        return;
      }
      break;
    case 'D'.charCodeAt(0):
    case 'd'.charCodeAt(0):
    case RIGHT:
      event.preventDefault();
      if (snakeDirection != LEFT && snakeDirection != RIGHT) {
        snakeDirection = RIGHT;
      } else {
        return;
      }
      break;
    case 'S'.charCodeAt(0):
    case 's'.charCodeAt(0):
    case DOWN:
      event.preventDefault();
      if (snakeDirection != UP && snakeDirection != DOWN) {
        snakeDirection = DOWN;
      } else {
        return;
      }
      break;
    default:
      return;
  }
  tick();
  if (interval) {
    resetInterval(true);
  }
  event.preventDefault();
}

function keyDownPause(event) {}

function keyDownOver(event) {}

function keyPressPlay(event) {
  var c = String.fromCharCode(event.which);
  switch (c) {
    case ' ':
    case 'p':
    case 'P':
      pause();
      break;
    default:
      return;
  }
  event.preventDefault();
}

function keyPressPause(event) {
  var c = String.fromCharCode(event.which);
  switch (c) {
    case ' ':
    case 'p':
    case 'P':
      play();
      break;
    default:
      return;
  }
  event.preventDefault();
}

function keyPressOver(event) {
  var c = String.fromCharCode(event.which);
  switch (c) {
    case ' ':
      newGame();
      break;
    default:
      return;
  }
  event.preventDefault();
}

function updateSpeed() {
  speed = Math.floor(1000 / $('#speed_value').val());
}

function over() {
  updateTitle('Game over!');
  resetInterval(false);
  clearKeyEvents().keypress(keyPressOver).keydown(keyDownOver);
}

function pause() {
  updateTitle('Paused');
  resetInterval(false);
  clearKeyEvents().keypress(keyPressPause).keydown(keyDownPause);
}

function play() {
  updateTitle(score);
  resetInterval(true);
  clearKeyEvents().keypress(keyPressPlay).keydown(keyDownPlay);
}

function checkBounds(element, backup) {
  backup = typeof backup !== 'undefined' ? backup : Math.floor((max + min) / 2);
  var min = parseInt(element.attr('min'), 10);
  var max = parseInt(element.attr('max'), 10);
  var val = parseInt(element.val(), 10);
  if (isNaN(val)) {
    element.val(backup);
  } else if (val > max) {
    element.val(max);
  } else if (val < min) {
    element.val(min);
  }
}

function onReady() {
  updateSpeed();
  newGame();
}

$(document).ready(onReady);
