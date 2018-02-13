import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { GradientPanelComponent } from './gradientPanel/gradientPanel.component';
import { Element } from '@angular/compiler';

import { FractalColor } from "../../fractal/fractalColouring";
import { HistogramComponent } from "./histogram/histogram.component";
import { Fractals } from '../../fractal/fractal.module';

@Component({
  selector: 'app-gradientbuilder',
  templateUrl: './gradientbuilder.component.html',
  styleUrls: ['./gradientbuilder.component.scss']
})
export class GradientbuilderComponent {
  @ViewChild('canvas') rootDiv: ElementRef;
  @ViewChild('histogram') appHistogram: HistogramComponent;
  @ViewChild('gradientpanel') gradientPanel: GradientPanelComponent;
  fractalCanvas: HTMLCanvasElement
  constructor() { }

  @Input()
  set fractal(frac: Fractals.Fractal) {
    this.appHistogram.setFractal(frac)
    this.gradientPanel.setGradient(frac.getColor())
  }

}