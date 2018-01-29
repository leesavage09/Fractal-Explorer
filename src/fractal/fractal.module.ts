import { FractalColoring } from "../fractal/fractalColouring";
import { ComplexNumber, ComplexSquare } from "../fractal/complexNumbers";
import { General, EasingFunctions } from "../helper/helper.module";

export module Fractals {

	export class Fractal {
		iterations: number = 85;
		escapeRadius: number = 10;
		color: FractalColoring;
		complexPlain: ComplexPlain;
		img: ImageData;
		private calculationFunction: Function;
		private renderVersion: number = 0;
		private updateTimeout: number = 100
		private lastUpdate: number;
		private animator: FractalNavigationAnimator;
		private maxZoomListner: MaxZoomListner;
		constructor(complexPlain: ComplexPlain, fractalCalculationFunction: Function) {
			this.complexPlain = complexPlain;
			this.calculationFunction = fractalCalculationFunction;
			this.color = new FractalColoring(this);
		}

		public renderIfVersionIsNew(v: number): void {
			if (this.renderVersion <= v) {
				this.render();
			}
		}

		public render(): void {
			this.stopRendering();
			if (this.complexPlain.getSquare().width < 5.2291950245225395e-15) {
				this.notifiMaxZoomListeners();
			}
			this.complexPlain.makeAlternativeResolutionCanvas(0.5);
			var self = this;
			setTimeout(function () {
				self.scanLine(0, self.renderVersion);
			}, 0);
		}

		private scanLine(y: number, version: number): void {
			if (this.renderVersion != version) {
				return;
			}

			this.img = this.complexPlain.getScanLineImage();
			var Ci = this.complexPlain.getImaginaryNumber(y);
			for (var x = 0; x <= this.complexPlain.getDrawableWidth() - 1; x++) {
				var Cr = this.complexPlain.getRealNumber(x);
				var n = this.calculationFunction(Cr, Ci, this.iterations, this.escapeRadius);
				this.color.normalizediterationcount(n[0], x, this.iterations, n[1], n[2]);
			}
			this.complexPlain.updateCanvas(y);

			if (y < this.complexPlain.getDrawableHeight()) {
				var now = (new Date).getTime();
				if ((now - this.lastUpdate) >= this.updateTimeout) {
					this.lastUpdate = now;
					var self = this;
					setTimeout(function () {
						self.scanLine(y + 1, version);
					}, 1);// using timeout 1 to force thread to yeald so we can update UI
				}
				else {
					this.scanLine(y + 1, version);
				}
			}
			else if (!this.complexPlain.drawableAndViewAreEqual()) {
				this.complexPlain.makeAlternativeResolutionCanvas(1);
				this.lastUpdate = (new Date).getTime();
				var self = this;
				setTimeout(function () {
					self.scanLine(0, version);
				}, 1);
			}
		}

		public getAnimator(): FractalNavigationAnimator {
			if (this.animator == undefined) {
				this.animator = new FractalNavigationAnimator(this);
			}
			return this.animator;
		}

		public stopRendering(): void {
			this.renderVersion = this.renderVersion + 1;
		}

		public getCurrentVersion(): number {
			return this.renderVersion;
		}

		public setMaxZoomListener(l: MaxZoomListner) {
			this.maxZoomListner = l;
		}

		public deleteMaxZoomListener() {
			this.maxZoomListner = null;
		}

		private notifiMaxZoomListeners() {
			if (this.maxZoomListner != null) {
				this.maxZoomListner.maxZoomReached();
			}
		}
	}

	/*
	*    This class keeps track of the realationships between 
	*		the canvas the user sees and interacts with
	*    	the complex plain the fractal is calucated from
	*  		the image the fractal is rendered onto
	*
	*	public helper methors alow conversions between these diffrent
	*	refrence frames.
	*/
	export class ComplexPlain {
		private complexSquare: ComplexSquare;
		private drawableCanvas: HTMLCanvasElement;
		private scanLine: ImageData;
		private viewCanvas: HTMLCanvasElement;
		constructor(realCenter: number, imaginaryCenter: number, realWidth: number, canvas: HTMLCanvasElement) {
			this.replaceView(realCenter, imaginaryCenter, realWidth, canvas);
		}

