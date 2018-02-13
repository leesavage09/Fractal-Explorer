import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppDemo } from './app.demo';
import { FractalComponent } from './fractal/fractal.component';
import { ColoursliderComponent } from './gradientbuilder/colourslider/colourslider.component';
import { GradientbuilderComponent } from './gradientbuilder/gradientbuilder.component';
import { GradientPanelComponent } from './gradientbuilder/gradientPanel/gradientPanel.component';
import { StopMarkerComponent } from './gradientbuilder/gradientPanel/stop-marker/stop-marker.component';
import { HistogramComponent } from './gradientbuilder/histogram/histogram.component';

@NgModule({
  entryComponents: [ StopMarkerComponent ],
  declarations: [
    AppDemo,
    FractalComponent,
    ColoursliderComponent,
    GradientbuilderComponent,
    GradientPanelComponent,
    StopMarkerComponent,
    HistogramComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppDemo]
})
export class AppModule { }
