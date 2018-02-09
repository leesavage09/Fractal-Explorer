import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppDemo } from './app.demo';
import { FractalComponent } from './fractal/fractal.component';
import { ColoursliderComponent } from './colourslider/colourslider.component';
import { GradientbuilderComponent } from './gradientbuilder/gradientbuilder.component';
import { GradientPanelComponent } from './gradientbuilder/gradientPanel/gradientPanel.component';
import { StopMarkerComponent } from './gradientbuilder/gradientPanel/stop-marker/stop-marker.component';


@NgModule({
  entryComponents: [ StopMarkerComponent ],
  declarations: [
    AppDemo,
    FractalComponent,
    ColoursliderComponent,
    GradientbuilderComponent,
    GradientPanelComponent,
    StopMarkerComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppDemo]
})
export class AppModule { }
