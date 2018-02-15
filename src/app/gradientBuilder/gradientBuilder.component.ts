import { Component, OnInit, Output, ViewChild, ElementRef, EventEmitter, ComponentFactory, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { createElement } from '@angular/core/src/view/element';
import { StopMarkerComponent } from './stop-marker/stop-marker.component';
import { createComponent } from '@angular/compiler/src/core';

import { FractalColor } from "../../fractal/fractalColouring";
import { General } from "../../helper/helper.module";

@Component({
  selector: 'app-gradientbuilder',
  templateUrl: './gradientBuilder.component.html',
  styleUrls: ['./gradientBuilder.component.scss']
})
export class GradientBuilderComponent implements OnInit, FractalColor.LinearGradientObserver {
  @ViewChild('stopMarkers', { read: ViewContainerRef }) stopMarkers;
  @ViewChild('StopMarkerSlider') StopMarkerSlider: ElementRef;
  @ViewChild('colorActive') colorActive: ElementRef;
  @ViewChild('gradientDisplay') gradientDisplay: ElementRef;
  @ViewChild('gradientDisplayContainer') gradientDisplayContainer: ElementRef;
  private jscolor = (<any>document.getElementById('jscolor'));

  public maxCSSleft

  private startMouseX: number;
  private factory: ComponentFactory<StopMarkerComponent>;
  private allMarkers: Array<StopMarkerComponent> = new Array();
  private selectedMarker: StopMarkerComponent;
  private activeMarker: StopMarkerComponent;
  private gradient: FractalColor.LinearGradient = null;
  private gradientDisplayMoving: boolean = false;

  constructor(r: ComponentFactoryResolver) {
    this.factory = r.resolveComponentFactory(StopMarkerComponent);
  }

  ngOnInit() {
    this.windowResized();
  }

  /*
  * Events
  */

  linearGradientChanged() {
    this.drawGradient();
  }

  windowResized() {
    if (this.gradient == undefined) return;
    General.resizeCanvasToFillParent(this.gradientDisplay.nativeElement);
    this.maxCSSleft = parseInt(getComputedStyle(this.StopMarkerSlider.nativeElement).width.replace("px", ""))
    this.allMarkers.forEach(marker => {
      marker.windowResized();
    });
    this.drawGradient();
  }

  createStopMarker(event) {
    event.stopPropagation();
    this.addStopMarker(null, event.offsetX, null)
    this.gradient.notify(this);
  }

  touchMove(event) {
    event.clientY = event.targetTouches[0].clientY
    event.screenX = event.targetTouches[0].screenX
    this.move(event);
  }

  move(event) {
    if (this.selectedMarker != undefined) {
      let offsetY = Math.abs(this.selectedMarker.getScreenY() - event.clientY)
      if (offsetY > 25 && this.allMarkers.length > 1) {
        this.deleteMarker(this.selectedMarker);
        this.selectedMarker = undefined;
      }
      else {
        this.selectedMarker.offsetCSSLeft(event.screenX);
      }
      this.draw();
      this.gradient.notify(this);
    }
  }

  setColorActive(event) {
    let rgb = FractalColor.hexToRGB(this.jscolor.jscolor.toHEXString())//event.target.value);
    this.activeMarker.setColor(rgb);
    this.draw();
    this.gradient.notify(this);
  }




  /*
  * Public Methods
  */


  dropMarker() {
    this.selectedMarker = undefined;
  }

  addStopMarker(stop: number, cssLeft: number, color: FractalColor.RGBcolor, draw: boolean = true) {
    let componentRef: ComponentRef<StopMarkerComponent> = this.stopMarkers.createComponent(this.factory);
    componentRef.instance.regesterParent(this, componentRef)
    if (cssLeft != null) componentRef.instance.setCSSLeft(cssLeft);
    else if (stop != null) componentRef.instance.setStopValue(stop);
    if (color) componentRef.instance.setColor(color);
    this.allMarkers.push(componentRef.instance);
    this.setActiveMarker(componentRef.instance);
    if (draw) this.draw();

  }

  setGradient(g: FractalColor.LinearGradient) {
    if (this.gradient != null) this.gradient.unsubscribe(this)
    this.gradient = g;
    if (this.gradient != null) this.gradient.subscribe(this)
    this.windowResized();
  }

  setActiveMarker(marker: StopMarkerComponent) {
    if (this.activeMarker != undefined) this.activeMarker.styleActive(false);
    this.activeMarker = marker;
    this.activeMarker.styleActive(true);
    if (this.jscolor.jscolor != undefined) this.jscolor.jscolor.fromRGB(this.activeMarker.getColor().r, this.activeMarker.getColor().g, this.activeMarker.getColor().b);
  }

  setSelectedMarker(marker: StopMarkerComponent, x) {
    this.selectedMarker = marker
  }

  deleteAllMarkers() {
    for (let index = 0; index < this.allMarkers.length; index++) {
      const marker = this.allMarkers[index];
      marker.thisRef.destroy();
    }
    this.allMarkers = new Array()
  }

  deleteMarker(marker: StopMarkerComponent) {
    this.allMarkers.splice(this.allMarkers.lastIndexOf(marker), 1);
    marker.thisRef.destroy();
  }

  /*
  * Private
  */

  private draw() {
    let gradient = new Array();
    this.allMarkers.forEach(marker => {
      gradient.push({ stop: marker.getStopValue(), color: marker.getColor() });
    });
    this.gradient.replaceAllStops(gradient);

    let slider = this.gradientDisplay.nativeElement;
    let img = slider.getContext("2d").getImageData(0, 0, slider.width, 1);
    for (var i = 0; i < slider.width; ++i) {
      let percent = i / slider.width;
      let rgb = this.gradient.getColorAt(percent, { min: 0, mid: 0.5, max: 1 }, 1, 0);
      img.data[(i * 4) + 0] = rgb.r;
      img.data[(i * 4) + 1] = rgb.g;
      img.data[(i * 4) + 2] = rgb.b;
      img.data[(i * 4) + 3] = 255;  //alphas
    }
    for (var i = 0; i < slider.height; ++i) {
      slider.getContext("2d").putImageData(img, 0, i);
    }

  }

  private drawGradient() {
    this.deleteAllMarkers()

    let arr: Array<FractalColor.LinearGradientStop> = this.gradient.getStops()
    for (let i = 0; i < arr.length; i++) {
      const stop = arr[i];
      let offset = General.mapInOut(stop.stop, 0, 1, 0, this.maxCSSleft);
      this.addStopMarker(stop.stop, null, stop.color, false);
    }
    this.draw();
  }

}