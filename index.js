var WIDTH;
var HEIGHT;
var BOARD;
var UP = 0;
var RIGHT = 1;
var DOWN = 2;
var LEFT = 3;
var PLAY = 4;
var PAUSE = 5;
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

function Queue() {
  this.data = [];
  this.offer = function(e) {
    return this.data.push(e);
  };
  this.poll = function() {
    if (this.data.length > 0) {
      return this.data.shift();
    } else {
      return null;
    }
  };
  this.peek = function() {
    if (this.data.length > 0) {
      return this.data[0];
    } else {
      return null;
    }
  };
  this.length = function() {
    return this.data.length;
  };
}

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
  length = 5;
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
        'class': 'inactive'
      });
      row.append(square);
      BOARD[y].push(square);
    }
    boardElement.append(row);
  }
  setActive(position);
  createNewPoint();
}

function setActive(point) {
  var green = Math.floor(point.x * 256 / WIDTH);
  var blue = Math.floor(point.y * 256 / HEIGHT);
  var color = 'rgb(127, ' + green + ', ' + blue + ')';
  return BOARD[point.y][point.x].removeClass().addClass('active').
                                 css('background-color', color);
}

function setInactive(point) {
  var square = BOARD[point.y][point.x];
  if (square.hasClass('active')) {
    var green = Math.floor(point.x * 256 / WIDTH);
    var blue = Math.floor(point.y * 256 / HEIGHT);
    var opacity = ((length - 5) % 128) / 256;
    var color = 'rgba(127,' + green + ', ' + blue + ', ' + opacity + ')';
    return square.removeClass().addClass('inactive').
                                css('background-color', color);
  } else {
    return square.removeClass().addClass('inactive').
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
  while (BOARD[y][x].hasClass('active')) {
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

function tick() {
  if (body.length() >= length) {
    var p = body.poll();
    setInactive(p);
  }
  var x = position.x;
  var y = position.y;
  switch (direction) {
    case UP:
      y = mod(y - 1, HEIGHT);
      break;
    case RIGHT:
      x = mod(x + 1, WIDTH);
      break;
    case DOWN:
      y = mod(y + 1, HEIGHT);
      break;
    case LEFT:
      x = mod(x - 1, WIDTH);
      break;
    default:
      alert('Fatal error: invalid direction: ' + direction);
      return;
  }
  if (BOARD[y][x].hasClass('active')) {
    alert('You lose!');
    resetBoard();
    return;
  }
  var scored = BOARD[y][x].hasClass('point');
  var newPos = new Point(x, y);
  setActive(newPos);
  if (scored) {
    if (createNewPoint()) {
      length += 5;
      score++;
      document.title = 'Snake (' + score + ')';
    } else {
      alert('You win!');
      resetBoard();
      return;
    }
  }
  body.offer(newPos);
  position.x = x;
  position.y = y;
}

function onKeyDown(event) {
  if (state == PAUSE) {
    return;
  }
  switch (event.which) {
    case 37:
      if (direction != RIGHT && direction != LEFT) {
        direction = LEFT;
      } else {
        return;
      }
      break;
    case 38:
      if (direction != DOWN && direction != UP) {
        direction = UP;
      } else {
        return;
      }
      break;
    case 39:
      if (direction != LEFT && direction != RIGHT) {
        direction = RIGHT;
      } else {
        return;
      }
      break;
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
