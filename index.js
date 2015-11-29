// Remain constant throughout the entire session
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const PLAY = 1;
const PAUSE = 2;
const INIT_LENGTH = 5;
const LENGTH_DELTA = 5;
const MAX_OPACITY = 0.5;
const OPACITY_CYCLE = 25;
// Remain constant through a game, but can change between games
var WIDTH;
var HEIGHT;
var BOARD;
// Change constantly throughout a game
var direction;
var length;
var body;
var position;
var interval;
var state;
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

function resetDimensions() {
  var widthElement = $('#width_value');
  var heightElement = $('#height_value');
  var width = parseInt(widthElement.val(), 10);
  var height = parseInt(heightElement.val(), 10);
  var maxWidth = parseInt(widthElement.attr('max'), 10);
  var maxHeight = parseInt(heightElement.attr('max'), 10);
  if (width > maxWidth || height > maxHeight) {
    return false;
  } else {
    WIDTH = width;
    HEIGHT = height;
    return true;
  }
}

function resetFields() {
  document.title = 'Snake';
  BOARD = [];
  direction = DOWN;
  length = INIT_LENGTH;
  score = 0;
  body = new Queue();
  position = new Point(0, 0);
  body.offer(position.clone());
}

function resetBoard() {
  var boardElement = $('#board');
  boardElement.empty();
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

function reset() {
  if (!resetDimensions()) {
    return;
  }
  resetFields();
  resetBoard();
  setSnakeSquare(position);
  createNewTarget();
}

function setSnakeSquare(point) {
  var green = Math.floor(point.x * 256 / WIDTH);
  var blue = Math.floor(point.y * 256 / HEIGHT);
  var color = 'rgb(127, ' + green + ', ' + blue + ')';
  return BOARD[point.y][point.x].removeClass().addClass('snake').
                                 css('background-color', color);
}

function setEmptySquare(point) {
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

function setTargetSquare(point) {
  return BOARD[point.y][point.x].removeClass().addClass('target').
                                 css('background-color', 'rgb(255, 0, 0)');
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
  while (BOARD[y][x].hasClass('snake')) {
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
    setTargetSquare(point);
    return true;
  }
}

function truncateBody() {
  if (body.length() >= length) {
    setEmptySquare(body.poll());
  }
}

function updatePosition() {
  var x = position.x;
  var y = position.y;
  switch (direction) {
    case UP:
      position.setY(mod(position.y - 1, HEIGHT));
      break;
    case RIGHT:
      position.setX(mod(position.x + 1, WIDTH));
      break;
    case DOWN:
      position.setY(mod(position.y + 1, HEIGHT));
      break;
    case LEFT:
      position.setX(mod(position.x - 1, WIDTH));
      break;
    default:
      alert('Fatal error: invalid direction: ' + direction);
      return;
  }
}

function checkNewPosition() {
  var x = position.x;
  var y = position.y;
  if (BOARD[y][x].hasClass('snake')) {
    alert('You lose!');
    reset();
    return;
  }
  var scored = BOARD[y][x].hasClass('target');
  setSnakeSquare(position);
  if (scored) {
    if (createNewTarget()) {
      length += LENGTH_DELTA;
      score++;
      document.title = 'Snake (' + score + ')';
    } else {
      alert('You win!');
      reset();
      return;
    }
  }
}

function tick() {
  truncateBody();
  updatePosition();
  checkNewPosition();
  body.offer(position.clone());
}

function onKeyDown(event) {
  if (state == PAUSE) {
    return;
  }
  switch (event.which) {
    case 'A'.charCodeAt(0):
    case 'a'.charCodeAt(0):
    case LEFT:
      if (direction != RIGHT && direction != LEFT) {
        direction = LEFT;
      } else {
        return;
      }
      break;
    case 'W'.charCodeAt(0):
    case 'w'.charCodeAt(0):
    case UP:
      if (direction != DOWN && direction != UP) {
        direction = UP;
      } else {
        return;
      }
      break;
    case 'D'.charCodeAt(0):
    case 'd'.charCodeAt(0):
    case RIGHT:
      if (direction != LEFT && direction != RIGHT) {
        direction = RIGHT;
      } else {
        return;
      }
      break;
    case 'S'.charCodeAt(0):
    case 's'.charCodeAt(0):
    case DOWN:
      if (direction != UP && direction != DOWN) {
        direction = DOWN;
      } else {
        return;
      }
      break;
    default:
      return;
  }
  tick();
  changeSpeed();
  event.preventDefault();
}

function onKeyPress(event) {
  var c = String.fromCharCode(event.which);
  switch (c) {
    case 'p':
    case 'P':
    case ' ':
      if (interval != null) {
        clearInterval(interval);
        interval = null;
        state = PAUSE;
      } else {
        changeSpeed();
      }
      break;
    default:
      return;
  }
  event.preventDefault();
}

function updateSpeed() {
  speed = Math.floor(1000 / $('#speed_value').val());
}

function changeSpeed() {
  clearInterval(interval);
  interval = setInterval(tick, speed);
  state = PLAY;
}

function onReady() {
  reset();
  updateSpeed();
  changeSpeed();
  $(document).keydown(onKeyDown);
  $(document).keypress(onKeyPress);
}

$(document).ready(onReady);
