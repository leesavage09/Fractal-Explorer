import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppDemo } from './app.demo';
import { ExplorerComponent } from './explorer/explorer.component';
import { ColoursliderComponent } from './histogram/colourslider/colourslider.component';
import { GradientBuilderComponent } from './gradientBuilder/gradientBuilder.component';
import { StopMarkerComponent } from './gradientBuilder/stop-marker/stop-marker.component';
import { HistogramComponent } from './histogram/histogram.component';
import { JuliaPickerComponent } from './juliaPicker/juliaPicker.component';
import { FractalViewComponent } from './fractalView/fractalView.component';
import { AlertComponent } from './alert/alert.component';

@NgModule({
  entryComponents: [ StopMarkerComponent ],
  declarations: [
    AppDemo,
    ExplorerComponent,
    ColoursliderComponent,
    GradientBuilderComponent,
    StopMarkerComponent,
    HistogramComponent,
    JuliaPickerComponent,
    FractalViewComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppDemo]
})
export class AppModule { }
