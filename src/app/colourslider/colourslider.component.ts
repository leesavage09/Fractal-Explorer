import { Component, OnInit, ViewChild, Input, ElementRef,Output, EventEmitter} from '@angular/core';
import { FractalColoring } from "../../fractal/fractalColouring";

@Component({
  selector: 'app-colourslider',
  templateUrl: './colourslider.component.html',
  styleUrls: ['./colourslider.component.scss']
})
export class ColoursliderComponent implements OnInit {
  @Output() colourPhaseChanged = new EventEmitter();
  @ViewChild('slider') HTMLslider: ElementRef;
  private trackingMove:boolean = false;
  private startX:number = null;
  private startPhase;
  private fractalColor:FractalColoring;
  constructor() { }

  ngOnInit() {
  }

  @Input()
  set color(c: FractalColoring) {
    this.fractalColor = c;
    this.updateImg();
  }

  updateImg() {
    let slider = this.HTMLslider.nativeElement;
    let img = slider.getContext("2d").getImageData(0, 0, slider.width, 1);
    for (var i = 0; i < slider.width; ++i) {
      let rgb = this.fractalColor.picColor(i, slider.width);
      img.data[(i * 4) + 0] = rgb[0];
      img.data[(i * 4) + 1] = rgb[1];
      img.data[(i * 4) + 2] = rgb[2];
      img.data[(i * 4) + 3] = 255;  //alphas
    }
    for (var i = 0; i < slider.height; ++i) {
      slider.getContext("2d").putImageData(img, 0, i);
    }
  }

  start(event) {
    this.trackingMove = true;
    this.startX = event.offsetX;
    this.startPhase = this.fractalColor.totalPhase;
  }

  end(event) {
    this.trackingMove = false;
  }

  move(event) {
    if(!this.trackingMove) return;
    let offset  = this.startX-event.offsetX;
    let style = getComputedStyle(this.HTMLslider.nativeElement);
    let percent = offset/parseInt( style.width);
    this.fractalColor.totalPhase = this.startPhase+percent*100
    this.updateImg();
    this.colourPhaseChanged.emit(this.fractalColor);
  }

  touchMove(event) {
    if(!this.trackingMove) return;
  }

}
