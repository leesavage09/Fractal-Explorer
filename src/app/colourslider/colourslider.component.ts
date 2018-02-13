import { Component, OnInit, ViewChild, Input, ElementRef,Output, EventEmitter} from '@angular/core';

import { Color } from "../../helper/helper.module";

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
  private linearGradient:Color.LinearGradient;
  constructor() { }

  ngOnInit() {
  }

  @Input()
  set color(c: Color.LinearGradient) {
    this.linearGradient = c;
    this.updateImg();
  }

  updateImg() {
    let slider = this.HTMLslider.nativeElement;
    let img = slider.getContext("2d").getImageData(0, 0, slider.width, 1);
    for (var i = 0; i < slider.width; ++i) {
      let val = i/slider.width
      let rgb = this.linearGradient.getColorAt(val);
      img.data[(i * 4) + 0] = rgb.r;
      img.data[(i * 4) + 1] = rgb.g;
      img.data[(i * 4) + 2] = rgb.b;
      img.data[(i * 4) + 3] = 255;  //alphas
    }
    for (var i = 0; i < slider.height; ++i) {
      slider.getContext("2d").putImageData(img, 0, i);
    }
  }

  start(event) {
    this.trackingMove = true;
    this.startX = event.offsetX;
    this.startPhase = this.linearGradient.getPhase();
  }

  end(event) {
    this.trackingMove = false;
  }

  move(event) {
    if(!this.trackingMove) return;
    let offset  = this.startX-event.offsetX;
    let style = getComputedStyle(this.HTMLslider.nativeElement);
    let percent = offset/parseInt( style.width);
    this.linearGradient.setPhase(this.startPhase+percent)
    this.updateImg();
    this.colourPhaseChanged.emit(this.linearGradient);
  }

  touchMove(event) {
    if(!this.trackingMove) return;
  }

}
