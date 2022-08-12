//todo: Научиться делать плавную анимацию...

var canvas = document.getElementById("2048-field");
var ctx = canvas.getContext("2d");

// Масштабирование игрового поля, в зависимости от разрешения экрана.
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
var scale = 1;
if (window.screen.width <= 520) {
    scale = 1.607;
    canvas.width *= scale;
    canvas.height *= scale;
}

// Если нет ходов сразу после 2048
/*
        [ [{a:16}], [{a:1024}], [{a:1024}], [{a:64}] ],
        [ [{a:4}], [{a:32}], [{a:512}], [{a:32}] ],
        [ [{a:8}], [{a:64}], [{a:1024}], [{a:16}] ],
        [ [{a:16}], [{a:128}], [{a:4}], [{a:8}] ]

        [ [], [], [], [] ],
        [ [], [], [], [] ],
        [ [], [], [], [] ],
        [ [], [], [], [] ]
*/

if (!document.cookie.split(';').filter((item) => item.trim().startsWith('best_score=')).length) {
    let dateCurPlus1Year = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000));
    dateCurPlus1Year = dateCurPlus1Year.toUTCString();
    document.cookie = "best_score=0; expires=" + dateCurPlus1Year;
}

// Создаём логику игры...
var logicArrMatrix, gameOver, toCheckFor2048, score, bestScore;
var scoreContainer = document.querySelector('.score-container'),
    bestScoreContainer = document.querySelector('.best-container');

