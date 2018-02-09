import { Component, OnInit, Input, ViewChild, ElementRef ,EventEmitter,Output} from '@angular/core';
import { GradientPanelComponent } from './gradientPanel/gradientPanel.component';
import { Element } from '@angular/compiler';

import { Color } from "../../helper/helper.module";

@Component({
  selector: 'app-gradientbuilder',
  templateUrl: './gradientbuilder.component.html',
  styleUrls: ['./gradientbuilder.component.scss']
})
export class GradientbuilderComponent implements OnInit {
  @ViewChild('canvas') rootDiv: ElementRef;
  @ViewChild('gradientpanel') StopMarkerSlider: GradientPanelComponent;
  @Output() gradientChanged = new EventEmitter();
  fractalCanvas: HTMLCanvasElement
  constructor() { }

  ngOnInit() {
  }



  @Input()
  set canvas(c: HTMLCanvasElement) {
    this.fractalCanvas = c;
    this.rootDiv.nativeElement.appendChild(this.fractalCanvas);
  }

  changed(event){
    this.gradientChanged.emit(event);
  }

  
}