		replaceView(realCenter: number, imaginaryCenter: number, realWidth: number, canvas: HTMLCanvasElement) {
			let center = new ComplexNumber(realCenter, imaginaryCenter);
			let width = realWidth;
			let height = (realWidth / canvas.width) * canvas.height

			this.complexSquare = new ComplexSquare(center, width, height);
			this.viewCanvas = canvas;
			this.makeAlternativeResolutionCanvas(1);
		}

		updateCanvas(y: number): void {
			this.drawableCanvas.getContext("2d").putImageData(this.getScanLineImage(), 0, y);
			let destCtx = this.viewCanvas.getContext("2d");
			if (!this.drawableAndViewAreEqual()) {
				destCtx.scale(this.viewCanvas.width / this.drawableCanvas.width, this.viewCanvas.height / this.drawableCanvas.height);
				destCtx.drawImage(this.drawableCanvas, 0, 0);
				destCtx.scale(this.drawableCanvas.width / this.viewCanvas.width, this.drawableCanvas.height / this.viewCanvas.height);
			}
			else {
				destCtx.drawImage(this.drawableCanvas, 0, 0);
			}
		}

		makeAlternativeResolutionCanvas(fraction: number): void {
			let canvas = document.createElement('canvas');
			canvas.setAttribute("width", (this.viewCanvas.width * fraction).toString());
			canvas.setAttribute("height", (this.viewCanvas.height * fraction).toString());
			this.drawableCanvas = canvas;
			this.scanLine = this.drawableCanvas.getContext("2d").createImageData(this.drawableCanvas.width, 1);
		}

		drawableAndViewAreEqual(): boolean {
			return (this.viewCanvas.width == this.drawableCanvas.width && this.viewCanvas.height == this.drawableCanvas.height)
		}

		/*
		*	Getters
		*/

		getSquare(): ComplexSquare {
			return this.complexSquare;
		}

		getDrawableWidth(): number {
			return this.drawableCanvas.width;
		}

		getDrawableHeight(): number {
			return this.drawableCanvas.height;
		}

		getViewCanvas(): HTMLCanvasElement {
			return this.viewCanvas;
		}

		getScanLineImage(): ImageData {
			return this.scanLine;
		}

		getComplexNumberFromMouse(x: number, y: number): ComplexNumber {
			let r = General.mapInOut(x, 0, this.getViewCanvas().width - 1, this.complexSquare.min.r, this.complexSquare.max.r);
			let i = General.mapInOut(y, 0, this.getViewCanvas().height - 1, this.complexSquare.max.i, this.complexSquare.min.i);
			return new ComplexNumber(r, i);
		}

		getMouse(complexNum: ComplexNumber): { x, y } {
			let x = General.mapInOut(complexNum.r, this.complexSquare.min.r, this.complexSquare.max.r, 0, this.getViewCanvas().width);
			let y = General.mapInOut(complexNum.i, this.complexSquare.min.i, this.complexSquare.max.i, this.getViewCanvas().height, 0);
			return { x: x, y: y };
		}

		getImaginaryNumber(pixelY: number): Number {
			return General.mapInOut(pixelY, 0, this.drawableCanvas.height - 1, this.complexSquare.max.i, this.complexSquare.min.i);
		}

		getRealNumber(pixelX: number): Number {
			return General.mapInOut(pixelX, 0, this.drawableCanvas.width - 1, this.complexSquare.min.r, this.complexSquare.max.r);
		}










	}



	export class FractalNavigationAnimator {
		fractal: Fractal;
		driftAnimationTime: number = 1500;//800
		zoomAnimationTime: number = 200;
		animationIsRunning: boolean = false;
		mouseStartDragPos: { x: number, y: number };
		bufferedCanvas: HTMLCanvasElement;
		speedX: number;
		speedY: number;
		lastmousex: number;
		lastmousey: number;
		lastDist: number;
		speedDist: number;
		driftSpeedDist: number;
		lastSpeedTime: number;
		startTime: number;
		driftSpeedX: number;
		driftSpeedY: number;
		clickX: number;
		clickY: number;
		magnification: number;
		focusX: number;
		focusY: number;
		touchStartDelta: number = null;
		touchLastScale: number;
		constructor(fractal: Fractal) {
			this.fractal = fractal;
		}

