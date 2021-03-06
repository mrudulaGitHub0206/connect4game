import { Component, OnInit, Input, Renderer2, ElementRef, ViewChildren, QueryList } from "@angular/core";
import { Store, select } from "@ngrx/store";
import {
  AppState,
  selectMovesLeft,
  selectColumnAvailable,
  selectNextPlayer,
  selectGrid,
  selectOutcome,
  selectResetGame,
  selectWinningSequence,
  selectLastMove
} from "../reducers";
import * as connectActions from "../reducers/connect.actions";
import { Player, Mode, ROWS, COLUMNS, Direction } from "../models";
import { createSolver, SolverType } from "../solvers";
import { Board } from "../util/board";

@Component({
  selector: 'app-main-board',
  templateUrl: './main-board.component.html',
  styleUrls: ['./main-board.component.scss']
})
export class MainBoardComponent implements OnInit {

  _Mode = Mode;
  _Player = Player;

  @Input()
  mode: Mode;

  // Observables
  grid$ = this.store.pipe(select(selectGrid));
  moveLefts$ = this.store.pipe(select(selectMovesLeft));
  columnAvailable$ = this.store.pipe(select(selectColumnAvailable));
  nextPlayer$ = this.store.pipe(select(selectNextPlayer));
  outcome$ = this.store.pipe(select(selectOutcome));
  resetGame$ = this.store.pipe(select(selectResetGame));
  winningSequence$ = this.store.pipe(select(selectWinningSequence));
  lastMove$ = this.store.pipe(select(selectLastMove));
  nextPlayer: Player;
  columnsAvailable: boolean[];

  // AI algorithm
  solver: SolverType;
  board: Board;
  grid: string[];

  rowRange = this.rangeHelper(ROWS, false);
  columnRange = this.rangeHelper(COLUMNS);
  totalColumns = COLUMNS;

  @ViewChildren("circles")
  gridCells: QueryList<ElementRef>;

  constructor(private store: Store<AppState>, private renderer: Renderer2) {}

  ngOnInit() {
    this.board = new Board();
    if (!this.solver) {
      this.initSolver();
    }
    this.store.dispatch(new connectActions.NewGameAction({ mode: this.mode }));
    this.grid$.subscribe(({ board, reset, nextPlayer }) => {
      this.board = board;
      this.nextPlayer = nextPlayer;
    });
    this.columnAvailable$.subscribe(columnsAvailable => (this.columnsAvailable = columnsAvailable));
    this.lastMove$.subscribe(({ lastMove, lastMoveIdx }) => {
      if (lastMove && this.gridCells) {
        const { row, col } = lastMove;
        const el = this.gridCells.toArray()[lastMoveIdx];
        if (!el) {
          return;
        }
        if (this.isSamePlayer(row, col, Player.PLAYER1)) {
          this.renderer.removeClass(el.nativeElement, "free-cell");
          this.renderer.addClass(el.nativeElement, "player1");
        } else if (this.isSamePlayer(row, col, Player.PLAYER2)) {
          this.renderer.removeClass(el.nativeElement, "free-cell");
          this.renderer.addClass(el.nativeElement, "player2");
        }
      }
    });
  }

  initSolver() {
    this.solver = createSolver();
    this.solver.setMinimizePlayer(Player.PLAYER1);
  }

  select(column) {
    if (this.columnsAvailable[column] === false) {
      return;
    }
    if (this.nextPlayer === Player.PLAYER1) {
      this.store.dispatch(
        new connectActions.PlayerOneMoveAction({
          mode: this.mode,
          player: this.nextPlayer,
          column
        })
      );
    } else if (this.nextPlayer === Player.PLAYER2) {
      this.store.dispatch(
        new connectActions.PlayerTwoMoveAction({
          player: this.nextPlayer,
          column
        })
      );
    }
  }

  clearState() {
    this.store.dispatch(new connectActions.NewGameAction({ mode: this.mode }));
    if (this.gridCells) {
      const gridCellsArray = this.gridCells.toArray();
      gridCellsArray.forEach(g => {
        if (g && g.nativeElement) {
          this.renderer.setAttribute(g.nativeElement, "class", "grid-circle free-cell");
        }
      });
    }
  }

  backToMode() {
    this.store.dispatch(new connectActions.ChooseModeAction());
  }

  // for testing
  setTestSolver(solver: SolverType) {
    this.solver = solver;
  }

  private rangeHelper(exclusiveNum: number, increasing: boolean = true) {
    if (exclusiveNum <= 0) {
      return [];
    }
    const arr = [];
    if (increasing === true) {
      for (let i = 0; i < exclusiveNum; i++) {
        arr.push(i);
      }
    } else {
      for (let i = exclusiveNum - 1; i >= 0; i--) {
        arr.push(i);
      }
    }
    return arr;
  }

  isSamePlayer(row: number, column: number, player: Player) {
    return this.board.isSamePlayer(row, column, player);
  }

  strikeThrough({ direction, sequence, winner }, row: number, column: number, delta: number) {
    const idx = row * COLUMNS + column;
    if (
      direction == null ||
      !sequence ||
      !winner ||
      !this.isSamePlayer(row, column, winner) ||
      sequence.indexOf(idx) < 0
    ) {
      return false;
    }
    switch (delta) {
      case 1:
        return direction === Direction.HORIZONTAL;
      case 7:
        return direction === Direction.VERTICAL;
      case 6:
        return direction === Direction.LEFT_DIAG;
      case 8:
        return direction === Direction.RIGHT_DIAG;
    }
    return false;
  }
}