var startNewGame = function() {
    logicArrMatrix = [
        [ [], [], [], [] ],
        [ [], [], [], [] ],
        [ [], [], [], [] ],
        [ [], [], [], [] ]
    ];
    gameOver = false;
    toCheckFor2048 = true;
    score = 0;
    bestScore = document.cookie.replace(/(?:(?:^|.*;\s*)best_score\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    scoreContainer.innerText = score;
    bestScoreContainer.innerText = bestScore;
    addNewElemOnFreePlace();
    addNewElemOnFreePlace();
    draw();
}

function addNewElemOnFreePlace() {
    let freePlacesArr = [];

    function arrayPassFunc(action = '') {
        let row = 0,
            col = 0,
            countP = 0;
        for (;;) {
            ++countP;
            if (action == 'get free places' && typeof logicArrMatrix[row][col][0] === 'undefined') {
                freePlacesArr.push(countP);
            } else if (action == 'add elem' && countP == randFreePlace) {
                // Определяем вероятности появления двойки или четвёрки
                let chanceDeterminant = 0,
                    twoOrFour;
                chanceDeterminant = getRandomIntInclusive(1, 100);
                twoOrFour = chanceDeterminant <= 90 ? 2 : 4;
                logicArrMatrix[row][col][0] = {a: twoOrFour};
                break;
            }
            if (row == 3 && col == 3) {
                break;
            }
            if (col == 3) {
                col = 0;
                row++;
            } else {
                col++;
            }
        }
    }

    // Выбираем свободные позиции на игровом поле
    arrayPassFunc('get free places');

    if (freePlacesArr.length > 0) {
        // Получаем случайную свободную позицию
        function getRandomIntInclusive(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var randFreePlace;
        if (freePlacesArr.length > 1) {
            let randInt = getRandomIntInclusive(0, freePlacesArr.length - 1);
            randFreePlace = freePlacesArr[randInt];
        } else {
            randFreePlace = freePlacesArr[0];
        }

        // Добавляем новый элемент на свободную случайную позицию игрового поля
        arrayPassFunc('add elem');
    }
}

// Сдвиг и подсчёт равных значений по соответствующим направлениям
let calcSameElems = {
    fromRight: function(check = '') {
        for (let j = 0; j <= 3; j++) {
            if (!check) {
                moveArrElems.rightLeft(j);
            }
            for (let i = 3; i >= 1; i--) {
                let curElem = logicArrMatrix[j][i][0],
                    prevElem = logicArrMatrix[j][i-1][0];
                if (typeof curElem !== 'undefined' && typeof prevElem !== 'undefined' && curElem.a == prevElem.a) {
                    if (check == 'check') {
                        return true;
                    }
                    logicArrMatrix[j][i][0].a = curElem.a * 2;
                    score += logicArrMatrix[j][i][0].a;
                    logicArrMatrix[j].splice(i-1, 1, []);
                    moveArrElems.rightLeft(j);
                }
            }
        }
    },
    fromLeft: function(check = '') {
        for (let j = 0; j <= 3; j++) {
            if (!check) {
                moveArrElems.rightLeft(j, 'left');
            }
            for (let i = 0; i <= 2; i++) {
                let curElem = logicArrMatrix[j][i][0],
                    nextElem = logicArrMatrix[j][i+1][0];
                if (typeof curElem !== 'undefined' && typeof nextElem !== 'undefined' && curElem.a == nextElem.a) {
                    if (check == 'check') {
                        return true;
                    }
                    logicArrMatrix[j][i][0].a = curElem.a * 2;
                    score += logicArrMatrix[j][i][0].a;
                    logicArrMatrix[j].splice(i+1, 1, []);
                    moveArrElems.rightLeft(j, 'left');
                }
            }
        }
    },
    fromDown: function(check = '') {
        for (let i = 0; i <= 3; i++) {
            if (!check) {
                moveArrElems.down(i);
            }
            for (let j = 3; j >= 1; j--) {
                let curElem = logicArrMatrix[j][i][0],
                    prevElem = logicArrMatrix[j-1][i][0];
                if (typeof curElem !== 'undefined' && typeof prevElem !== 'undefined' && curElem.a == prevElem.a) {
                    if (check == 'check') {
                        return true;
                    }
                    logicArrMatrix[j][i][0].a = curElem.a * 2;
                    score += logicArrMatrix[j][i][0].a;
                    logicArrMatrix[j-1].splice(i, 1, []);
                    moveArrElems.down(i);
                }
            }
        }
    },
    fromUp: function(check = '') {
        for (let i = 0; i <= 3; i++) {
            if (!check) {
                moveArrElems.up(i);
            }
            for (let j = 0; j <= 2; j++) {
                let curElem = logicArrMatrix[j][i][0],
                    nextElem = logicArrMatrix[j+1][i][0];
                if (typeof curElem !== 'undefined' && typeof nextElem !== 'undefined' && curElem.a == nextElem.a) {
                    if (check == 'check') {
                        return true;
                    }
                    logicArrMatrix[j][i][0].a = curElem.a * 2;
                    score += logicArrMatrix[j][i][0].a;
                    logicArrMatrix[j+1].splice(i, 1, []);
                    moveArrElems.up(i);
                }
            }
        }
    }
}

// Сдвиг элементов по направлениям: вправо-влево, вниз-вверх
let moveArrElems = {
    rightLeft: function(row, side = 'right') {
        for (let col = 3; col >= 0; col--) {
            if (typeof logicArrMatrix[row][col][0] === 'undefined') {
                logicArrMatrix[row].splice(col, 1);
            }
        }
        if (logicArrMatrix[row].length < 4) {
            let toFill = 4 - logicArrMatrix[row].length;
            for (let i = 1; i <= toFill; i++) {
                (side == 'left') ? logicArrMatrix[row].push([]) : logicArrMatrix[row].unshift([]);
            }
        }
    },
    down: function(col) {
        for (let row = 3-1; row >= 0; row--) {
            if (typeof logicArrMatrix[row][col][0] !== 'undefined') {
                for (let rowToDown = 3; rowToDown > row; rowToDown--) {
                    if (typeof logicArrMatrix[rowToDown][col][0] === 'undefined') {
                        logicArrMatrix[rowToDown][col][0] = logicArrMatrix[row][col][0];
                        logicArrMatrix[row].splice(col, 1, []);
                        break;
                    }
                }
            }
        }
    },
    up: function(col) {
        for (let row = 0+1; row <= 3; row++) {
            if (typeof logicArrMatrix[row][col][0] !== 'undefined') {
                for (let rowToUp = 0; rowToUp < row; rowToUp++) {
                    if (typeof logicArrMatrix[rowToUp][col][0] === 'undefined') {
                        logicArrMatrix[rowToUp][col][0] = logicArrMatrix[row][col][0];
                        logicArrMatrix[row].splice(col, 1, []);
                        break;
                    }
                }
            }
        }
    }
}

// Вычисляем координаты сетки и рисуем её на холсте
let margin = 12;
let gridCellHeightWidth = canvas.width - canvas.height !== 0 ? alert("The height and width of the canvas can't be different!") : (canvas.width - margin * 5) / 4;
let grid = {
    marginBetweenCells: margin,
    cellStartPosX: margin,
    cellStartPosY: margin,
    cellHeight: gridCellHeightWidth,
    cellWidth: gridCellHeightWidth,
    // Вычисления координат сетки игрового поля 
    // (в будущем подумать над оптимизацией вычислений, так как выполяняются повторные вычисления уже вычисленных значений)
    calcGridCoords: function() {
        let coordsArr = [],
            coordX = 0, 
            coordY = 0;
        for (let row = 1; row <= 4; row++) {
            for (let col = 1; col <= 4; col++) {
                if (col <= 1) {
                    coordX = this.cellStartPosX;
                    if (row <= 1) {
                        coordY = this.cellStartPosY;
                    } else {
                        coordY = this.cellHeight * (row-1) + this.marginBetweenCells * row
                    }
                } else {
                    coordX = this.cellWidth * (col-1) + this.marginBetweenCells * col
                }
                coordsArr.push( {x: coordX, y: coordY} );
            }
        }
        return coordsArr;
    },
    // Рисуем сетку по полученным координатам
    draw: function(coordsArr) {
        for (coord of coordsArr) {
            ctx.beginPath();
            ctx.rect(coord.x, coord.y, this.cellWidth, this.cellHeight);
            ctx.fillStyle = "rgba(238,228,218,.35)";
            ctx.fill();
            ctx.closePath();
        }
    }
}
var gridCoordsArr = grid.calcGridCoords();

// Рисуем активные плитки на игровом поле
let activeBricksBGs = {
    2: "#fcefe6",
    4: "#f2e8cb",
    8: "#f5b682",
    16: "#f29446",
    32: "#ff775c",
    64: "#e64c2e",
    128: "#ede291",
    256: "#fce130",
    512: "#ffdb4a",
    1024: "#f0b922",
    2048: "#fad74d",
    common: "#db0000"
}
let numColors = {
    2: "#776e65",
    4: "#776e65",
    common: "#ffffff"
}
let fontSizes = {
    2: 45,
    4: 45,
    8: 45,
    16: 40,
    32: 40,
    64: 40,
    128: 35,
    256: 35,
    512: 35,
    1024: 30,
    2048: 30
}
let brick = {
    widthHeight: gridCellHeightWidth + 0.5,
    draw: function() {
        let gridPos = 0, x, y, activeElem, is2048 = false;
        for (let row = 0; row <= 3; row++) {
            for (let col = 0; col <= 3; col++) {
                activeElem = logicArrMatrix[row][col][0];
                if (typeof activeElem !== 'undefined') {
                    x = gridCoordsArr[gridPos].x;
                    y = gridCoordsArr[gridPos].y;
                    // Рисуем прямоугольник
                    ctx.fillStyle = activeElem.a <= 2048 ? activeBricksBGs[activeElem.a] : activeBricksBGs.common;
                    ctx.fillRect(x, y, this.widthHeight, this.widthHeight);
                    // Рисуем текст в центре прямоугольника
                    ctx.fillStyle = activeElem.a <= 4 ? numColors[activeElem.a] : numColors.common;
                    ctx.textAlign = "center"; 
                    ctx.textBaseline = "middle";
                    ctx.font = 'bold ' + (activeElem.a <= 2048 ? fontSizes[activeElem.a] : fontSizes[2048]) + 'px Arial';
                    ctx.fillText(activeElem.a, x + (this.widthHeight / 2), y + (this.widthHeight / 2));
                    
                    if (toCheckFor2048 && activeElem.a == 2048)
                        is2048 = true;
                }
                gridPos++;
            }
        }
        if (is2048)
            endGame('2048');
    }
};

// Функция отрисовки игры в окне браузера
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.draw(gridCoordsArr);
    brick.draw();
    //window.requestAnimationFrame(draw);
}

function wonGame() {
    let gameMessageElem = document.querySelector('.game-message');
    gameMessageElem.querySelector('p').innerText = 'You win!';
    gameMessageElem.classList.add("game-won");
    gameOver = true;
}

function overGame() {
    if ( !calcSameElems.fromRight('check') && !calcSameElems.fromLeft('check') && !calcSameElems.fromDown('check') && !calcSameElems.fromUp('check') ) {
        //alert('Game over!');
        //console.log('Game over');
        let gameMessageElem = document.querySelector('.game-message');
        gameMessageElem.querySelector('p').innerText = 'Game over!'
        gameMessageElem.classList.add("game-over");
        gameOver = true;
    }
}

function endGame(toShow = '') {
    if (toShow == '2048')
        wonGame();
    else if (toShow == 'no moves')
        overGame();
}

function isCanMove() {
    if (!gameOver && (logicArrMatrix.toString().match(/\[object Object\]/g) || []).length == 16 ) {
        endGame('no moves');
    }
}

/** Простая, сторонняя реализация определения свайпа для сенсорных экранов
 * https://stackoverflow.com/a/23230280
 */
var xDown = null;                                                        
var yDown = null;
function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* right-to-left swipe */ 
            calcSameElems.fromLeft();
        } else {
            /* left-to-right swipe */
            calcSameElems.fromRight();
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* down-to-up swipe */ 
            calcSameElems.fromUp();
        } else { 
            /* up-to-down swipe */
            calcSameElems.fromDown();
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};

// Обработка нажатий кнопок клавиатуры: стрелочки (или альтернативные - WASD)
function keyPressesHandler(e) {
    if (gameOver)
        return;

    // Предыдущее положение плиток на игровом поле (элементов в массиве logicArrMatrix)
    let prevLogicArrState = logicArrMatrix.toString();

    // Нажатие кнопки в одном из четырёх направлений, или свайп на сенсорном экране
    if (e.type.includes('touch')) {
        if (e.type == 'touchstart')
            handleTouchStart(e);
        if (e.type == 'touchmove')
            handleTouchMove(e);
    } else {
        // Вниз (или S)
        if (e.keyCode == 40 || e.keyCode == 83) {
            calcSameElems.fromDown();
        }
        // Вверх (или W)
        if (e.keyCode == 38 || e.keyCode == 87) {
            calcSameElems.fromUp();
        }
        // Вправо (или D)
        if (e.keyCode == 39 || e.keyCode == 68) {
            calcSameElems.fromRight();
        }
        // Влево (или A)
        if (e.keyCode == 37 || e.keyCode == 65) {
            calcSameElems.fromLeft();
        }
    }

    // Обновление счётчиков 'score' и 'best'
    scoreContainer.innerText = score;
    if (bestScore < score) {
        bestScore = score;
        document.cookie = "best_score=" + bestScore;
        bestScoreContainer.innerText = bestScore;
    }

    // Текущее положение плиток на игровом поле (элементов в массиве logicArrMatrix), изменённое положение которых должно было произойти
    // после нажатия одной из кнопок направления. Если положение плиток изменилось - добавить новую плитку (элемент в массив logicArrMatrix) на игровом поле,
    // в противном случае - не добавлять.
    let curLogicArrState = logicArrMatrix.toString();
    if (curLogicArrState !== prevLogicArrState) {
        addNewElemOnFreePlace();
    }
    draw();
    
    // Если поле заполнено, проверить остался ли ход. Если хода нет - оповестить о конце игры.
    isCanMove();
}

// Старт игры
startNewGame();

// Обработка событий взаимодействия
document.addEventListener('keydown', keyPressesHandler);
canvas.addEventListener('touchstart', keyPressesHandler);
canvas.addEventListener('touchmove', keyPressesHandler);
document.getElementById('new-game').addEventListener('click', function() {
    gameMessageElem.classList.remove("game-over", "game-won");
    startNewGame();
});
let gameMessageElem = document.querySelector('.game-message');
gameMessageElem.querySelector('.retry-button').addEventListener('click', function() {
    gameMessageElem.classList.remove("game-over", "game-won");
    startNewGame();
});
gameMessageElem.querySelector('a.keep-playing-button').addEventListener('click', function() {
    toCheckFor2048 = false;
    gameOver = false;
    isCanMove();
    gameMessageElem.classList.remove("game-won");

});
//window.requestAnimationFrame(draw);
