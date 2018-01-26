import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppDemo } from './app.demo';
import { FractalComponent } from './fractal-component/fractal.component';


@NgModule({
  declarations: [
    AppDemo,
    FractalComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppDemo]
})
export class AppModule { }
