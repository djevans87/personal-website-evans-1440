const ROWS = 20, COLS = 10;
const boardEl = document.querySelector('#board');
const cells = [];

const board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
const PIECES = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]]
};
let currentPiece = 'T';
let currentShape = PIECES.T;
let currentRow = 0;
let currentCol = 3;

const DROP_INTERVAL = 800;// milliseconds between ticks
const MIN_INTERVAL = 150;
const POINTS_PER_LEVEL = 1000;
const SPEED_STEP = 100;

let currentInterval = DROP_INTERVAL;
let level = 0;

let dropTimer;

const QUEUE_SIZE = 3; // this is the preview of the next pieces coming from the bag randomizer

let bag = [];
let queue = [];

const previewEls = [
    document.querySelector('#preview-0'),
    document.querySelector('#preview-1'),
    document.querySelector('#preview-2')
];

const previewCells = [];

let score = 0;
const scoreEl = document.querySelector('#score');

//weighted score for clearing 4 rows at once instead of linear scoring
const LINE_SCORES = [0, 100, 300, 500, 800];

const gameOverEl = document.querySelector('#game-over');
const finalScoreEl = document.querySelector('#final-score');
const restartButton = document.querySelector('#restart');
const pauseButton = document.querySelector('#pause');
const playAgainButton = document.querySelector('#play-again');

let isGameOver = false;
let isPaused = false;

const HIGH_SCORES_KEY = 'block-drop-high-scores';
const highScoreEls = [
    document.querySelector('#high-score-0'),
    document.querySelector('#high-score-1'),
    document.querySelector('#high-score-2'),
    document.querySelector('#high-score-3'),
    document.querySelector('#high-score-4'),
];

const levelEl = document.querySelector('#level');

let linesTotal = 0;
const linesEl = document.querySelector('#lines');

function buildCells() {
    boardEl.innerHTML = '';
    cells.length = 0;
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        boardEl.appendChild(cell);
        cells.push(cell);
    }

}
function drawHighScores() {
    const currentHighScore = getHighestScores();
    for (let s = 0; s < highScoreEls.length; s++) {
        const el = highScoreEls[s];
        if (el) {
            el.textContent = currentHighScore[s] !== undefined ? String(currentHighScore[s]) : '-';
        }
    }
}

function drawCells() {

    // this is for the locked in blocks
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const index = r * COLS + c;

            const value = board[r][c];
            cells[index].className = value ? 'cell filled piece-' + value : 'cell';
        }
    }

    // this is for the falling pieces
    for (let r = 0; r < currentShape.length; r++) {
        for (let c = 0; c < currentShape[r].length; c++) {
            if (!currentShape[r][c]) {
                continue;
            }

            const boardRow = currentRow + r;
            const boardCol = currentCol + c;

            if (boardRow < 0 || boardRow >= ROWS || boardCol < 0 || boardCol >= COLS) {
                continue;
            }
            cells[boardRow * COLS + boardCol].className = 'cell filled piece-' + currentPiece;
        }
    }
}

function isValidPlacement(shape, row, col) {
    for (let s = 0; s < shape.length; s++) {
        for (let c = 0; c < shape[s].length; c++) {
            if (!shape[s][c]) {
                continue;
            }

            const boardRow = row + s;
            const boardCol = col + c;

            if (boardCol < 0 || boardCol >= COLS) return false;            // walls
            if (boardRow >= ROWS) return false;                             // floor
            if (boardRow >= 0 && board[boardRow][boardCol]) return false;   // occupied
        }
    }

    return true;
}

function movePiece(rowOffset, colOffset) {
    const targetRow = currentRow + rowOffset;
    const targetCol = currentCol + colOffset;

    if (!isValidPlacement(currentShape, targetRow, targetCol)) {
        return false;
    }

    currentRow = targetRow;
    currentCol = targetCol;
    drawCells();

    return true;
}

function rotate(shape) {
    const size = shape.length;
    const rotated = [];

    for (let r = 0; r < size; r++) {
        const newRow = [];

        for (let c = 0; c < size; c++) {
            newRow.push(shape[size - 1 - c][r]);
        }

        rotated.push(newRow);
    }
    return rotated;
}

function rotatePiece() {
    const rotated = rotate(currentShape);

    if (!isValidPlacement(rotated, currentRow, currentCol)) {
        return false;
    }

    currentShape = rotated;
    drawCells();

    return true;
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        togglePause();
        return;
    }
    if (isGameOver || isPaused) {
        return;
    }
    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            movePiece(0, -1);
            break;

        case 'ArrowRight':
            event.preventDefault();
            movePiece(0, 1);
            break;

        case 'ArrowDown':
            event.preventDefault();
            movePiece(1, 0);
            break;

        case 'ArrowUp':
            event.preventDefault();
            rotatePiece();
            break;
    }
});

function lockPiece() {
    for (let r = 0; r < currentShape.length; r++) {
        for (let c = 0; c < currentShape[r].length; c++) {
            //skips the 0's in the Pieces matrices
            if (!currentShape[r][c]) {
                continue;
            }

            const boardRow = currentRow + r;
            const boardCol = currentCol + c;

            if (boardRow < 0 || boardRow >= ROWS || boardCol < 0 || boardCol >= COLS) {
                continue;
            }
            board[boardRow][boardCol] = currentPiece;
        }
    }
}

