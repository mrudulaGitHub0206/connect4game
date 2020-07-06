import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { StoreModule } from "@ngrx/store";
import { reducers, metaReducers } from "./reducers";
import { environment } from "../environments/environment";

import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { PlayerComponent } from "./player/player.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { CellComponent } from './cell/cell.component';
import { MainBoardComponent } from './main-board/main-board.component';
library.add(faArrowDown);

@NgModule({
  declarations: [AppComponent, CellComponent, PlayerComponent, MainBoardComponent],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    
    StoreModule.forRoot(reducers, { metaReducers }),
    !environment.production
      ? StoreDevtoolsModule.instrument({
          name: "NgRx Connect 4 Store DevTools",
          maxAge: 25 //  Retains last 25 states
        })
      : [],
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
