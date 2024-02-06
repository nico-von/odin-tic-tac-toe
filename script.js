const MAX_ROWS_COLS = 6;
const BLOCKS_NEEDED_TO_WIN = 3;
const ROW_DATA_ATTRIB = "data-row-number";
const COL_DATA_ATTRIB = "data-col-number";

const game = (function (maxRowsCols, blocksNeededToWin) {
    const gameboard = [];
    const moves = ["X", "O"];
    let lastMoveIndex = 0;

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
        return _checkBoard(nextMove);
    }
    function _recursiveCheck(row, col) {
    }

    function _checkBoard(moved) {
        // check rows and cols
        let winner = null;
        winner = _recursiveCheck(0,0);
        return {moved, winner}
    }

    function resetBoard() {
        gameboard.length = 0;
    }

    return {
        gameboard,
        addMove,
        resetBoard
    }

})(MAX_ROWS_COLS, BLOCKS_NEEDED_TO_WIN)

const domHandling = (function (maxRowsCols) {
    function _render(child) {
        document.body.append(child);
    }

    function _cellClickHandler(e) {
        let rowDiv = e.currentTarget;
        let colDiv = e.target;
        if (!(rowDiv.hasAttribute(ROW_DATA_ATTRIB) && colDiv.hasAttribute(COL_DATA_ATTRIB))) {
            return
        }
        let row = rowDiv.getAttribute(ROW_DATA_ATTRIB);
        let col = colDiv.getAttribute(COL_DATA_ATTRIB);
        let move = game.addMove(row, col);
        console.log(move)
        if (!move) {
            return;
        }

        colDiv.textContent = move.moved;
        if (move.result) {
            alert(`${move.result} won!`)
        }
    }

    function createBoard() {
        let board = document.createElement("div");
        board.classList.add("board");
        for (let i = 0; i < maxRowsCols; i++) {
            let row = document.createElement("div");
            row.classList.add("row");
            row.setAttribute(ROW_DATA_ATTRIB, i);
            row.addEventListener("click", _cellClickHandler);
            board.appendChild(row);
            for (j = 0; j < maxRowsCols; j++) {
                let col = document.createElement("div");
                col.classList.add("col");
                col.setAttribute(COL_DATA_ATTRIB, j);
                row.appendChild(col);
            }
        }
        _render(board);
    }
    return {
        createBoard,
    }

})(MAX_ROWS_COLS)

function main() {
    domHandling.createBoard();
}

window.onload = main;


