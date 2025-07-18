const overlay = document.querySelector("#overlay");
const overlayStep = document.querySelector("#overlay-step");
const overlayButtonAction = document.querySelector("#overlay-button-action");

const gameStatus = document.querySelector("#game-status");
const borderCells = document.querySelectorAll(".board-cell");
const resetGame = document.querySelector("#reset-game");

// const readline = require("readline");

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

function overlayAction() {
  const state = overlayButtonAction.getAttribute("state");
  console.log(`state: ${state}`);

  if (state === "init") {
    overlayButtonAction.setAttribute("state", "setPlayer1");
    fetchPlayerData(1, overlayStep);
  } else if (state === "setPlayer1") {
    const firstPlayerLayout = overlayStep.querySelector("#player-1");
    GameController.setPlayer1(firstPlayerLayout.value);
    overlayButtonAction.setAttribute("state", "setPlayer2");
    fetchPlayerData(2, overlayStep);
  } else if (state === "setPlayer2") {
    const secondPlayerLayout = overlayStep.querySelector("#player-2");
    GameController.setPlayer2(secondPlayerLayout.value);
    overlayButtonAction.setAttribute("state", "play");
    overlayButtonAction.innerText = "Let's Play";
    readyToGo(overlayStep);
  } else if (state === "play") {
    overlay.style.display = "none";
    GameController.startGame();
  }
}

overlayButtonAction.addEventListener("click", (e) => {
  const form = document.querySelector("#overlay-form");
  e.preventDefault();
  // console.log(`form.checkValidity(): ${form.checkValidity()} `);
  if (form.checkValidity()) {
    overlayAction();
  } else {
    form.reportValidity();
  }
});

function fetchPlayerData(number, parent) {
  parent.innerHTML = "";
  const playerNameLabel = document.createElement("p");
  playerNameLabel.textContent = `${number == 1 ? "First" : "Second"} player`;
  const playerNameInput = document.createElement("input");
  playerNameInput.id = `player-${number}`;
  playerNameInput.placeholder=`Enter player name`;
  playerNameInput.required = true;
  playerNameInput.minLength = 3;
  playerNameInput.maxLength = 12;
  playerNameInput.pattern = "^[a-zA-Z0-9_ ]+$";

  parent.appendChild(playerNameLabel);
  parent.appendChild(playerNameInput);
}

function readyToGo(parent) {
  parent.innerHTML = "";
  const player1 = GameController.getPlayer1();
  const player2 = GameController.getPlayer2();
  const readyToGoLabel = document.createElement("p");
  readyToGoLabel.style.fontSize = "1.5rem";
  readyToGoLabel.style.fontWeight = "bold";

  readyToGoLabel.innerHTML = `
  <span style="color: ${player1.color};">${player1.marker}</span>    ${player1.name}<br>
  <span style="color: ${player2.color};">${player2.marker}</span>    ${player2.name}
`;
  parent.appendChild(readyToGoLabel);
}

const Player = (name, marker, color) => {
  let selectedCells = [];
  const getSelectedCells = () => selectedCells;
  function addSelectedCell(index) {
    selectedCells.push(Number(index));
  }

  return { name, marker, color, addSelectedCell, getSelectedCells };
};

const GameBoard = (function () {
  let selectedCell;

  function setSelectedCell(newSelectedCell) {
    selectedCell = newSelectedCell;
  }

  const setCellContent = ({ marker, color }) => {
    if (selectedCell !== undefined) {
      selectedCell.textContent = marker;
      selectedCell.style.color = color;
      const cellIndex = selectedCell.id.charAt(selectedCell.id.length - 1);
      selectedCell = undefined;
      return cellIndex;
    }
  };

  const reset = () => {
    borderCells.forEach((cell) => (cell.textContent = ""));
  };

  return { setSelectedCell, setCellContent, reset };
})();

const GameController = (function () {
  const maxRounds = 9;
  const minRoundsToWin = 5;
  let currentRound = 1;
  let gameFinished = false;
  let gameStarted = false;

  let player1;
  let player2;

  let currentPlayer;

  const getPlayer1 = () => player1;
  const getPlayer2 = () => player2;
  const getCurrentRound = () => currentRound;
  const getCurrentPlayer = () => currentPlayer;
  const isGameFinished = () => gameFinished;
  const isGameActive = () => gameStarted && !gameFinished;

  const setPlayer1 = (name) => {
    player1 = Player(name, "X", "#D32f2f");
  };

  const setPlayer2 = (name) => {
    player2 = Player(name, "O", "#1976d2");
  };

  const startGame = () => {
    if (player1 !== undefined && player2 !== undefined) {
      currentPlayer = player1;
      gameStarted = true;
      setGameRoundStatus();
    }
  };

  const playTurn = (cell) => {
    if (!gameStarted) {
      return;
    } else if (currentRound <= maxRounds) {
      GameBoard.setSelectedCell(cell);
      const cellId = GameBoard.setCellContent(currentPlayer);
      if (cellId !== undefined) {
        currentPlayer.addSelectedCell(cellId);
      }
      if (currentRound >= minRoundsToWin && checkWinner()) {
        setGameResult(false);
        gameFinished = true;
        return;
      } else if (currentRound >= maxRounds) {
        setGameResult(true);
        gameFinished = true;
        return;
      }
      currentRound++;
      switchPlayer();
      setGameRoundStatus();
    } else {
      console.log("No Action.");
    }
  };

  const switchPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const checkWinner = () => {
    const playerCells = currentPlayer.getSelectedCells();
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // cols
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ];
    console.log(playerCells);
    return winPatterns.some((pattern) =>
      pattern.every((i) => playerCells.includes(i))
    );
  };

  const resetGame = () => {
    GameBoard.reset();
    currentRound = 1;
    gameFinished = false;
    currentPlayer = player1;
    setGameRoundStatus();
  };

  return {
    setPlayer1,
    setPlayer2,
    getPlayer1,
    getPlayer2,
    isGameActive,
    startGame,
    playTurn,
    maxRounds,
    getCurrentRound,
    getCurrentPlayer,
    isGameFinished,
    resetGame,
  };
})();

function setGameRoundStatus() {
  if (GameController.isGameActive()) {
    gameStatus.textContent = `${GameController.getCurrentPlayer().name} Turn`;
  } else {
    gameStatus.textContent = " ";
  }
}

function setGameResult(isDraw) {
  if (isDraw) {
    gameStatus.textContent = "DRAWS";
  } else {
    gameStatus.textContent = `${GameController.getCurrentPlayer().name} WINS!`;
  }
}

function getCellIndex(i) {
  rl.question(function (cellIndex) {
    GameController.playTurn(cellIndex);
    if (i + 1 >= GameController.maxRounds) {
      rl.close();
    } else {
      getCellIndex(++i);
    }
  });
}

borderCells.forEach((cell) =>
  cell.addEventListener("click", () => {
    if (GameController.isGameFinished()) {
    } else if (cell.textContent === "") {
      GameController.playTurn(cell);
    }
  })
);

resetGame.addEventListener("click", () => {
  GameController.resetGame();
});

overlayAction();
