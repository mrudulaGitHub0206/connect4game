import { ConnectActionTypes, ConnectActions } from "./connect.actions";
import { Player, Outcome, COLUMNS, Mode, Direction, Pos, ROWS } from "../models";
import { Board } from "../util/board";
import { createSelector, createFeatureSelector } from "@ngrx/store";


export interface ConnectState {
  board: Board;
  nextPlayer: Player;
  outcome: Outcome;
  winningSequence: number[];
  direction: Direction;
  reset: boolean;
  columnAvailable: boolean[];
  mode: Mode;
  lastMove: Pos;
}

const initColumns = (value: boolean) => {
  const columns = [];
  for (let i = 0; i < COLUMNS; i++) {
    columns.push(value);
  }
  return columns;
};

export const initialState: ConnectState = {
  board: new Board(),
  nextPlayer: Player.PLAYER1,
  outcome: Outcome.DEFAULT,
  winningSequence: null,
  direction: null,
  reset: false,
  columnAvailable: initColumns(true),
  mode: Mode.UNKNOWN,
  lastMove: null
};

const nextAction = (state: ConnectState, action): ConnectState => {
  const { mode = Mode.UNKNOWN, player, column } = action.payload;
  const board = new Board();
  board.clone(state.board.newGrid);
  board.play(column, player);
  const winning = board.isWinningMove(column, player);
  const { win, direction, sequence: winningSequence } = winning;
  const draw = board.isDraw();
  let outcome = Outcome.DEFAULT;
  if (player === Player.PLAYER1 && win === true) {
    outcome = Outcome.PLAYER1_WINS;
  } else if (player === Player.PLAYER2 && win === true) {
    outcome = Outcome.PLAYER2_WINS;
  }  else if (draw === true) {
    outcome = Outcome.DRAW;
  }
  const reset = win || draw;
  let nextPlayer = Player.PLAYER1;
  if (player === Player.PLAYER1) {
    nextPlayer = mode === Mode.HUMAN_VS_HUMAN ? Player.PLAYER2 : Player.PLAYER2;
  } else if (player === Player.PLAYER2) {
    nextPlayer = Player.PLAYER1;
  }
  let columnAvailable = [];
  if (reset === true) {
    columnAvailable = initColumns(false);
  } else {
    for (let i = 0; i < COLUMNS; i++) {
      columnAvailable.push(board.canPlay(i));
    }
  }
  const lastMove = {
    row: board.height[column] - 1,
    col: column
  };
  return {
    board,
    nextPlayer,
    outcome,
    winningSequence,
    direction,
    reset,
    columnAvailable,
    mode: state.mode,
    lastMove
  };
};

export function connectReducer(state = initialState, action: ConnectActions): ConnectState {
  switch (action.type) {
    case ConnectActionTypes.Player1Move:
    case ConnectActionTypes.Player2Move:
      return nextAction(state, action);
    case ConnectActionTypes.NewGame:
      const { mode } = action.payload;
      return Object.assign({}, initialState, { mode });
    case ConnectActionTypes.ChooseMode:
      return initialState;
    default:
      return state;
  }
}

// connect selector
export const selectConnect = createFeatureSelector<ConnectState>("connect");
export const selectGrid = createSelector(selectConnect, ({ board, reset, nextPlayer }) => ({
  board,
  reset,
  nextPlayer
}));
export const selectNextPlayer = createSelector(selectConnect, ({ nextPlayer }) => ({
  nextPlayer
}));
export const selectMovesLeft = createSelector(selectGrid, ({ board }) => board.remainingMoves);
export const selectOutcome = createSelector(selectConnect, ({ outcome }) => outcome);
export const selectColumnAvailable = createSelector(selectConnect, ({ columnAvailable }) => columnAvailable);
export const selectResetGame = createSelector(selectConnect, ({ reset }) => reset);
export const selectWinningSequence = createSelector(
  selectConnect,
  ({ outcome, direction, winningSequence: sequence }) => {
    let winner: Player;
    if (outcome === Outcome.PLAYER1_WINS) {
      winner = Player.PLAYER1;
    } else if (outcome === Outcome.PLAYER2_WINS) {
      winner = Player.PLAYER2;
    }
     else {
      winner = null;
    }
    return {
      direction,
      sequence,
      winner
    };
  }
);
export const selectMode = createSelector(selectConnect, ({ mode }) => mode);
export const selectLastMove = createSelector(selectConnect, ({ lastMove }) => {
  if (lastMove) {
    const row = ROWS - lastMove.row - 1;
    const lastMoveIdx = lastMove ? row * COLUMNS + lastMove.col : null;
    return { lastMove, lastMoveIdx };
  }
  return { lastMove: null, lastMoveIdx: null };
});