		private initBufferedImage(): void {
			this.bufferedCanvas = document.createElement('canvas');
			this.bufferedCanvas.width = this.fractal.complexPlain.getViewCanvas().width;
			this.bufferedCanvas.height = this.fractal.complexPlain.getViewCanvas().height;
			this.bufferedCanvas.getContext('2d').drawImage(this.fractal.complexPlain.getViewCanvas(), 0, 0);
		}

		dragStart(x: number, y: number): void {
			if (this.animationIsRunning || this.touchStartDelta != null) return;
			this.fractal.stopRendering();
			this.initBufferedImage();
			this.mouseStartDragPos = { x: x, y: y };
		}

		dragMove(x: number, y: number): void {
			if (this.mouseStartDragPos == null || this.animationIsRunning || this.touchStartDelta != null) return;

			let dt = (new Date).getTime() - this.lastSpeedTime;
			let dx = x - this.lastmousex;
			let dy = y - this.lastmousey;
			this.speedX = Math.round(dx / dt * 10);
			this.speedY = Math.round(dy / dt * 10);

			this.lastmousex = x;
			this.lastmousey = y;
			this.lastSpeedTime = (new Date).getTime();

			dx = x - this.mouseStartDragPos.x;
			dy = y - this.mouseStartDragPos.y;
			let canvas = this.fractal.complexPlain.getViewCanvas();
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
			canvas.getContext('2d').drawImage(this.bufferedCanvas, dx, dy);
		}

		dragEnd(x: number, y: number, animate: boolean = true): void {
			if (this.mouseStartDragPos == null || this.animationIsRunning || this.touchStartDelta != null) return;

			if (animate && !isNaN(this.speedX) && !isNaN(this.speedY) && this.speedX != 0 && this.speedY != 0) {
				this.startTime = (new Date).getTime();
				this.animationIsRunning = true;
				this.driftSpeedX = this.speedX;
				this.driftSpeedY = this.speedY;
				let that = this;
				window.requestAnimationFrame(function () { that.dragDrifting() });
				return;
			}

			let deltaX = x - this.mouseStartDragPos.x;
			let deltaY = y - this.mouseStartDragPos.y;
			let oldPos = this.fractal.complexPlain.getMouse(this.fractal.complexPlain.getSquare().center);
			let newCenter = this.fractal.complexPlain.getComplexNumberFromMouse(oldPos.x - deltaX, oldPos.y - deltaY);
			let newWidth = this.fractal.complexPlain.getSquare().width;
			this.fractal.complexPlain.replaceView(newCenter.r, newCenter.i, newWidth, this.fractal.complexPlain.getViewCanvas());
			if (animate) this.fractal.render();
			this.mouseStartDragPos = null;
		}


		private dragDrifting(): void {
			let delta = (new Date).getTime() - this.startTime;
			let scale = delta / this.driftAnimationTime;
			if (scale > 1) {
				this.speedX = 0;
				this.speedY = 0;
				this.animationIsRunning = false;
				this.dragEnd(this.lastmousex, this.lastmousey);
				return;
			}

			this.lastmousex = this.lastmousex + this.speedX;
			this.lastmousey = this.lastmousey + this.speedY;

			let dx = this.lastmousex - this.mouseStartDragPos.x;
			let dy = this.lastmousey - this.mouseStartDragPos.y;
			let canvas = this.fractal.complexPlain.getViewCanvas();
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
			canvas.getContext('2d').drawImage(this.bufferedCanvas, dx, dy);

			let tempScale = EasingFunctions.easeOutQuart(scale)

			this.speedX = this.driftSpeedX - this.driftSpeedX * tempScale;
			this.speedY = this.driftSpeedY - this.driftSpeedY * tempScale;

			if (Math.abs(this.speedX) < 1 && Math.abs(this.speedY) < 1) {
				this.startTime = this.startTime - this.driftAnimationTime;
			}

			let that = this;
			window.requestAnimationFrame(function () { that.dragDrifting() });
		}

