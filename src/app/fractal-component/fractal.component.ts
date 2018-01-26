import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";

import { Fractals, MaxZoomListner } from "../../fractal/fractal.module";
import { FractalEquations } from "../../fractal/fractalEquations.module"
import { CompiledStylesheet } from "@angular/compiler";
import { error } from "util";
import { ComplexNumber } from "../../fractal/complexNumbers";

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

  private explorerWindowStyle: string;

  private fractal: Fractals.Fractal;
  //private fractalNavigator: Fractals.Fractal;

  private explorerWindowIsMaximised: boolean = false;
  private iterationsAreChanging: boolean = false;
  private zoomGestureHappening: boolean = false;

  private static readonly htmlClassForFaEyeOpen: string = "fa fa-eye"
  private static readonly htmlClassForFaEyeClosed: string = "fa fa-eye-slash"

  alertText: string;
  colorBW: string = "rp:0,gp:0,bp:0,rf:1,gf:1,bf:1,rw:127,gw:127,bw:127,rc:128,gc:128,bc:128";
  colorRainbow: string = "rp:50,gp:91,bp:18,rf:1,gf:1,bf:1,rw:127,gw:127,bw:127,rc:128,gc:128,bc:128";
  colorBlueGold: string = "rp:45,gp:45,bp:0,rf:1,gf:1,bf:1,rw:127,gw:87,bw:127,rc:128,gc:87,bc:128";
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
    this.fractal = new Fractals.Fractal(new Fractals.ComplexPlain(complexCenter.r, complexCenter.i, complexWidth, canvas), fractalEq);
    this.fractal.iterations = this.iterations;
    this.fractal.setMaxZoomListener(this);
    this.changeColor(colorCommandString);
    this.fractal.render();
    /*
        canvas = <HTMLCanvasElement>document.getElementById(NewComponentComponent.htmlIdForNavigator);
        ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
        ctx.canvas.width = canvas.offsetWidth;
        ctx.canvas.height = canvas.offsetHeight;
        this.fractalNavigator = new Fractals.Fractal(new Fractals.ComplexPlain(-0.8, 0, 3, canvas), FractalEquations.mandelbrot);
        this.fractalNavigator.iterations = this.iterations = 30;
        this.fractalNavigator.render();*/
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

  wheel(event) {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.fractal.getAnimator().zoomStart(event.offsetX, event.offsetY, 1.4, 200);
    }
    else if (event.deltaY > 0) {
      this.fractal.getAnimator().zoomStart(event.offsetX, event.offsetY, 0.6, 200);
    }
  }

  touchStartDrag(event) {
    event.preventDefault();
    if (event.touches.length === 2) {
      this.zoomGestureHappening = true;
      this.fractal.getAnimator().dragCancel();
      this.zoomGestureStart(event);
    }
    else {
      event = this.addTocuchOffsets(event);
      this.startDrag(event)
    }
  }

  touchMove(event) {
    event.preventDefault();
    if (this.zoomGestureHappening) {
      this.zoomGestureMove(event);
    }
    else {
      event = this.addTocuchOffsets(event);
      if (document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY) === this.HTMLfractal.nativeElement) {
        this.mouseMove(event);
      }
      else {
        this.endDrag(event);
      }
    }
  }

  touchEndDrag(event) {
    event.preventDefault();
    if (this.zoomGestureHappening) {
      this.zoomGestureHappening = false;
      this.zoomGestureEnd(event);
    }
    else {
      event = this.addTocuchOffsets(event);
      this.endDrag(event);
    }
  }

  private zoomGestureStart(event) {
    var dist = Math.abs(Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY));
    let minX = Math.min(event.touches[0].clientX, event.touches[1].clientX);
    let minY = Math.min(event.touches[0].clientY, event.touches[1].clientY);
    let centerX = minX + (Math.abs(event.touches[0].clientX - event.touches[1].clientX) / 2);
    let centerY = minY + (Math.abs(event.touches[0].clientY - event.touches[1].clientY) / 2);
    var realTarget = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
    centerX = centerX - (<any>realTarget.getBoundingClientRect()).x;
    centerY = centerY - (<any>realTarget.getBoundingClientRect()).y;
    this.fractal.getAnimator().zoomByScaleStart(dist, centerX, centerY)
  }
  private zoomGestureMove(event) {
    var dist = Math.abs(Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY));
    this.fractal.getAnimator().zoomByScale(dist);
  }
  private zoomGestureEnd(event) {
    this.fractal.getAnimator().zoomByScaleEnd();
  }

  private addTocuchOffsets(event) {
    var touch = event.touches[0] || event.changedTouches[0];
    event.offsetX = touch.clientX - (<any>this.HTMLfractal.nativeElement.getBoundingClientRect()).x;
    event.offsetY = touch.clientY - (<any>this.HTMLfractal.nativeElement.getBoundingClientRect()).y;
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

  onColorChanged(event) {
    this.changeColor(event.target.value);
    this.fractal.render();
  }

  closeAlert() {
    if (getComputedStyle(this.HTMLalert.nativeElement).visibility == "visible") {
      this.HTMLalert.nativeElement.style.visibility = "hidden";
      return;
    }
  }

  maxZoomReached() {
    this.fractal.deleteMaxZoomListener();
    this.alertText = "You have reached the max zoom, What you can see are floting point errors as the diffrences between the numbers are so small!";
    this.HTMLalert.nativeElement.style.visibility = "visible";
  }

  private changeColor(commandString: string) {
    let commands = commandString.split(",");
    for (let i = 0; i < commands.length; i++) {
      let thisCommand = commands[i].split(":");

      let command = thisCommand[0];
      let value = thisCommand[1];

      if (command == "rp") {
        this.fractal.color.redPhase = parseInt(value);
      }
      else if (command == "gp") {
        this.fractal.color.greenPhase = parseInt(value);
      }
      else if (command == "bp") {
        this.fractal.color.bluePhase = parseInt(value);
      }
      if (command == "rf") {
        this.fractal.color.redFrequency = parseInt(value);
      }
      else if (command == "gf") {
        this.fractal.color.greenFrequency = parseInt(value);
      }
      else if (command == "bf") {
        this.fractal.color.blueFrequency = parseInt(value);
      }
      if (command == "rw") {
        this.fractal.color.redWidth = parseInt(value);
      }
      else if (command == "gw") {
        this.fractal.color.greenWidth = parseInt(value);
      }
      else if (command == "bw") {
        this.fractal.color.blueWidth = parseInt(value);
      }
      if (command == "rc") {
        this.fractal.color.redColorCenter = parseInt(value);
      }
      else if (command == "gc") {
        this.fractal.color.greenColorCenter = parseInt(value);
      }
      else if (command == "bc") {
        this.fractal.color.blueColorCenter = parseInt(value);
      }
    }
  }

  startChangingIterations(i) {
    var self = this;
    this.iterationsAreChanging = true;
    setTimeout(function () {
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

      if (!self.iterationsAreChanging) {
        return;
      } else {
        self.startChangingIterations(i);
      }
    }, 100);
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

  /*
  * Helper Functions \/
  */

  requestNativeFullScreen() {
    let body = <any>document.body;
    let requestMethod = body.requestFullScreen || body.webkitRequestFullScreen || body.mozRequestFullScreen || body.msRequestFullScreen;
    if (requestMethod) {
      requestMethod.call(body);
    }
  }

  exitNativeFullScreen() {
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

  fullScreenWindow() {
    let explorerDiv = <HTMLDivElement>this.HTMLexplorer.nativeElement;
    explorerDiv.setAttribute("style", "position: absolute; top: 0px; left: 0px; border: none; z-index: 9999;");
    explorerDiv.style.width = window.innerWidth.toString() + "px";
    explorerDiv.style.height = window.innerHeight.toString() + "px";
    this.canvasSizeChanged();
  }

  canvasSizeChanged() {
    let canvas = <HTMLCanvasElement>this.HTMLfractal.nativeElement;
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;
    let cp = this.fractal.complexPlain;
    cp.replaceView(cp.getSquare().center.r, cp.getSquare().center.i, cp.getSquare().width, canvas);
    this.fractal.render();
  }

}
