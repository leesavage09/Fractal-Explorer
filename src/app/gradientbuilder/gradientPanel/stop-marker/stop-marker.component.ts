import { Component, OnInit, ComponentFactoryResolver, ComponentRef, ElementRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { General } from "../../../../helper/helper.module";

import { GradientPanelComponent } from '../gradientPanel.component';
import { Color } from "../../../../helper/helper.module";

@Component({
  selector: 'app-stop-marker',
  templateUrl: './stop-marker.component.html',
  styleUrls: ['./stop-marker.component.scss']
})
export class StopMarkerComponent {
  @ViewChild('marker') stopMarkers: ElementRef;
  public thisRef: ComponentRef<StopMarkerComponent>;
  private lastCSSLeft: number;
  private stopValue: number;
  private parent: GradientPanelComponent;
  private lastMouseX: number
  private color: Color.RGBcolor = { r: Math.round(Math.random() * 255), g: Math.round(Math.random() * 255), b: Math.round(Math.random() * 255) };
  constructor() { }


  ngOnInit() {
    this.setColor(this.color);
  }

  /*
  * Events
  */

  select(event): void {
    event.stopPropagation();
    this.lastMouseX = event.screenX;
    this.lastCSSLeft = this.getCSSLeft();
    this.parent.setSelectedMarker(this, event.screenX);
    this.parent.setActiveMarker(this);
  }

  removeSelect(event): void {
    event.stopPropagation();
    this.parent.dropMarker();
  }

  windowResized() {
    let cssLeft = General.mapInOut(this.stopValue, 0, 1, this.getMinCSSLeft(), this.getMaxCSSLeft());
    this.setCSSLeft(cssLeft);
  }

  /*
  * Public Methods
  */

  offsetCSSLeft(x: number) {
    let newCSSleft = x - this.lastMouseX + this.lastCSSLeft;
    this.setCSSLeft(newCSSleft);
  }

  setCSSLeft(x: number) {
    let maxLeft = this.getMaxCSSLeft();
    let minLeft = this.getMinCSSLeft();
    if (x >= maxLeft) x = maxLeft;
    if (x <= minLeft) x = minLeft;

    this.stopMarkers.nativeElement.style.left = x.toString() + "px";
    let cssLeft = this.getCSSLeft() + this.getCSSWidth() / 2;
    this.stopValue = General.mapInOut(cssLeft, 0, this.parent.maxCSSleft, 0, 1);
  }

  regesterParent(parent, componentRef): void {
    this.thisRef = componentRef;
    this.parent = parent;
  }

  styleActive(flag: boolean) {
    if (flag) {
      this.stopMarkers.nativeElement.style.borderWidth = "2px"
    }
    else {
      this.stopMarkers.nativeElement.style.borderWidth = "0px"
    }
  }

  getStopValue(): number {
    return this.stopValue;
  }

  setColor(rgb: { r: number, g: number, b: number }) {
    this.color = rgb;
    this.stopMarkers.nativeElement.style.backgroundColor = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")"
  }

  getColor(): { r: number, g: number, b: number } {
    return this.color;
  }

  /*
  * Private Methods
  */

  private getCSSLeft(): number {
    return parseInt(this.stopMarkers.nativeElement.style.left.replace("px", ""));
  }

  private getCSSWidth(): number {
    let border = parseInt(getComputedStyle(this.stopMarkers.nativeElement).borderWidth) * 2;
    return border + parseInt(getComputedStyle(this.stopMarkers.nativeElement).width.replace("px", ""));
  }

  private getMaxCSSLeft(): number {
    return this.parent.maxCSSleft - Math.round(this.getCSSWidth() / 2)
  }

  private getMinCSSLeft(): number {
    return 0 - Math.round(this.getCSSWidth() / 2)
  }

}