		zoomByScaleStart(startDist, x, y): void {
			if (this.animationIsRunning || this.mouseStartDragPos != null) return;
			this.touchStartDelta = startDist;
			this.clickX = x;
			this.clickY = y;
			this.initBufferedImage();
		}

		zoomByScale(dist): void {
			if (this.animationIsRunning || this.mouseStartDragPos != null || this.touchStartDelta == null) return;

			let deltaTime = (new Date).getTime() - this.lastSpeedTime;
			let deltaDist = dist - this.lastDist;
			this.speedDist = Math.round(deltaDist / deltaTime * 10);

			this.lastDist = dist;
			this.lastSpeedTime = (new Date).getTime();


			let scale = dist / this.touchStartDelta;
			this.touchLastScale = scale;
			let width = this.bufferedCanvas.width * scale;
			let height = this.bufferedCanvas.height * scale;
			let cx = this.clickX - (this.clickX * scale);
			let cy = this.clickY - (this.clickY * scale);
			let viewCanvas = this.fractal.complexPlain.getViewCanvas();
			viewCanvas.getContext('2d').clearRect(0, 0, viewCanvas.width, viewCanvas.height);
			viewCanvas.getContext('2d').drawImage(this.bufferedCanvas, cx, cy, width, height);
		}

		zoomByScaleEnd(animate: boolean = true): void {
			if (this.animationIsRunning || this.mouseStartDragPos != null || this.touchStartDelta == null) return;

			if (animate && !isNaN(this.speedDist) && this.speedDist != 0) {
				this.startTime = (new Date).getTime();
				this.animationIsRunning = true;
				this.driftSpeedDist = this.speedDist;
				let that = this;
				window.requestAnimationFrame(function () { that.touchZoomDrifting() });
				return;
			}

			this.touchStartDelta = null;
			let viewCanvas = this.fractal.complexPlain.getViewCanvas();
			let newWidthScale = this.bufferedCanvas.width / (2 * this.touchLastScale);
			let newHeightScale = this.bufferedCanvas.height / (2 * this.touchLastScale);
			this.focusX = this.clickX - General.mapInOut(this.clickX, 0, this.bufferedCanvas.width, 0 - newWidthScale, newWidthScale);
			this.focusY = this.clickY - General.mapInOut(this.clickY, 0, this.bufferedCanvas.height, 0 - newHeightScale, newHeightScale);
			let newCenter = this.fractal.complexPlain.getComplexNumberFromMouse(this.focusX, this.focusY);//TODO ComplexNumber    
			let newWidth = this.fractal.complexPlain.getSquare().width / this.touchLastScale
			this.fractal.complexPlain = new ComplexPlain(newCenter.r, newCenter.i, newWidth, viewCanvas);
			if (animate) this.fractal.render();
		}

		private touchZoomDrifting(): void {
			let delta = (new Date).getTime() - this.startTime;
			let scale = delta / this.driftAnimationTime;
			if (scale > 1) {
				this.speedDist = 0;
				this.animationIsRunning = false;
				this.zoomByScaleEnd();
				return;
			}

			this.lastDist = this.lastDist + this.speedDist;

			let s = this.lastDist / this.touchStartDelta;
			this.touchLastScale = s;
			let width = this.bufferedCanvas.width * s;
			let height = this.bufferedCanvas.height * s;
			let cx = this.clickX - (this.clickX * s);
			let cy = this.clickY - (this.clickY * s);
			let viewCanvas = this.fractal.complexPlain.getViewCanvas();
			viewCanvas.getContext('2d').clearRect(0, 0, viewCanvas.width, viewCanvas.height);
			viewCanvas.getContext('2d').drawImage(this.bufferedCanvas, cx, cy, width, height);

			let tempScale = EasingFunctions.easeOutQuart(scale)

			this.speedDist = this.driftSpeedDist - this.driftSpeedDist * tempScale;

			console.log(this.speedDist);

			if (Math.abs(this.speedDist) < 1) {
				this.startTime = this.startTime - this.driftAnimationTime;
			}

			let that = this;
			window.requestAnimationFrame(function () { that.touchZoomDrifting() });
		}

