import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from "@angular/core";

import { Fractals } from "../../fractal/fractal.module";


@Component({
  selector: "app-fractalView",
  templateUrl: "./fractalView.component.html",
  styleUrls: ["./fractalView.component.scss"]
})
export class FractalViewComponent implements OnInit, Fractals.ComplexPlainObserver {
  @ViewChild('fractalCanvas') HTMLcanvas: ElementRef;
  @Output() viewChanged = new EventEmitter();
  private fractal: Fractals.Fractal;
  private zoomGestureHappening: boolean = false;

  constructor() { }

  ngOnInit() {
    let canvas = <HTMLCanvasElement>this.HTMLcanvas.nativeElement;
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;
  }

  /*
  * Public 
  */

  public setFractal(fractal: Fractals.Fractal) {
    this.fractal = fractal;
    this.fractal.complexPlain.subscribe(this);
  }

  public changed() {
    this.viewChanged.emit();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.HTMLcanvas.nativeElement;
  }

  public sizeChanged() {
    let canvas = <HTMLCanvasElement>this.HTMLcanvas.nativeElement;
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;
    let cp = this.fractal.complexPlain;
    cp.replaceView(cp.getSquare().center.r, cp.getSquare().center.i, cp.getSquare().width, canvas);
    this.fractal.render();
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
      this.mousedown(event)
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
    if (document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY) === this.HTMLcanvas.nativeElement) {
      this.mouseMove(event);
      return;
    }
    this.mouseup(event);
  }

  touchEndDrag(event) {
    event.preventDefault();
    if (this.zoomGestureHappening) {
      this.zoomGestureHappening = false;
      this.fractal.getAnimator().zoomByScaleEnd();
    }
    else {
      event = this.addTocuchOffsets(event);
      this.mouseup(event);
    }

  }

  /*
  * Mouse pointer events
  */

  mousedown(event) {
    this.removeAllSelections();
    this.fractal.getAnimator().dragStart(event.offsetX, event.offsetY);
  }

  mouseup(event) {
    this.fractal.getAnimator().dragEnd(event.offsetX, event.offsetY);
  }

  mouseMove(event) {
    this.fractal.getAnimator().dragMove(event.offsetX, event.offsetY);
  }

  /*
  * Private Functions \/
  */

  private addTocuchOffsets(event) {
    var touch = event.touches[0] || event.changedTouches[0];
    event.offsetX = touch.clientX - (<any>this.HTMLcanvas.nativeElement.getBoundingClientRect()).left;
    event.offsetY = touch.clientY - (<any>this.HTMLcanvas.nativeElement.getBoundingClientRect()).top;
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