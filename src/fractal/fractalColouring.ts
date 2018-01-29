import { Fractals } from "../fractal/fractal.module";

export class FractalColoring {
	fractal: Fractals.Fractal;
	totalPhase:number;
	redPhase: number;
	greenPhase: number;
	bluePhase: number;
	totalFrequency:number;
	redFrequency: number;
	greenFrequency: number;
	blueFrequency: number;
	redWidth: number;
	redColorCenter: number;
	greenWidth: number;
	greenColorCenter: number;
	blueWidth: number;
	blueColorCenter: number;

	constructor(fractal: Fractals.Fractal) {
		this.fractal = fractal;
		this.totalPhase = 0;
		this.redPhase = 0;
		this.greenPhase = 0;
		this.bluePhase = 0;
		this.totalFrequency = 1;
		this.redFrequency = 1;
		this.greenFrequency = 1;
		this.blueFrequency = 1;
		this.redWidth = 127;
		this.redColorCenter = 128;
		this.greenWidth = 127;
		this.greenColorCenter = 128;
		this.blueWidth = 127;
		this.blueColorCenter = 128;
	}

	normalizediterationcount(n: number, x: number, n_max: number, Zr: number, Zi: number): void {
		if (n >= n_max) {
			this.fractal.img.data[(x * 4) + 0] = 0; //red
			this.fractal.img.data[(x * 4) + 1] = 0; //green
			this.fractal.img.data[(x * 4) + 2] = 0; //blue
			this.fractal.img.data[(x * 4) + 3] = 255;  //alphas
		}
		else {
			// normalize colors
			var log_zn = Math.log(Zr * Zr + Zi * Zi) / 2
			var nu = Math.log(log_zn / Math.log(2)) / Math.log(2)
			n = n + 1 - nu

			var rgb = this.picColor(n, n_max);

			this.fractal.img.data[(x * 4) + 0] = rgb[0]; //red
			this.fractal.img.data[(x * 4) + 1] = rgb[1]; //green
			this.fractal.img.data[(x * 4) + 2] = rgb[2]; //blue
			this.fractal.img.data[(x * 4) + 3] = 255;  //alphas
		}
	}

	picColor(n: number, n_max: number): [number, number, number] {
		//phase shift colors
		var Rn = n + ((n_max / 100) * (this.redPhase+this.totalPhase));
		var Rn = Rn > n_max ? Rn - n_max : Rn;
		var Gn = n + ((n_max / 100) * (this.greenPhase+this.totalPhase));
		var Gn = Gn > n_max ? Gn - n_max : Gn;
		var Bn = n + ((n_max / 100) * (this.bluePhase+this.totalPhase));
		var Bn = Bn > n_max ? Bn - n_max : Bn;

		//calculate colors
		var frequency = (Math.PI * 2) / n_max;
		frequency = frequency * this.totalFrequency;
		var r = Math.sin(this.redFrequency * frequency * Rn) * this.redWidth + this.redColorCenter;
		var g = Math.sin(this.greenFrequency * frequency * Gn) * this.greenWidth + this.greenColorCenter;
		var b = Math.sin(this.blueFrequency * frequency * Bn) * this.blueWidth + this.blueColorCenter;

		return [r, g, b];
	}
}