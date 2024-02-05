const MAX_ROWS_COLS = 3;

const game = (function () {
    const gameboard = [];
    const moves = [-1, 1];

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

    function addMove(move, row, col) {
        if (row >= MAX_ROWS_COLS || col >= MAX_ROWS_COLS) {
            return;
        }
        if (!moves.includes(move)) {
            return;
        }
        if (_getFromBoard(row, col)) {
            return;
        }
        _addToBoard(move, row, col);
        return checkBoard();
    }

    //recursive board check
    function _checkRowsCols(row, col, direction = "rows", total) {
        //base case
        if (Math.abs(total) == MAX_ROWS_COLS) {
            return total / MAX_ROWS_COLS;
        }

        const currCell = _getFromBoard(row, col);
        if (!currCell) return;

        if (direction == "row") {
            return _checkRowsCols(row, col + 1, direction, currCell + total);
        } else if (direction == "col") {
            return _checkRowsCols(row + 1, col, direction, currCell + total);
        } else if (direction == "diag-left") {
            return _checkRowsCols(row + 1, col + 1, direction, currCell + total);
        } else if (direction == "diag-right") {
            return _checkRowsCols(row - 1, col + 1, direction, currCell + total);
        }
    }

    function checkBoard() {
        // check rows and cols
        for (let i = 0; i < MAX_ROWS_COLS; i++) {
            let winnerRow = _checkRowsCols(i, 0, "row", 0);
            if (winnerRow) { 
                return winnerRow 
            }

            let winnerCol = _checkRowsCols(0, i, "col", 0);
            if (winnerCol) { 
                return winnerCol 
            }
        }
        // check diag-left
        let winnerDiagLeft = _checkRowsCols(0, 0, "diag-left", 0);
        if (winnerDiagLeft) return winnerDiagLeft
        // check diag-right
        let winnerDiagRight = _checkRowsCols(MAX_ROWS_COLS, 0, "diag-right", 0);
        if (winnerDiagRight) return winnerDiagRight
    }

    function resetBoard() {
        gameboard.length = 0;
    }

    return {
        gameboard,
        addMove,
        resetBoard,
    }

})()