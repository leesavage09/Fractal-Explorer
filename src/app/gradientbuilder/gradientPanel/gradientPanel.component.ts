import { Component, OnInit, Output, ViewChild, ElementRef, EventEmitter, ComponentFactory, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { createElement } from '@angular/core/src/view/element';
import { StopMarkerComponent } from './stop-marker/stop-marker.component';
import { createComponent } from '@angular/compiler/src/core';

import { Color } from "../../../helper/helper.module";

@Component({
  selector: 'app-gradientpanel',
  templateUrl: './gradientPanel.component.html',
  styleUrls: ['./gradientPanel.component.scss']
})
export class GradientPanelComponent implements OnInit {
  @ViewChild('stopMarkers', { read: ViewContainerRef }) stopMarkers;
  @ViewChild('StopMarkerSlider') StopMarkerSlider: ElementRef;
  @ViewChild('colorActive') colorActive: ElementRef;
  @ViewChild('gradientDisplay') gradientDisplay: ElementRef;
  @Output() gradientChanged = new EventEmitter();

  public maxCSSleft

  private startMouseX: number;
  private factory: ComponentFactory<StopMarkerComponent>;
  private allMarkers: Array<StopMarkerComponent> = new Array();
  private selectedMarker: StopMarkerComponent;
  private activeMarker: StopMarkerComponent;
  private gradient: Color.LinearGradient

  constructor(r: ComponentFactoryResolver) {
    this.factory = r.resolveComponentFactory(StopMarkerComponent);
  }

  ngOnInit() {
    this.maxCSSleft = getComputedStyle(this.StopMarkerSlider.nativeElement).width.replace("px", "")
  }

  /*
  * Events
  */

  windowResized() {
    this.maxCSSleft = getComputedStyle(this.StopMarkerSlider.nativeElement).width.replace("px", "")
    this.allMarkers.forEach(marker => {
      marker.windowResized();
    });
  }

  createStopMarker(event) {
    event.stopPropagation();
    let componentRef: ComponentRef<StopMarkerComponent> = this.stopMarkers.createComponent(this.factory);
    componentRef.instance.regesterParent(this, componentRef)
    componentRef.instance.setCSSLeft(event.offsetX);
    this.allMarkers.push(componentRef.instance);
    this.setActiveMarker(componentRef.instance);
    this.createGradient();
  }

  move(event) {
    if (this.selectedMarker != undefined) {
      this.selectedMarker.offsetCSSLeft(event.screenX);
      this.createGradient();
    }
  }

  dropMarker() {
    this.selectedMarker = undefined;
  }

  setColorActive(event) {
    let rgb = Color.hexToRGB(event.target.value);
    this.activeMarker.setColor(rgb);
    this.createGradient();
  }

  deleteActive(event) {
    if (this.allMarkers.length <= 2) return;
    this.allMarkers.splice(this.allMarkers.lastIndexOf(this.activeMarker), 1);
    this.activeMarker.thisRef.destroy();
    this.setActiveMarker(this.allMarkers[0]);
    this.createGradient();
  }

  /*
  * Public Methods
  */

  setActiveMarker(marker: StopMarkerComponent) {
    if (this.activeMarker != undefined) this.activeMarker.styleActive(false);
    this.activeMarker = marker;
    this.activeMarker.styleActive(true);
    this.colorActive.nativeElement.value = Color.rgbToHex(this.activeMarker.getColor())
  }

  setSelectedMarker(marker: StopMarkerComponent, x) {
    if (this.selectedMarker == marker) this.selectedMarker = undefined
    else {
      this.startMouseX = x;
      this.selectedMarker = marker;
    }
  }

  private createGradient() {
    let gradient = new Array();
    this.allMarkers.forEach(marker => {
      gradient.push({ stop: marker.getStopValue(), color: marker.getColor() });
    });
    this.gradient = new Color.LinearGradient(gradient);

    let slider = this.gradientDisplay.nativeElement;
    let img = slider.getContext("2d").getImageData(0, 0, slider.width, 1);
    for (var i = 0; i < slider.width; ++i) {
      let percent = i / slider.width;
      let rgb = this.gradient.getColorAt(percent);
      img.data[(i * 4) + 0] = rgb.r;
      img.data[(i * 4) + 1] = rgb.g;
      img.data[(i * 4) + 2] = rgb.b;
      img.data[(i * 4) + 3] = 255;  //alphas
    }
    for (var i = 0; i < slider.height; ++i) {
      slider.getContext("2d").putImageData(img, 0, i);
    }

    this.gradientChanged.emit(this.gradient);
  }

}
