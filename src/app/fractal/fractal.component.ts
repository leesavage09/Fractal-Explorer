import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";

import { Fractals, MaxZoomListner } from "../../fractal/fractal.module";
import { FractalEquations } from "../../fractal/fractalEquations.module"
import { CompiledStylesheet } from "@angular/compiler";
import { error } from "util";
import { ComplexNumber } from "../../fractal/complexNumbers";
import { ColoursliderComponent } from "../colourslider/colourslider.component";
import { GradientbuilderComponent } from '../gradientbuilder/gradientbuilder.component';

import { Color } from "../../helper/helper.module";

@Component({
  selector: "FractalComponent",
  templateUrl: "./fractal.component.html",
  styleUrls: ["./fractalThemes.component.scss"]
})
export class FractalComponent implements OnInit, MaxZoomListner {
  @Input() width: string;
  @Input() height: string;
  @Input() equation: string;
  @Input() theme: string;
  @Input() color: string;
  @Input() iterations: number = 30;
  @Input() gradientPhase: number = 0;
  @Input() gradientFreq: number = 1;
  @Input() complexCenter: string;
  @Input() complexWidth: string;
  @ViewChild('explorer') HTMLexplorer: ElementRef;
  @ViewChild('fractal') HTMLfractal: ElementRef;
  @ViewChild('alert') HTMLalert: ElementRef;
  @ViewChild('iterationControls') HTMLiterationControls: ElementRef;
  @ViewChild('colorControls') HTMLcolorControls: ElementRef;
  @ViewChild('zoomControls') HTMLzoomControls: ElementRef;
  @ViewChild('fullScreenControls') HTMLfullScreenControls: ElementRef;
  @ViewChild('eyeControls') HTMLeyeControls: ElementRef;
  @ViewChild('colourSelect') HTMLcolourSelect: ElementRef;
  @ViewChild('gradientSlider') HTMLgradientSlider: ColoursliderComponent;
  @ViewChild('gradientBuilder') HTMLgradientBuilder: ElementRef;
  @ViewChild('appGradientBuilder') HTMLappGradientBuilder: GradientbuilderComponent;

  private explorerWindowStyle: string;
  private fractal: Fractals.Fractal;
  private explorerWindowIsMaximised: boolean = false;
  private iterationsAreChanging: boolean = false;
  private zoomGestureHappening: boolean = false;
  private static readonly htmlClassForFaEyeOpen: string = "fa fa-eye"
  private static readonly htmlClassForFaEyeClosed: string = "fa fa-eye-slash"

  alertText: string;
  readonly colorBW: string = "rp:0,gp:0,bp:0,rf:1,gf:1,bf:1,rw:127,gw:127,bw:127,rc:128,gc:128,bc:128";
  readonly colorRainbow: string = "rp:50,gp:91,bp:18,rf:1,gf:1,bf:1,rw:127,gw:127,bw:127,rc:128,gc:128,bc:128";
  readonly colorBlueGold: string = "rp:45,gp:45,bp:0,rf:1,gf:1,bf:1,rw:127,gw:87,bw:127,rc:128,gc:87,bc:128";
  constructor() { }

  ngOnInit() {
    if (this.width != undefined) this.HTMLexplorer.nativeElement.style.width = this.width.toString();
    if (this.height != undefined) this.HTMLexplorer.nativeElement.style.height = this.height.toString();

    let complexCenter = new ComplexNumber(-0.8, 0);
    if (this.complexCenter != undefined) {
      let centerArr = this.complexCenter.split(",");
      let centerR = parseFloat(centerArr[0]);
      let centerI = parseFloat(centerArr[1]);
      complexCenter = new ComplexNumber(centerR, centerI);
    }

    let complexWidth = 3;
    if (this.complexWidth != undefined) {
      complexWidth = parseFloat(this.complexWidth);
    }

    let colorCommandString = this.colorBW;
    if (this.color != undefined) {
      if (this.color == "rainbow") {
        colorCommandString = this.colorRainbow;
        this.HTMLcolourSelect.nativeElement.value = this.colorRainbow;
      }
      if (this.color == "blue/gold") {
        colorCommandString = this.colorBlueGold;
        this.HTMLcolourSelect.nativeElement.value = this.colorBlueGold;
      }
    }

    let fractalEq = FractalEquations.mandelbrot;
    if (this.equation != undefined) {
      if (this.equation == "burningShip") {
        fractalEq = FractalEquations.burningShip;
      }
    }

    let canvas = <HTMLCanvasElement>this.HTMLfractal.nativeElement;
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    let htmlCanvas: HTMLCanvasElement = ctx.canvas;
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;

    let gradient = new Color.LinearGradient([new Color.LinearGradientStop(0, new Color.RGBcolor(0, 0, 0)), new Color.LinearGradientStop(0.9999999999999999, new Color.RGBcolor(255, 255, 255)), new Color.LinearGradientStop(1, new Color.RGBcolor(0, 0, 0))]);
    this.HTMLgradientSlider.color = gradient;
    this.fractal = new Fractals.Fractal(new Fractals.ComplexPlain(complexCenter.r, complexCenter.i, complexWidth, canvas), fractalEq, gradient);
    this.fractal.iterations = this.iterations;
    this.fractal.setMaxZoomListener(this);
    this.changeColor(colorCommandString);
    this.fractal.render();
  }