		zoomStart(x: number, y: number, magnification: number, animationTime: number): void {
			if (this.animationIsRunning || this.mouseStartDragPos != null || this.touchStartDelta != null) return;
			this.animationIsRunning = true;
			this.fractal.stopRendering();
			this.clickX = x
			this.clickY = y;
			this.magnification = magnification;
			this.startTime = (new Date).getTime();
			this.initBufferedImage();
			let that = this;
			window.requestAnimationFrame(function () { that.zooming(animationTime) });
		}

		private zooming(deltaTime: number): void {
			let delta = (new Date).getTime() - this.startTime;
			let scale = (delta / deltaTime);
			let quadScale = EasingFunctions.easeInOutQuad(scale)
			if (scale > 1) {
				scale = 1; //last frame
				quadScale = this.magnification;
			}
			else if (this.magnification > 1) {
				quadScale = 1 + (quadScale * (this.magnification - 1));
			} else {
				quadScale = 1 - (quadScale * (1 - this.magnification));
			}

			let width = this.bufferedCanvas.width * quadScale;
			let height = this.bufferedCanvas.height * quadScale;
			let cx = this.clickX - (this.clickX * quadScale);
			let cy = this.clickY - (this.clickY * quadScale);
			let viewCanvas = this.fractal.complexPlain.getViewCanvas();
			viewCanvas.getContext('2d').clearRect(0, 0, viewCanvas.width, viewCanvas.height);
			viewCanvas.getContext('2d').drawImage(this.bufferedCanvas, cx, cy, width, height);

			if (quadScale != this.magnification) {
				let that = this;
				window.requestAnimationFrame(function () { that.zooming(deltaTime) });
			}
			else {
				let newWidthScale = this.bufferedCanvas.width / (2 * quadScale);
				let newHeightScale = this.bufferedCanvas.height / (2 * quadScale);
				this.focusX = this.clickX - General.mapInOut(this.clickX, 0, this.bufferedCanvas.width, 0 - newWidthScale, newWidthScale);
				this.focusY = this.clickY - General.mapInOut(this.clickY, 0, this.bufferedCanvas.height, 0 - newHeightScale, newHeightScale);
				let newCenter = this.fractal.complexPlain.getComplexNumberFromMouse(this.focusX, this.focusY);//TODO ComplexNumber    
				let newWidth = this.fractal.complexPlain.getSquare().width / quadScale
				this.fractal.complexPlain = new ComplexPlain(newCenter.r, newCenter.i, newWidth, viewCanvas);
				let version = this.fractal.getCurrentVersion();
				let that = this;
				setTimeout(function () {
					that.fractal.renderIfVersionIsNew(version);
				}, 300)
				this.animationIsRunning = false;
			}
		}

	}

	/*
	class PointAnimator {
		version: number;
		fractal: Fractal;
		fun: Function;
		context: CanvasRenderingContext2D;
		constructor(fractal, fun) {
			this.version = 0;
			this.fractal = fractal;
			this.fun = fun;
			this.context = this.fractal.complexPlain.getViewCanvas().getContext('2d');
		}
	
		drawEsscapePoints(pos, mSet) {
			var Ci = mSet.complexPlain.getImaginaryAtY(pos.y);
			var Cr = mSet.complexPlain.getRealAtX(pos.x);
			var array = this.fun(Cr, Ci, this.fractal.iterations, this.fractal.escapeRadius);
			var lum = 255 / array.length;
	
			var version = this.version + 1;
			this.version = version;
			for (var i = 0; i <= array.length - 1; i++) {
				let x = this.fractal.complexPlain.getRealNumber(array[i][0]);
				let y = this.fractal.complexPlain.getImaginaryNumber(array[i][1]);
				this.drawToCanvasPoint(i * 20, x, y, "rgba(" + i * lum + ", " + i * lum + ", 255, 255)", version);
			}
		}
	
		drawToCanvasPoint(delay, x, y, rgba, v) {
			var that = this;
			setTimeout(function () {
				if (that.version != v) {
					//return;
				}
				that.context.beginPath();
				that.context.arc(x, y, 2.5, 0, 2 * Math.PI);
				that.context.stroke();
				that.context.fillStyle = rgba;
				that.context.fill();
			}, delay)
		}
	}*/

}

export interface MaxZoomListner {
	maxZoomReached();
}