// Fisher-Yates array randomizer method
function shuffleBag(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function drawFromBag() {
    if (bag.length === 0) {
        bag = shuffleBag(Object.keys(PIECES));
    }
    return bag.shift();
}

function buildPreviewQueue() {
    for (let p = 0; p < previewEls.length; p++) {
        const ele = previewEls[p];
        ele.innerHTML = '';

        const theCells = [];

        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            ele.appendChild(cell);
            theCells.push(cell);
        }
        previewCells.push(theCells);
    }
}

function drawPreview() {
    for (let p = 0; p < previewEls.length; p++) {
        const theCells = previewCells[p];
        const letter = queue[p];
        const shape = PIECES[letter];

        for (const cell of theCells) {
            cell.className = 'cell';
        }

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) {
                    continue;
                }
                theCells[r * 4 + c].className = 'cell filled piece-' + letter;
            }
        }
    }
}

function fillQueue() {
    while (queue.length < QUEUE_SIZE) {
        queue.push(drawFromBag());
    }
}

function spawnNewPiece() {
    currentPiece = queue.shift();
    currentShape = PIECES[currentPiece];
    currentRow = 0;
    currentCol = 3;

    fillQueue();
    drawPreview();

    //this notifies that the stack reached the top
    return isValidPlacement(currentShape, currentRow, currentCol);
}

function clearLines() {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            r++; // recheck the same row after shifting
        }
    }
    return linesCleared;
}

function updateSpeed() {
    const newLevel = Math.floor(score / POINTS_PER_LEVEL); // creates level numbers instead of matching cases

    if (newLevel === level) {
        return;
    }

    level = newLevel;
    currentInterval = Math.max(MIN_INTERVAL, DROP_INTERVAL - level * SPEED_STEP);

    if (!isPaused && !isGameOver) {
        clearInterval(dropTimer);
        dropTimer = setInterval(gravityTick, currentInterval);
    }

    levelEl.textContent = String(level + 1);
}

function addScore(linesCleared) {
    if (linesCleared === 0) {
        return;
    }
    linesTotal += linesCleared;
    linesEl.textContent = String(linesTotal);

    score += LINE_SCORES[linesCleared];
    scoreEl.textContent = String(score);
    updateSpeed();
}
//return empty array instead of null so pushes just work
function getHighestScores() {
    const storedHighScores = localStorage.getItem(HIGH_SCORES_KEY);
    if (!storedHighScores) {
        return [];
    }
    try {
        const parsedHighestScore = JSON.parse(storedHighScores);
        return Array.isArray(parsedHighestScore) ? parsedHighestScore : [];
    } catch (error) {
        return [];
    }
}

function saveHighestScores(newScore) {
    const highScores = getHighestScores();
     highScores.push(newScore);
     highScores.sort((a, b) => b - a); //sort highest to lowest

    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores.slice(0, 5)));  // keep only the top 5 scores
}

function endGame() {
    clearInterval(dropTimer);
    dropTimer = null;
    isGameOver = true;
    finalScoreEl.textContent = String(score);

    if (score !== 0 ) {
        saveHighestScores(score);
    }

    drawHighScores();
    gameOverEl.showModal();
}

function gravityTick() {
    if (movePiece(1, 0)) {
        return;
    }
    lockPiece();
    addScore(clearLines());

    if (!spawnNewPiece()) {
        drawCells();
        endGame();
        return;
    }

    drawCells();
}

function pauseGame() {
    if (isGameOver || isPaused) {
        return;
    }
    clearInterval(dropTimer);
    dropTimer = null;
    isPaused = true;

    pauseButton.textContent = 'Resume';
}

function resumeGame() {
    if (isGameOver || !isPaused) {
        return;
    }
    dropTimer = setInterval(gravityTick, currentInterval);
    isPaused = false;

    pauseButton.textContent = 'Pause';
}

function togglePause() {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

if (pauseButton) {
    pauseButton.addEventListener('click', togglePause);
}

document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        pauseGame();
    }
});

function restartGame() {
    clearInterval(dropTimer);

    for (let i = 0; i < ROWS; i++) {
        board[i] = Array(COLS).fill(0);
    }
    score = 0;
    level = 1;
    linesTotal = 0;
    levelEl.textContent = String(level);
    linesEl.textContent = String(linesTotal);
    currentInterval = DROP_INTERVAL;
    scoreEl.textContent = String(score);
    bag.length = 0;
    queue.length = 0;
    isGameOver = false;
    isPaused = false;
    pauseButton.textContent = 'Pause';
    if (gameOverEl.open) {
        gameOverEl.close();
    }
    fillQueue();
    spawnNewPiece();
    drawCells();
    dropTimer = setInterval(gravityTick, currentInterval);
}

if (restartButton) {
    restartButton.addEventListener('click', restartGame);
}

if (playAgainButton) {
    playAgainButton.addEventListener('click', restartGame);
}


buildCells();
buildPreviewQueue();
drawHighScores();
fillQueue();
spawnNewPiece();
drawCells();

dropTimer = setInterval(gravityTick, currentInterval);

