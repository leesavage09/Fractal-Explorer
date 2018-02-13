import { ErrorHandler } from "@angular/core/src/error_handler";
import { errorHandler } from "@angular/platform-browser/src/browser";
import { error } from "util";

export module General {
	/*
	* 	find where in output_range input_value is 
	*/
	export function mapInOut(input_value, input_start, input_end, output_start, output_end) {
		var input_range = input_end - input_start;
		var output_range = output_end - output_start;
		var output = (input_value - input_start) * output_range / input_range + output_start;
		return output;
	}

	/*
	*	Helper for slowing down high speed code for debugging
	*/
	export function debugSleep(milliseconds) {
		var start = new Date().getTime();
		for (var i = 0; i < 1e7; i++) {
			if ((new Date().getTime() - start) > milliseconds) {
				break;
			}
		}
	}
}

/*
* Easing Functions - inspired from http://gizma.com/easing/
* only considering the t value for the range [0, 1] => [0, 1]
*/
export module EasingFunctions {
	// no easing, no acceleration
	export function linear(t) { return t }
	// accelerating from zero velocity
	export function easeInQuad(t) { return t * t }
	// decelerating to zero velocity
	export function easeOutQuad(t) { return t * (2 - t) }
	// acceleration until halfway, then deceleration
	export function easeInOutQuad(t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
	// accelerating from zero velocity 
	export function easeInCubic(t) { return t * t * t }
	// decelerating to zero velocity 
	export function easeOutCubic(t) { return (--t) * t * t + 1 }
	// acceleration until halfway, then deceleration 
	export function easeInOutCubic(t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 }
	// accelerating from zero velocity 
	export function easeInQuart(t) { return t * t * t * t }
	// decelerating to zero velocity 
	export function easeOutQuart(t) { return 1 - (--t) * t * t * t }
	// acceleration until halfway, then deceleration
	export function easeInOutQuart(t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t }
	// accelerating from zero velocity
	export function easeInQuint(t) { return t * t * t * t * t }
	// decelerating to zero velocity
	export function easeOutQuint(t) { return 1 + (--t) * t * t * t * t }
	// acceleration until halfway, then deceleration 
	export function easeInOutQuint(t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
}


export namespace Color {


	export class LinearGradient {
		private arr: Array<LinearGradientStop>
		private phase: number = 0;
		private frequency: number = 1;
		private min: number = 0;
		private mid: number = 0.5;
		private max: number = 1;
		private subscribers: Array<LinearGradientObserver> = new Array();
		constructor(arr: Array<LinearGradientStop> = null) {
			if (arr != null) {
				this.replaceAllStops(arr)
			}
		}

		public replaceAllStops(arr: Array<LinearGradientStop>) {
			arr.sort(function (a: LinearGradientStop, b: LinearGradientStop): number {
				if (a.stop > b.stop) return 1
				if (a.stop < b.stop) return -1
				if (a.stop == b.stop) return 0
			});

			if (arr[0].stop > 0) arr.unshift({ stop: 0, color: arr[0].color });
			if (arr[arr.length - 1].stop < 1) arr.push({ stop: 1, color: arr[arr.length - 1].color });

			this.arr = arr;
		}

		public decodeJSON(json: string): void {
			let obj = JSON.parse(json);
			this.arr = obj.arr;
			this.phase = obj.phase;
			this.frequency = obj.frequency
		}

		public subscribe(observer: LinearGradientObserver) {
			this.subscribers.push(observer);
		}

		public unsubscribe(observer: LinearGradientObserver) {
			this.subscribers.splice(this.subscribers.lastIndexOf(observer), 1);
		}

		public notify(excludeObserver: LinearGradientObserver) {
			for (let i = 0; i < this.subscribers.length; i++) {
				if (excludeObserver != this.subscribers[i]) this.subscribers[i].linearGradientChanged();
			}
		}

		public setPhase(phase: number): void {
			this.phase = phase * this.frequency
		}

		public setFrequency(frequency: number): void {
			if (frequency < 1) frequency = 1;
			else this.frequency = Math.abs(frequency)
		}

		public setMin(n: number) {
			this.min = n;
		}

		public setMid(n: number) {
			this.mid = n;
		}

		public setMax(n: number) {
			this.max = n;
		}

		public addStop(stop: LinearGradientStop): void {
			this.arr.push(stop);
		}

		public getStops(): Array<LinearGradientStop> {
			return this.arr
		}

		public getPhase(): number {
			return this.phase
		}

		public getFrequency(): number {
			return this.frequency
		}



		/*
		* Returns the colour in the gradiant for a val bettween 0 and 1
		*/
		public getColorAt(val: number, levels: { min: number, mid: number, max: number } = null, frequency: number = null, phase: number = null): RGBcolor {
			if (levels == null) levels = { min: this.min, mid: this.mid, max: this.max }
			if (frequency == null) frequency = this.frequency
			if (phase == null) phase = this.phase

			if (val < levels.min) val = 0;
			else if (val > levels.max) val = 1;
			else if (val <= levels.mid) val = General.mapInOut(val, levels.min, levels.mid, 0, 0.5);
			else if (val > levels.mid) val = General.mapInOut(val, levels.mid, levels.max, 0.5, 1);

			val = val * frequency + phase - 1
			let trunc = Math.trunc(val);
			val = Math.abs(val % 1)
			if ((trunc % 2) == 0) val = Math.abs(1 - val)
			if (val < 0 || val > 1) throw Error("Val out of bounds " + val);


			if (this.arr.length < 1) return { r: 0, g: 0, b: 0 };

			var colorInRange = []
			for (var i = 0, len = this.arr.length; i < len; i++) {
				if (i > 0 && val <= this.arr[i].stop) {
					colorInRange = [i - 1, i]
					break;
				}
			}

			let firstColor = this.arr[colorInRange[0]].color;
			let secondColor = this.arr[colorInRange[1]].color;
			var firstStop = this.arr[colorInRange[0]].stop;
			var secondStop = this.arr[colorInRange[1]].stop - firstStop;
			var valBetweenStops = (val) - firstStop;
			var secondRatio = valBetweenStops / secondStop
			var firstRatio = 1 - secondRatio

			return {
				r: Math.round(firstColor.r * firstRatio + secondColor.r * secondRatio),
				g: Math.round(firstColor.g * firstRatio + secondColor.g * secondRatio),
				b: Math.round(firstColor.b * firstRatio + secondColor.b * secondRatio)
			};
		}
	}

	export interface LinearGradientObserver {
		linearGradientChanged(): void
	}

	export class LinearGradientStop {
		stop: number
		color: RGBcolor
		constructor(stop: number, color: RGBcolor) {
			this.stop = stop;
			this.color = color;
		}
	}

	export class RGBcolor {
		r: number
		g: number
		b: number
		constructor(r: number, g: number, b: number) {
			this.r = r;
			this.g = g;
			this.b = b;
		}
	}


	export function hexToRGB(hex: string): RGBcolor {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	export function rgbToHex(rgb: RGBcolor): string {
		return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
	}

	function componentToHex(c: number): string {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

}


