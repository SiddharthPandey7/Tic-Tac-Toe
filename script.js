let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { player: 0, ai: 0 };
let playerName = 'You';
const aiName = 'AI';
let difficulty = 'easy';


const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

updateStatus();

function handleCellClick(e) {
    if (!gameActive || currentPlayer === 'O') return;
    
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (gameBoard[index] !== '') return;

    makeMove(index, 'X');
    if (gameActive) {
        setTimeout(aiMove, 500);
    }
}

function makeMove(index, player) {
    gameBoard[index] = player;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());

    const winResult = checkWin(player);
    if (winResult) {
        gameActive = false;
        highlightWinningPattern(winResult.combination);
        updateScore(player);
        showWinner(player);
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        showWinner('Draw');
        return;
    }

    currentPlayer = player === 'X' ? 'O' : 'X';
    updateStatus();
}

function checkWin(player) {
    for (let combination of winningCombinations) {
        if (combination.every(index => gameBoard[index] === player)) {
            return { won: true, combination: combination };
        }
    }
    return null;
}

function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

function highlightWinningPattern(winningCombo) {
    winningCombo.forEach(index => {
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        cell.classList.add('winning');
    });
}

function aiMove() {
    if (!gameActive) return;

    let move;
    switch (difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = findBestMove('O') || findBestMove('X') || getRandomMove();
            break;
        case 'hard':
            move = minimax(gameBoard, 'O').index;
            break;
    }

    if (move !== null && move !== undefined) {
        makeMove(move, 'O');
    }
}

function findBestMove(player) {
    for (let combo of winningCombinations) {
        let [a, b, c] = combo;
        if (gameBoard[a] === player && gameBoard[b] === player && gameBoard[c] === '') return c;
        if (gameBoard[a] === player && gameBoard[c] === player && gameBoard[b] === '') return b;
        if (gameBoard[b] === player && gameBoard[c] === player && gameBoard[a] === '') return a;
    }
    return null;
}

function getRandomMove() {
    const emptyCells = gameBoard
        .map((val, idx) => val === '' ? idx : null)
        .filter(val => val !== null);
    return emptyCells.length > 0 ? 
        emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
}

function minimax(board, player) {
    const emptyCells = board
        .map((val, idx) => val === '' ? idx : null)
        .filter(val => val !== null);

    if (checkWin('X')) return { score: -10 };
    if (checkWin('O')) return { score: 10 };
    if (emptyCells.length === 0) return { score: 0 };

    let bestMove;
    if (player === 'O') {
        bestMove = { score: -Infinity };
        for (let i of emptyCells) {
            board[i] = 'O';
            let result = minimax(board, 'X');
            board[i] = '';
            if (result.score > bestMove.score) {
                bestMove.score = result.score;
                bestMove.index = i;
            }
        }
    } else {
        bestMove = { score: Infinity };
        for (let i of emptyCells) {
            board[i] = 'X';
            let result = minimax(board, 'O');
            board[i] = '';
            if (result.score < bestMove.score) {
                bestMove.score = result.score;
                bestMove.index = i;
            }
        }
    }
    return bestMove;
}

function updateScore(winner) {
    if (winner === 'X') {
        scores.player++;
        document.getElementById('player-score').textContent = scores.player;
    } else if (winner === 'O') {
        scores.ai++;
        document.getElementById('ai-score').textContent = scores.ai;
    }
}

function showWinner(winner) {
    const modal = document.getElementById('winner-modal');
    const winnerText = document.getElementById('winner-text');
    
    if (winner === 'X') {
        winnerText.textContent = `${playerName} Wins!`;
    } else if (winner === 'O') {
        winnerText.textContent = `${aiName} Wins!`;
    } else {
        winnerText.textContent = "It's a Draw!";
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('winner-modal').style.display = 'none';
    resetGame();
}

function resetGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    updateStatus();
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
    });
}

function updateNames() {
    playerName = document.getElementById('player-name').value || 'You';
    document.getElementById('player-name-display').textContent = playerName;
    updateStatus();
}

function updateDifficulty() {
    difficulty = document.getElementById('difficulty-select').value;
    resetGame();
}

function updateStatus() {
    document.getElementById('status').textContent = 
        currentPlayer === 'X' ? `${playerName}'s turn (X)` : `${aiName}'s turn (O)`;
}