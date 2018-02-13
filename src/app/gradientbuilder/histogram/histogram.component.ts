import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { Fractals } from "../../../fractal/fractal.module";
import { Color, General } from "../../../helper/helper.module";
import { ColoursliderComponent } from "../../colourslider/colourslider.component";

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit {
  @ViewChild('histogramCanvas') histogramCanvas: ElementRef;
  private fractal: Fractals.Fractal;
  @ViewChild('markerMin') markerMin: ElementRef;
  @ViewChild('markerMid') markerMid: ElementRef;
  @ViewChild('markerMax') markerMax: ElementRef;
  @ViewChild('container') container: ElementRef;
  @ViewChild('gradientSlider') HTMLgradientSlider: ColoursliderComponent;
  private movingMarker: HTMLDivElement;
  private data: Array<number>;
  private startX: number;
  constructor() {
  }

  ngOnInit() {

  }


  setFractal(fractal: Fractals.Fractal) {
    this.fractal = fractal;
    this.data = fractal.getHistogram();
    
    this.HTMLgradientSlider.color = this.fractal.getColor();

    this.drawHistogram();
    this.updateGradient()
  }

  /*
  * Events
  */

  select(event) {
    this.movingMarker = event.target || event.srcElement || event.currentTarget;
    this.startX = event.screenX
  }

  removeSelect(event) {
    this.movingMarker = null;
  }

  move(event) {
    if (this.movingMarker == null) return;

    let offset = event.screenX - this.startX

    let currentPos = this.getCSSLeft(this.movingMarker)
    let newPos = currentPos + offset

    let min = this.getMinCSSLeft(this.movingMarker);
    let max = this.getMaxCSSLeft(this.movingMarker);
    if (newPos > max) newPos = max
    else if (newPos < min) newPos = min

    this.movingMarker.style.left = newPos.toString() + "px";
    this.startX = event.screenX
    this.updateGradient()
  }

  /*
  * Public Methods
  */


  /*
  * Private Methods
  */

  private drawHistogram() {
    const ctx = <CanvasRenderingContext2D>this.histogramCanvas.nativeElement.getContext("2d");

    const numBin = this.data.length-1
  
    var total = 0;
    for (var i = 0; i < this.data.length; i++) {
      total += this.data[i];
    }
    var avg = total / this.data.length;

    const widthBin = ctx.canvas.width / numBin
    const hightCount = ctx.canvas.height / (avg)

    const img = ctx.getImageData(0, 0, ctx.canvas.width, 1);
    let c
    for (var y = 0; y < ctx.canvas.height; ++y) {
      for (var x = 0; x < ctx.canvas.width; ++x) {
        let binNum = Math.trunc(x / widthBin)
       
        if ((y / hightCount) < this.data[binNum]) c = new Color.RGBcolor(0, 0, 0)
        else c = new Color.RGBcolor(255, 255, 255)

        img.data[(x * 4) + 0] = c.r;
        img.data[(x * 4) + 1] = c.g;
        img.data[(x * 4) + 2] = c.b;
        img.data[(x * 4) + 3] = 255;
      }
      ctx.putImageData(img, 0, ctx.canvas.height - y);
    }
  }

  private updateGradient() {
    this.fractal.getColor().setMin(this.getMinVal())
    this.fractal.getColor().setMid(this.getMidVal())
    this.fractal.getColor().setMax(this.getMaxVal())
    this.fractal.getColor().notify(null);
  }

  private getMinVal() {
    let left = this.getCSSLeft(this.markerMin.nativeElement)
    return General.mapInOut(left, this.getMinCSSLeft(this.markerMin.nativeElement), this.getMaxCSSLeft(this.markerMax.nativeElement), 0, 1);
  }

  private getMidVal() {
    let left = this.getCSSLeft(this.markerMid.nativeElement)
    return General.mapInOut(left, this.getMinCSSLeft(this.markerMin.nativeElement), this.getMaxCSSLeft(this.markerMax.nativeElement), 0, 1);
  }

  private getMaxVal() {
    let left = this.getCSSLeft(this.markerMax.nativeElement)
    return General.mapInOut(left, this.getMinCSSLeft(this.markerMin.nativeElement), this.getMaxCSSLeft(this.markerMax.nativeElement), 0, 1);
  }

  private getMinCSSLeft(marker: HTMLElement) {
    let start
    if (marker == this.markerMax.nativeElement) start = this.getCSSLeft(this.markerMid.nativeElement)
    else if (marker == this.markerMid.nativeElement) start = this.getCSSLeft(this.markerMin.nativeElement)// - (this.getCSSWidth(this.movingMarker) / 2);
    else start = 0 - this.getCSSWidth(marker);
    return start + (this.getCSSWidth(marker) / 2);
  }

  private getMaxCSSLeft(marker: HTMLElement): number {
    let start
    if (marker == this.markerMin.nativeElement) start = this.getCSSLeft(this.markerMid.nativeElement)// - (this.getCSSWidth(this.movingMarker) / 2);
    else if (marker == this.markerMid.nativeElement) start = this.getCSSLeft(this.markerMax.nativeElement)// - (this.getCSSWidth(this.movingMarker) / 2);
    else start = this.getCSSWidth(this.container.nativeElement);
    return start - (this.getCSSWidth(marker) / 2);
  }

  private getCSSWidth(marker: HTMLElement): number {
    let border = parseInt(getComputedStyle(marker).borderWidth) * 2;
    return border + parseInt(getComputedStyle(marker).width.replace("px", ""));
  }

  private getCSSLeft(marker: HTMLElement): number {
    return parseInt(getComputedStyle(marker).left.replace("px", ""));
  }
}
