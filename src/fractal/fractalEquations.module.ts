export namespace FractalEquations {

	export function burningShip(Cr: number, Ci: number, i: number, e: number): [number, number, number] {
		var Zr = 0;
		var Zi = 0;

		var Tr = 0;
		for (var n = 0; n < i && (Zr * Zr + Zi * Zi) <= e; ++n) {
			Tr = Zr * Zr - Zi * Zi + Cr
			Zi = Math.abs(2 * Zr * Zi + Ci)
			Zr = Math.abs(Tr)
		}
		return [n, Zr, Zi];
	}

	export function mandelbrot(Cr: number, Ci: number, i: number, e: number): [number, number, number] {
		var Zr = 0;
		var Zi = 0;
		var Tr = 0;
		var Ti = 0;
		var n = 0;
		for (; n < i && (Zr * Zr + Zi * Zi) <= e; ++n) {
			// Z*Z+C

			Tr = Zr * Zr - Zi * Zi + Cr;
			Ti = Zr * Zi + Zr * Zi + Ci;


			Zr = Tr;
			Zi = Ti;
		}
		return [n, Zr, Zi];
	}

	export function unknown1(Cr: number, Ci: number, i: number, e: number): [number, number, number] {
		var Zr = Cr;
		var Zi = Ci;
		var Tr = 0;
		var Ti = 0;

		var n = 0;
		for (; n < i && (Zr + Zi) <= e; ++n) {
			Zr = ((Zr * Zr) - (Zi * Zi)) + Cr;
			Zi = ((Zr * Zi) + (Zi * Zr)) + Ci;
			//Zr = Tr+Cr;
			//Zi = Ti+Ci;
		}
		return [n, Zr, Zi];
	}

	export function unknown2(Cr: number, Ci: number, i: number, e: number): Array<number> {
		var Zr = Cr;
		var Zi = Ci;

		var n = 0;
		for (; n < i && (Zr + Zi) <= e; ++n) {
			Zr = ((Zr * Zr) - (Zi * Zi));
			Zi = ((Zr * Zi) + (Zi * Zr));

			Zr = Zr + Cr;
			Zi = Zi + Ci;
		}
		return [n, Zr, Zi];
	}

	export function julia(Cr: number, Ci: number, jr: number, ji: number, i: number, e: number): [number, number, number] {
		var Zr = Cr;
		var Zi = Ci;
		var Tr = 0;
		var Ti = 0;
		Cr = jr;
		Ci = ji;

		var n = 0;
		for (; n < i && (Zr * Zr + Zi * Zi) <= e; ++n) {
			Tr = ((Zr * Zr) - (Zi * Zi));
			Ti = ((Zr * Zi) + (Zi * Zr));

			Zr = Tr + Cr;
			Zi = Ti + Ci;
		}
		return [n, Zr, Zi];
	}


	export function smoothMandelbrot(Cr: number, Ci: number, i: number, e: number): number {
		var Zr = 0;
		var Zi = 0;
		var Tr = 0;
		var Ti = 0;
		var n = 0;

		// Z^2+C
		for (; n < i && (Zr * Zr + Zi * Zi) <= e; ++n) {
			Tr = Zr * Zr - Zi * Zi  + Cr;
			Ti = Zr * Zi + Zr * Zi + Ci;

			Zr = Tr;
			Zi = Ti;
		}

		//smooth 
		if (n >= i) n = i;
		else {
			var log_zn = Math.log(Zr * Zr + Zi * Zi) / 2
			var nu = Math.log(log_zn / Math.log(2)) / Math.log(2)
			n = n + 1 - nu
		}
		return n;
	}

	export function smoothBurningShip(Cr: number, Ci: number, i: number, e: number): number {
		var Zr = 0;
		var Zi = 0;

		var Tr = 0;
		for (var n = 0; n < i && (Zr * Zr + Zi * Zi) <= e; ++n) {
			Tr = Zr * Zr - Zi * Zi + Cr
			Zi = Math.abs(2 * Zr * Zi + Ci)
			Zr = Math.abs(Tr)
		}
		//return [n, Zr, Zi];

		//smooth 
		if (n >= i) n = i;
		else {
			var log_zn = Math.log(Zr * Zr + Zi * Zi) / 2
			var nu = Math.log(log_zn / Math.log(2)) / Math.log(2)
			n = n + 1 - nu
		}
		return n;
	}

	export function smoothJulia(Cr: number, Ci: number, i: number, e: number): number {
		var Zr = Cr;
		var Zi = Ci;
		var Tr = 0;
		var Ti = 0;
		Cr = -0.8;
		Ci = 0.156;

		var n = 0;
		for (; n < i && (Zr * Zr + Zi * Zi) <= e; ++n) {
			Tr = ((Zr * Zr) - (Zi * Zi));
			Ti = ((Zr * Zi) + (Zi * Zr));

			Zr = Tr + Cr;
			Zi = Ti + Ci;
		}

		//smooth 
		if (n >= i) n = i;
		else {
			var log_zn = Math.log(Zr * Zr + Zi * Zi) / 2
			var nu = Math.log(log_zn / Math.log(2)) / Math.log(2)
			n = n + 1 - nu
		}
		return n;
	}


}

export module FractalEquationsPoints {

	export function mandelbrot(Cr: number, Ci: number, i: number, e: number): Array<Array<number>> {
		var Zr = 0;
		var Zi = 0;
		var Tr = 0;
		var Ti = 0;
		var n = 0;
		var myArray = new Array(i);

		for (; n < i && (Tr + Ti) <= e; ++n) {
			Zi = 2 * Zr * Zi + Ci;
			Zr = Tr - Ti + Cr;
			Tr = Zr * Zr;
			Ti = Zi * Zi;
			myArray[n] = [Zr, Zi];
		}
		myArray.length = n;
		return myArray;
	}
}