  /*
  * User triggerable functions \/
  */

  windowResized() {
    let d = <any>document;
    var fullscreenElement = d.fullscreenElement || d.mozFullScreenElement || d.webkitFullscreenElement || d.msFullscreenElement;
    if (fullscreenElement == undefined && this.explorerWindowIsMaximised) {
      this.toggelFullScreen()
    }
    else if (this.explorerWindowIsMaximised) {
      this.fullScreenWindow();
    }
  }

  /*
  * Mouse wheel and trackpad events
  */
  wheel(event) {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.fractal.getAnimator().zoomStart(event.offsetX, event.offsetY, 1.4, 200);
    }
    else if (event.deltaY > 0) {
      this.fractal.getAnimator().zoomStart(event.offsetX, event.offsetY, 0.6, 200);
    }
  }

  /*
  * Touch Screen Events
  */
  touchStartDrag(event) {
    event.preventDefault();
    event = this.addTocuchOffsets(event);
    if (event.touches.length === 2) {
      this.fractal.getAnimator().dragEnd(event.offsetX, event.offsetY, false);
      this.zoomGestureHappening = true;
      //this.fractal.getAnimator().dragCancel();
      var dist = Math.abs(Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY));
      let minX = Math.min(event.touches[0].clientX, event.touches[1].clientX);
      let minY = Math.min(event.touches[0].clientY, event.touches[1].clientY);
      let centerX = minX + (Math.abs(event.touches[0].clientX - event.touches[1].clientX) / 2);
      let centerY = minY + (Math.abs(event.touches[0].clientY - event.touches[1].clientY) / 2);
      var realTarget = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
      centerX = centerX - (<any>realTarget.getBoundingClientRect()).left;
      centerY = centerY - (<any>realTarget.getBoundingClientRect()).top;
      this.fractal.getAnimator().zoomByScaleStart(dist, centerX, centerY)
    }
    else {
      this.startDrag(event)
    }
  }

  touchMove(event) {
    event.preventDefault();
    if (this.zoomGestureHappening) {
      var dist = Math.abs(Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY));
      this.fractal.getAnimator().zoomByScale(dist);
      return;
    }
    event = this.addTocuchOffsets(event);
    if (document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY) === this.HTMLfractal.nativeElement) {
      this.mouseMove(event);
      return;
    }
    this.endDrag(event);
  }

  touchEndDrag(event) {
    event.preventDefault();
    if (this.zoomGestureHappening) {
      this.zoomGestureHappening = false;
      this.fractal.getAnimator().zoomByScaleEnd();
    }
    else {
      event = this.addTocuchOffsets(event);
      this.endDrag(event);
    }

  }

  /*
  * Mouse pointer events
  */
  startDrag(event) {
    this.removeAllSelections();
    this.fractal.getAnimator().dragStart(event.offsetX, event.offsetY);
  }

  endDrag(event) {
    this.fractal.getAnimator().dragEnd(event.offsetX, event.offsetY);
  }

  mouseMove(event) {
    this.fractal.getAnimator().dragMove(event.offsetX, event.offsetY);
  }

  /*
  * Form and button events
  */
  toggleColourMenu(event) {

  }

  openGradientBuilder() {
    this.HTMLgradientBuilder.nativeElement.style.visibility = "visible";
    let c = <HTMLCanvasElement>this.HTMLfractal.nativeElement;
    this.HTMLappGradientBuilder.canvas = c;
  }

  closeGradientBuilder() {
    if (getComputedStyle(this.HTMLgradientBuilder.nativeElement).visibility == "visible") {
      this.HTMLgradientBuilder.nativeElement.style.visibility = "hidden";
      this.HTMLexplorer.nativeElement.appendChild(this.HTMLfractal.nativeElement);
      this.canvasSizeChanged()
      return;
    }
  }

  gradientChanged(event) {
    this.fractal.color = event;
    this.fractal.render();
  }

  onColorChanged(event) {
    this.changeColor(event.target.value);
    this.fractal.render();
  }

  closeAlert(event) {
    if (getComputedStyle(this.HTMLalert.nativeElement).visibility == "visible") {
      this.HTMLalert.nativeElement.style.visibility = "hidden";
      return;
    }
  }

  startChangingIterations(i) {
    if (this.iterationsAreChanging) return;
    this.changingIterations(i);
  }

  stopChangingIterations() {
    this.iterationsAreChanging = false;
  }

  zoomOutClick(event) {
    let canvas = <HTMLCanvasElement>this.HTMLfractal.nativeElement;
    this.fractal.getAnimator().zoomStart(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 0.5, 200);
  }

  zoomInClick(event) {
    let canvas = <HTMLCanvasElement>this.HTMLfractal.nativeElement;
    this.fractal.getAnimator().zoomStart(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 2, 200);
  }

  toggelEye() {
    if (this.HTMLeyeControls.nativeElement.className == FractalComponent.htmlClassForFaEyeOpen) {
      this.HTMLeyeControls.nativeElement.className = FractalComponent.htmlClassForFaEyeClosed;
      this.HTMLfullScreenControls.nativeElement.style.visibility = "visible";
      this.HTMLzoomControls.nativeElement.style.visibility = "visible";
      this.HTMLcolorControls.nativeElement.style.visibility = "visible";
      this.HTMLiterationControls.nativeElement.style.visibility = "visible";
    }
    else {
      this.HTMLeyeControls.nativeElement.className = FractalComponent.htmlClassForFaEyeOpen;
      this.HTMLfullScreenControls.nativeElement.style.visibility = "hidden";
      this.HTMLzoomControls.nativeElement.style.visibility = "hidden";
      this.HTMLcolorControls.nativeElement.style.visibility = "hidden";
      this.HTMLiterationControls.nativeElement.style.visibility = "hidden";
    }
  }

  toggelFullScreen() {
    let div = <HTMLDivElement>this.HTMLexplorer.nativeElement;

    if (this.explorerWindowIsMaximised) {
      this.explorerWindowIsMaximised = false;
      this.exitNativeFullScreen()
      div.setAttribute("style", this.explorerWindowStyle);
      this.canvasSizeChanged();

    } else {
      this.explorerWindowIsMaximised = true;
      this.requestNativeFullScreen();
      this.explorerWindowStyle = div.getAttribute("style");
      this.fullScreenWindow();
    }
  }

  gradientFreqChange(val) {
    this.fractal.color.setFrequency(this.fractal.color.getFrequency()+val);
  }

  gradientPhaseChange(event) {
    this.fractal.color = event;
    this.fractal.render();
  }

  /*
  * Callbacks from fractal explorer
  */
  maxZoomReached() {
    this.fractal.deleteMaxZoomListener();
    this.alertText = "You have reached the max zoom, What you can see are floting point errors as the diffrences between the numbers are so small!";
    this.HTMLalert.nativeElement.style.visibility = "visible";
  }

  /*
  * Helper Functions \/
  */

  private changingIterations(i) {
    var self = this;
    this.iterationsAreChanging = true;
    this.fractal.stopRendering();
    setTimeout(function () {
      if (!self.iterationsAreChanging) return;

      if (i > 1) {
        self.iterations = Math.ceil(self.iterations * i)
      } else {
        self.iterations = Math.floor(self.iterations * i)
      }

      if (self.iterations < 1) {
        self.iterations = 1;
        self.iterationsAreChanging = false;
      }
      self.iterationsChanged();

      self.changingIterations(i);
    }, 100);
  }

  private requestNativeFullScreen() {
    let body = <any>document.body;
    let requestMethod = body.requestFullScreen || body.webkitRequestFullScreen || body.mozRequestFullScreen || body.msRequestFullScreen;
    if (requestMethod) {
      requestMethod.call(body);
    }
  }

  private exitNativeFullScreen() {
    let doc = <any>document;
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  }

  iterationsChanged() {
    this.fractal.iterations = this.iterations;
    this.fractal.render();
  }

  private fullScreenWindow() {
    let explorerDiv = <HTMLDivElement>this.HTMLexplorer.nativeElement;
    explorerDiv.setAttribute("style", "position: fixed; top: 0px; left: 0px; border: none; z-index: 9999;");
    explorerDiv.style.width = window.innerWidth.toString() + "px";
    explorerDiv.style.height = window.innerHeight.toString() + "px";
    this.canvasSizeChanged();
  }

  private canvasSizeChanged() {
    let canvas = <HTMLCanvasElement>this.HTMLfractal.nativeElement;
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;
    let cp = this.fractal.complexPlain;
    cp.replaceView(cp.getSquare().center.r, cp.getSquare().center.i, cp.getSquare().width, canvas);
    this.fractal.render();
  }

  private changeColor(commandString: string) {
    console.log("NOT YET IMPLEMENTED");
    //this.fractal.color.changeColor(commandString);
    //this.HTMLgradientSlider.color = this.fractal.color;
  }

  private addTocuchOffsets(event) {
    var touch = event.touches[0] || event.changedTouches[0];
    event.offsetX = touch.clientX - (<any>this.HTMLfractal.nativeElement.getBoundingClientRect()).left;
    event.offsetY = touch.clientY - (<any>this.HTMLfractal.nativeElement.getBoundingClientRect()).top;
    return event;
  }

  private removeAllSelections() {
    let doc = <any>document;
    if (doc.selection) {
      doc.selection.empty();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  }

}
