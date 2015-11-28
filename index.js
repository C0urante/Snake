// Remain constant throughout the entire session
const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;
const PLAY = 4;
const PAUSE = 5;
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

function resetBoard() {
  var widthElement = $('#width');
  var heightElement = $('#height');
  var width = parseInt(widthElement.val(), 10);
  var height = parseInt(heightElement.val(), 10);
  var maxWidth = parseInt(widthElement.attr('max'), 10);
  var maxHeight = parseInt(heightElement.attr('max'), 10);
  if (width > maxWidth || height > maxHeight) {
    return;
  }

  document.title = 'Snake';
  WIDTH = width;
  HEIGHT = height;
  direction = DOWN;
  length = INIT_LENGTH;
  score = 0;
  position = new Point(0, 0);
  body = new Queue();
  body.offer(new Point(0, 0));
  BOARD = [];

  var boardElement = $('#board');
  boardElement.empty();
  for (var y = 0; y < height; y++) {
    var row = $('<tr />');
    BOARD.push([]);
    for (var x = 0; x < width; x++) {
      var square = $('<td />', {
        'class': 'empty'
      });
      row.append(square);
      BOARD[y].push(square);
    }
    boardElement.append(row);
  }
  setSnake(position);
  createNewPoint();
}

function setSnake(point) {
  var green = Math.floor(point.x * 256 / WIDTH);
  var blue = Math.floor(point.y * 256 / HEIGHT);
  var color = 'rgb(127, ' + green + ', ' + blue + ')';
  return BOARD[point.y][point.x].removeClass().addClass('snake').
                                 css('background-color', color);
}

function setEmpty(point) {
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

function setPoint(point) {
  return BOARD[point.y][point.x].removeClass().addClass('point').
                                 css('background-color', 'rgb(255, 0, 0)');
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function createNewPoint() {
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
      return false;
    }
  }
  setPoint(new Point(x, y));
  return true;
}

function truncateBody() {
  if (body.length() >= length) {
    setEmpty(body.poll());
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
    resetBoard();
    return;
  }
  var scored = BOARD[y][x].hasClass('point');
  setSnake(position);
  if (scored) {
    if (createNewPoint()) {
      length += LENGTH_DELTA;
      score++;
      document.title = 'Snake (' + score + ')';
    } else {
      alert('You win!');
      resetBoard();
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
    case 37:
      if (direction != RIGHT && direction != LEFT) {
        direction = LEFT;
      } else {
        return;
      }
      break;
    case 'W'.charCodeAt(0):
    case 38:
      if (direction != DOWN && direction != UP) {
        direction = UP;
      } else {
        return;
      }
      break;
    case 'D'.charCodeAt(0):
    case 39:
      if (direction != LEFT && direction != RIGHT) {
        direction = RIGHT;
      } else {
        return;
      }
      break;
    case 'S'.charCodeAt(0):
    case 40:
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
      break;
  }
}

function changeSpeed() {
  clearInterval(interval);
  interval = setInterval(tick, 1000 - speed + 1);
  state = PLAY;
}

function onReady() {
  speed = $('#speed').val();
  resetBoard();
  changeSpeed();
  $(document).keydown(onKeyDown);
  $(document).keypress(onKeyPress);
}

$(document).ready(onReady);
