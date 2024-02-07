const ROW_DATA_ATTRIB = "data-row-number";
const COL_DATA_ATTRIB = "data-col-number";

const gameSettings = (function () {
    let maxRowsColsDiv = document.querySelector("#board-size");
    let blocksNeededToWinDiv = document.querySelector("#winning-length");

    function getMaxRowsCols() {
        return parseInt(maxRowsColsDiv.value);
    }
    function getBlocksNeededToWin() {
        return parseInt(blocksNeededToWinDiv.value);
    }
    return {
        getMaxRowsCols,
        getBlocksNeededToWin
    }
})()
const game = (function () {
    let maxRowsCols;
    let blocksNeededToWin;
    const gameboard = [];
    const moves = ["X", "O"];
    let lastMoveIndex = 0;

    function setMaxRowsCols(newMaxRowsCols) {
        maxRowsCols = newMaxRowsCols;
    }

    function setBlocksNeededToWin(newBlocksNededToWin) {
        blocksNeededToWin = newBlocksNededToWin;
    }

    function _getFromBoard(row, col) {
        if (!gameboard[row]) {
            return;
        }

        // if row exists but not the col
        // it should still return undefined
        return gameboard[row][col];
    }

    function _addToBoard(move, row, col) {
        if (!gameboard[row]) {
            gameboard[row] = [];
        }

        gameboard[row][col] = move;
        return;
    }
    function _getNextMove() {
        let nextMoveIndex = lastMoveIndex == 0 ? 1 : 0;
        return {
            nextMove: moves[nextMoveIndex],
            nextMoveIndex
        };
    }

    function _commitNextMove(nextMoveIndex) {
        lastMoveIndex = nextMoveIndex;
    }

    function addMove(row, col) {
        let { nextMove, nextMoveIndex } = _getNextMove();
        if (row >= maxRowsCols || col >= maxRowsCols) {
            return;
        }
        if (!moves.includes(nextMove)) {
            return;
        }
        if (_getFromBoard(row, col)) {
            return;
        }
        _addToBoard(nextMove, row, col);
        _commitNextMove(nextMoveIndex);
        return _checkBoard(nextMove, row, col);
    }

    function _recursiveRelativeCheck(move, row, col, direction = 0, delta = 0, towards = "e", equalities = 1, winningCells = []) {
        // e means end, s means start
        // for row direction, e is right and s is left
        // for col direction, e is up and s is down 

        // to limit the direction
        if (direction > 3) {
            return winningCells;
        }

        // check if move won
        if (equalities === blocksNeededToWin) {
            winningCells.unshift({ row, col }); //add initial row, col to winningCells[0]
            return winningCells;
        }

        // first check right, then check left
        delta = towards == "e" ? delta + 1 : delta - 1;
        let nextRow = row;
        let nextCol = col;
        switch (direction) {
            case 0: //row
                nextCol = col + delta;
                break;
            case 1: //col
                nextRow = row + delta;
                break;
            case 2: //posSlope
                nextRow = row + delta;
                nextCol = col + delta;
                break;
            case 3: //negSlope
                nextRow = row - delta;
                nextCol = col + delta;
                break;
        }

        let nextMove = _getFromBoard(nextRow, nextCol);

        // check if next move is similar to move;
        // if not, go back to the next position
        // originating from the original position
        // and without changing equalities,

        if ((!nextMove || nextMove != move) && towards == "e") {
            return _recursiveRelativeCheck(move, row, col, direction, 0, "s", equalities, winningCells); //reset delta to original value
        } else if (nextMove === move) {
            winningCells.push({ row: nextRow, col: nextCol })
            return _recursiveRelativeCheck(move, row, col, direction, delta, towards, equalities + 1, winningCells);
        } else {
            // if all else fails, go to the next direction
            return _recursiveRelativeCheck(move, row, col, direction + 1, 0, "e", 1, []);
        }

    }

    function _checkBoard(move, row, col) {
        let winners = _recursiveRelativeCheck(move, row, col);
        return { moved: move, winners }
    }

    function resetBoard() {
        gameboard.length = 0;
    }

    return {
        gameboard,
        addMove,
        resetBoard,
        setMaxRowsCols,
        setBlocksNeededToWin
    }

})()

const domHandling = (function () {
    let maxRowsCols;
    const boardContainer = document.querySelector(".board-container");
    let board = document.createElement("div");
    board.classList.add("board");

    let rowsCache = [];
    let colsCache = [];
    let gameRunning = true;

    function setMaxRowsCols(newMaxRowsCols) {
        maxRowsCols = newMaxRowsCols;
    }
    function _render(parent, child, prepend = false) {
        let children = [];

        if (child instanceof Array) {
            children = child;
        } else {
            children.push(child);
        }

        if (prepend) {
            parent.prepend(...children);
            return;
        }
        parent.append(...children);
    }

    function _paintBoard(row, col) {
        colsCache[row][col].classList.add("selected");
    }

    function _cellClickHandler(e) {
        if (!gameRunning) {
            return;
        }
        let rowDiv = e.currentTarget;
        let colDiv = e.target;
        if (!(rowDiv.hasAttribute(ROW_DATA_ATTRIB) && colDiv.hasAttribute(COL_DATA_ATTRIB))) {
            return
        }
        let row = parseInt(rowDiv.getAttribute(ROW_DATA_ATTRIB));
        let col = parseInt(colDiv.getAttribute(COL_DATA_ATTRIB));
        let move = game.addMove(row, col);

        if (!move) {
            return;
        }

        colDiv.textContent = move.moved;
        if (move.winners.length > 0) {
            for (winner of move.winners) {
                _paintBoard(winner.row, winner.col);
            }
            gameRunning = false;
        }
    }

    function createBoard() {
        board.removeAttribute("style");
        board.style.gridTemplateRows = `repeat(${maxRowsCols}, 1fr)`;

        for (let i = 0; i < maxRowsCols; i++) {
            let row = document.createElement("div");
            row.classList.add("row");
            row.setAttribute(ROW_DATA_ATTRIB, i);
            row.addEventListener("click", _cellClickHandler);
            row.removeAttribute("style");
            row.style.gridTemplateColumns = `repeat(${maxRowsCols}, 1fr)`;
            rowsCache[i] = row;
            colsCache[i] = [];
            for (j = 0; j < maxRowsCols; j++) {
                let col = document.createElement("div");
                col.classList.add("col");
                col.setAttribute(COL_DATA_ATTRIB, j);
                colsCache[i][j] = col;
                row.appendChild(col);
            }
        }
        _render(boardContainer, board, true);
        _render(board, rowsCache);
    }

    function resetBoard() {
        gameRunning = true;
        board.replaceChildren();
        rowsCache = [];
        colsCache = [];
        createBoard();
    }
    return {
        setMaxRowsCols,
        createBoard,
        resetBoard
    }

})()

function setGame() {
    console.log(gameSettings.getBlocksNeededToWin());
    game.setMaxRowsCols(gameSettings.getMaxRowsCols());
    game.setBlocksNeededToWin(gameSettings.getBlocksNeededToWin());
    domHandling.setMaxRowsCols(gameSettings.getMaxRowsCols());
}

const resetButton = document.querySelector(".reset");
resetButton.addEventListener("click", e => {
    setGame();
    game.resetBoard();
    domHandling.resetBoard();
});

setGame();
domHandling.createBoard();



