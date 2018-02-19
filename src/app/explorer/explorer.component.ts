import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";

import { Fractals } from "../../fractal/fractal.module";
import { FractalEquations } from "../../fractal/fractalEquations.module"
import { CompiledStylesheet } from "@angular/compiler";
import { error } from "util";
import { ComplexNumber } from "../../fractal/complexNumbers";
import { ColoursliderComponent } from "../histogram/colourslider/colourslider.component";
import { FractalColor } from "../../fractal/fractalColouring";
import { GradientBuilderComponent } from '../gradientBuilder/gradientBuilder.component';
import { HistogramComponent } from "../histogram/histogram.component";

@Component({
  selector: "ExplorerComponent",
  templateUrl: "./explorer.component.html",
  styleUrls: ["./explorerThemes.component.scss"]
})
export class ExplorerComponent implements OnInit, Fractals.MaxZoomListner {
  @Input() width: string;
  @Input() height: string;
  @Input() equation: string;
  @Input() theme: string;
  @Input() color: string;
  @Input() iterations: number = 50;
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
  @ViewChild('gradientBuilder') HTMLgradientBuilder: ElementRef;
  @ViewChild('jscolor') HTMLjscolor: ElementRef;
  @ViewChild('histogram') HTMLhistogram: HistogramComponent;
  @ViewChild('gradient') HTMLgradient: GradientBuilderComponent;
  @ViewChild('colorPullDown') HTMLcolorPullDown: ElementRef;
  @ViewChild('histogramdiv') HTMLhistogramdiv: ElementRef;
  @ViewChild('gradientdiv') HTMLgradientdiv: ElementRef;
  @ViewChild('colorPullDownCaret1') HTMLcolorPullDownCaret1: ElementRef;
  @ViewChild('colorPullDownCaret2') HTMLcolorPullDownCaret2: ElementRef;

  private explorerCSSHeight;
  private explorerWindowStyle: string;
  private jscolorWindowStyle: string;
  private fractal: Fractals.Fractal;
  private explorerWindowIsMaximised: boolean = false;
  private iterationsAreChanging: boolean = false;
  private zoomGestureHappening: boolean = false;
  private static readonly htmlClassForFaEyeOpen: string = "fa fa-eye"
  private static readonly htmlClassForFaEyeClosed: string = "fa fa-eye-slash"

  alertText: string;
  readonly colorBW: string = '{"phase":0,"frequency":1,"arr":[{"stop":0,"color":{"r":0,"g":0,"b":0}},{"stop":1,"color":{"r":255,"g":255,"b":255}}]}'
  readonly colorRainbow: string = '{"phase":0,"frequency":1,"arr":[{"stop":0,"color":{"r":255,"g":0,"b":0}},{"stop":0.166,"color":{"r":255,"g":100,"b":0}},{"stop":0.332,"color":{"r":249,"g":255,"b":0}},{"stop":0.498,"color":{"r":0,"g":255,"b":13}},{"stop":0.664,"color":{"r":0,"g":67,"b":255}},{"stop":0.830,"color":{"r":133,"g":0,"b":255}},{"stop":1,"color":{"r":255,"g":0,"b":215}}]}'
  readonly colorBlueGold: string = '{"phase":0,"frequency":1,"arr":[{"stop":0,"color":{"r":0,"g":51,"b":255}},{"stop":0.8041666666666667,"color":{"r":255,"g":200,"b":0}},{"stop":1,"color":{"r":255,"g":115,"b":0}}]}';
  constructor() { }

