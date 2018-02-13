import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { GradientPanelComponent } from './gradientPanel/gradientPanel.component';
import { Element } from '@angular/compiler';

import { Color } from "../../helper/helper.module";
import { HistogramComponent } from "./histogram/histogram.component";
import { Fractals } from '../../fractal/fractal.module';

@Component({
  selector: 'app-gradientbuilder',
  templateUrl: './gradientbuilder.component.html',
  styleUrls: ['./gradientbuilder.component.scss']
})
export class GradientbuilderComponent implements OnInit {
  @ViewChild('canvas') rootDiv: ElementRef;
  @ViewChild('histogram') appHistogram: HistogramComponent;
  @ViewChild('gradientpanel') StopMarkerSlider: GradientPanelComponent;
  fractalCanvas: HTMLCanvasElement
  constructor() { }

  ngOnInit() {
  }



  @Input()
  set canvas(c: HTMLCanvasElement) {
    this.fractalCanvas = c;
    this.rootDiv.nativeElement.appendChild(this.fractalCanvas);
  }

  @Input()
  set fractal(frac: Fractals.Fractal) {
    this.appHistogram.setFractal(frac)
    this.StopMarkerSlider.setGradient(frac.getColor())
  }


}
