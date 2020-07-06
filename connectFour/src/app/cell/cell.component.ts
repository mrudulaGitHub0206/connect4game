import { Component, OnInit } from "@angular/core";
import { Mode, Player, PieceColor } from "../models";
import { Store, select } from "@ngrx/store";
import { AppState, selectMode } from "../reducers";


@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {

  _Mode = Mode;
  _Player = Player;
  _PieceColor = PieceColor;

  mode = Mode.UNKNOWN;
  isUnknown = true;

  mode$ = this.store.pipe(select(selectMode));

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.mode$.subscribe(mode => {
      this.mode = mode;
      this.isUnknown = this.mode === Mode.UNKNOWN;
    });
  }

  choose(mode) {
    this.mode = mode;
    this.isUnknown = this.mode === Mode.UNKNOWN;
  }
}