  ngOnInit() {
    this.explorerCSSHeight = getComputedStyle(this.HTMLexplorer.nativeElement).height;

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

    let colorCommandString = this.colorBlueGold;
    if (this.color != undefined) {
      if (this.color == "rainbow") {
        colorCommandString = this.colorRainbow;
        this.HTMLcolourSelect.nativeElement.value = this.colorRainbow;
      }
      if (this.color == "B/W") {
        colorCommandString = this.colorBW;
        this.HTMLcolourSelect.nativeElement.value = this.colorBW;
      }
    }

    let fractalEq = FractalEquations.smoothMandelbrot;
    // if (this.equation != undefined) {
    //   if (this.equation == "burningShip") {
    //     fractalEq = FractalEquations.burningShip;
    //   }
    // }

    let canvas = <HTMLCanvasElement>this.HTMLfractal.nativeElement;
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    let htmlCanvas: HTMLCanvasElement = ctx.canvas;
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;

    let gradient = new FractalColor.LinearGradient();
    gradient.decodeJSON(colorCommandString)

    this.fractal = new Fractals.Fractal(new Fractals.ComplexPlain(complexCenter.r, complexCenter.i, complexWidth, canvas), fractalEq, gradient);
    this.fractal.iterations = this.iterations;
    this.fractal.setMaxZoomListener(this);
    this.fractal.render();

    this.explorerWindowIsMaximised = true;
    this.fullScreenWindow()
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

  toggleColorPullDown(event) {
    if (this.HTMLhistogramdiv.nativeElement.style.display == "block") {
      this.HTMLgradient.setGradient(null);
      this.HTMLhistogram.setFractal(null);
      this.HTMLcolorPullDown.nativeElement.style.height = 0;
      this.HTMLhistogramdiv.nativeElement.style.display = "none";
      this.HTMLgradientdiv.nativeElement.style.display = "none";
      this.HTMLcolorPullDownCaret1.nativeElement.setAttribute("class", "fa fa-caret-down");
      this.HTMLcolorPullDownCaret2.nativeElement.setAttribute("class", "fa fa-caret-down");

    } else {
      this.HTMLcolorPullDown.nativeElement.style.height = this.explorerCSSHeight;
      this.HTMLhistogramdiv.nativeElement.style.display = "block";
      this.HTMLgradientdiv.nativeElement.style.display = "block";
      this.HTMLgradient.setGradient(this.fractal.getColor());
      this.HTMLhistogram.setFractal(this.fractal);
      this.HTMLcolorPullDownCaret1.nativeElement.setAttribute("class", "fa fa-caret-up");
      this.HTMLcolorPullDownCaret2.nativeElement.setAttribute("class", "fa fa-caret-up");
    }
    this.explorerSizeChanged();
  }

  onEqChanged(event) {
    let eqString = event.target.value;
    if (eqString == "smoothMandelbrot") {
      this.fractal.complexPlain.replaceView(-0.8,0,3,<HTMLCanvasElement>this.HTMLfractal.nativeElement)
      this.fractal.setCalculationFunction(FractalEquations.smoothMandelbrot);
    } 
    else if (eqString == "smoothBurningShip") {
      this.fractal.complexPlain.replaceView(-0.5,-0.5,3,<HTMLCanvasElement>this.HTMLfractal.nativeElement)
      this.fractal.setCalculationFunction(FractalEquations.smoothBurningShip);
    }
    else if (eqString == "smoothJulia") {
      this.fractal.complexPlain.replaceView(0,0,3,<HTMLCanvasElement>this.HTMLfractal.nativeElement)
      this.fractal.setCalculationFunction(FractalEquations.smoothJulia);
    }
    this.fractal.render();
  }

  onColorChanged(event) {
    this.fractal.getColor().decodeJSON(event.target.value);
    this.fractal.getColor().notify(null);
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
    if (this.HTMLeyeControls.nativeElement.className == ExplorerComponent.htmlClassForFaEyeOpen) {
      this.HTMLeyeControls.nativeElement.className = ExplorerComponent.htmlClassForFaEyeClosed;
      this.HTMLfullScreenControls.nativeElement.style.visibility = "visible";
      this.HTMLzoomControls.nativeElement.style.visibility = "visible";
      this.HTMLcolorControls.nativeElement.style.visibility = "visible";
      this.HTMLiterationControls.nativeElement.style.visibility = "visible";
    }
    else {
      this.HTMLeyeControls.nativeElement.className = ExplorerComponent.htmlClassForFaEyeOpen;
      this.HTMLfullScreenControls.nativeElement.style.visibility = "hidden";
      this.HTMLzoomControls.nativeElement.style.visibility = "hidden";
      this.HTMLcolorControls.nativeElement.style.visibility = "hidden";
      this.HTMLiterationControls.nativeElement.style.visibility = "hidden";
    }
  }

  toggelFullScreen() {
    let explorerDiv = <HTMLDivElement>this.HTMLexplorer.nativeElement;
    let jscolorDiv = <HTMLDivElement>this.HTMLjscolor.nativeElement;

    if (this.explorerWindowIsMaximised) {
      this.explorerWindowIsMaximised = false;
      this.exitNativeFullScreen()
      jscolorDiv.setAttribute("style", this.jscolorWindowStyle);
      explorerDiv.setAttribute("style", this.explorerWindowStyle);
      this.explorerSizeChanged();
    }
    else {
      this.explorerWindowIsMaximised = true;
      this.requestNativeFullScreen();
      this.jscolorWindowStyle = jscolorDiv.getAttribute("style");
      this.explorerWindowStyle = explorerDiv.getAttribute("style");
      this.fullScreenWindow();
    }
  }

  gradientFreqChange(val) {
    this.fractal.getColor().setFrequency(this.fractal.getColor().getFrequency() + val);
    this.fractal.getColor().notify(null);
  }

  iterationsChanged() {
    this.fractal.iterations = this.iterations;
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
  * Private Functions \/
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


  private fullScreenWindow() {
    let explorerDiv = <HTMLDivElement>this.HTMLexplorer.nativeElement;
    let jscolorDiv = <HTMLDivElement>this.HTMLjscolor.nativeElement;
    let windowWidth = window.innerWidth
    let windowHeight = window.innerHeight
    let jscolorLeft = windowWidth / 2 - 308 / 2;
    let jscolorTop = windowHeight / 2 - 210 / 2;

    explorerDiv.setAttribute("style", "position: fixed; top: 0px; left: 0px; border: none; z-index: 999;");
    explorerDiv.style.width = windowWidth.toString() + "px";
    explorerDiv.style.height = windowHeight.toString() + "px";

    jscolorDiv.style.top = jscolorTop.toString() + "px";
    jscolorDiv.style.left = jscolorLeft.toString() + "px";
    this.explorerSizeChanged();
  }

  private explorerSizeChanged() {
    let canvas = <HTMLCanvasElement>this.HTMLfractal.nativeElement;
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;
    let cp = this.fractal.complexPlain;
    cp.replaceView(cp.getSquare().center.r, cp.getSquare().center.i, cp.getSquare().width, canvas);
    this.fractal.render();

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
