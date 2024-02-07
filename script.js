const MAX_ROWS_COLS = 10;
const BLOCKS_NEEDED_TO_WIN = 4;
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
        return _checkBoard(nextMove, row, col);
    }

    function _recursiveRelativeCheck(move, row, col, direction = 0, delta = 0, towards = "e", equalities = 1) {
        // e means end, s means start
        // for row direction, e is right and s is left
        // for col direction, e is up and s is down 

        // to limit the direction
        if (direction > 3) {
            return;
        }

        // check if move won
        if (equalities === blocksNeededToWin) {
            return true;
        }

        // first check right, then check left
        delta = towards == "e" ? delta + 1 : delta - 1;
        let step, nextMove;
        switch (direction) {
            case 0: //row
                nextMove = _getFromBoard(row, col + delta);
                break;
            case 1: //col
                nextMove = _getFromBoard(row + delta, col);
                break;
            case 2: //posSlope
                nextMove = _getFromBoard(row + delta, col + delta);
                break;
            case 3: //negSlope
                nextMove = _getFromBoard(row - delta, col + delta);
                break;

        }

        // check if next move is similar to move;
        // if not, go back to the next position
        // originating from the original position
        // and without changing equalities,

        if ((!nextMove || nextMove != move) && towards == "e") {
            return _recursiveRelativeCheck(move, row, col, direction, 0, "s", equalities); //reset delta to original value
        } else if (nextMove === move) {
            return _recursiveRelativeCheck(move, row, col, direction, delta, towards, equalities + 1);
        } else {
            // if all else fails, go to the next direction
            return _recursiveRelativeCheck(move, row, col, direction + 1, 0, "e", 1);
        }

    }

    function _checkBoard(move, row, col) {
        let isWinner = _recursiveRelativeCheck(move, row, col);
        return { moved: move, isWinner }
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
        let row = parseInt(rowDiv.getAttribute(ROW_DATA_ATTRIB));
        let col = parseInt(colDiv.getAttribute(COL_DATA_ATTRIB));
        let move = game.addMove(row, col);

        if (!move) {
            return;
        }

        colDiv.textContent = move.moved;
        if (move.isWinner) {
            alert(`${move.moved} won!`)
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


