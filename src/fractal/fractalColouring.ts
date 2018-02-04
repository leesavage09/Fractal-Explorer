import { Fractals } from "../fractal/fractal.module";

export class FractalColoring {
	fractal: Fractals.Fractal;
	totalPhase: number;
	redPhase: number;
	greenPhase: number;
	bluePhase: number;
	totalFrequency: number;
	redFrequency: number;
	greenFrequency: number;
	blueFrequency: number;
	redWidth: number;
	redColorCenter: number;
	greenWidth: number;
	greenColorCenter: number;
	blueWidth: number;
	blueColorCenter: number;

	compiledMaxN: number;
	compiledRn: number;
	compiledGn: number;
	compiledBn: number;
	compiledRedFrequency: number;
	compiledGreenFrequency: number;
	compiledBlueFrequency: number;
	nthRn: number;
	nthGn: number;
	nthBn: number;

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

	changeColor(commandString:string) {
		let commands = commandString.split(",");
		for (let i = 0; i < commands.length; i++) {
			let thisCommand = commands[i].split(":");

			let command = thisCommand[0];
			let value = thisCommand[1];

			if (command == "rp") {
				this.redPhase = parseInt(value);
			}
			else if (command == "gp") {
				this.greenPhase = parseInt(value);
			}
			else if (command == "bp") {
				this.bluePhase = parseInt(value);
			}
			else if (command == "rf") {
				this.redFrequency = parseInt(value);
			}
			else if (command == "gf") {
				this.greenFrequency = parseInt(value);
			}
			else if (command == "bf") {
				this.blueFrequency = parseInt(value);
			}
			else if (command == "rw") {
				this.redWidth = parseInt(value);
			}
			else if (command == "gw") {
				this.greenWidth = parseInt(value);
			}
			else if (command == "bw") {
				this.blueWidth = parseInt(value);
			}
			else if (command == "rc") {
				this.redColorCenter = parseInt(value);
			}
			else if (command == "gc") {
				this.greenColorCenter = parseInt(value);
			}
			else if (command == "bc") {
				this.blueColorCenter = parseInt(value);
			}
			else if (command == "tp") {
				this.totalPhase = parseInt(value);
			}
			else if (command == "tf") {
				this.totalFrequency = parseInt(value);
			}
		}
	}

	compile(n_max: number) {
		this.compiledMaxN = n_max;
		let compiled100thMaxN = n_max / 100;
		let frequency = (Math.PI * 2) / n_max;
		frequency = frequency * this.totalFrequency;

		this.compiledRedFrequency = this.redFrequency * frequency;
		this.compiledGreenFrequency = this.greenFrequency * frequency;
		this.compiledBlueFrequency = this.blueFrequency * frequency;
		this.compiledRn = compiled100thMaxN * (this.redPhase + this.totalPhase);
		this.compiledGn = compiled100thMaxN * (this.greenPhase + this.totalPhase);
		this.compiledBn = compiled100thMaxN * (this.bluePhase + this.totalPhase);
	}


	compiledNormalizediterationcount(n: number, pixel: number, Zr: number, Zi: number): void {
		if (n >= this.compiledMaxN) {
			this.fractal.img.data[(pixel * 4) + 0] = 0; //red
			this.fractal.img.data[(pixel * 4) + 1] = 0; //green
			this.fractal.img.data[(pixel * 4) + 2] = 0; //blue
			this.fractal.img.data[(pixel * 4) + 3] = 255;  //alphas
		}
		else {
			// normalize colors
			n = n + 1 - Math.log((Math.log(Zr * Zr + Zi * Zi) / 2) / 0.301029996) / 0.301029996

			//phase shift colors
			this.nthRn = n + this.compiledRn;
			this.nthRn = this.nthRn > this.compiledMaxN ? this.nthRn - this.compiledMaxN : this.nthRn;
			this.nthGn = n + this.compiledGn;
			this.nthGn = this.nthGn > this.compiledMaxN ? this.nthGn - this.compiledMaxN : this.nthGn;
			this.nthBn = n + this.compiledBn;
			this.nthBn = this.nthBn > this.compiledMaxN ? this.nthBn - this.compiledMaxN : this.nthBn;

			this.fractal.img.data[(pixel * 4) + 0] = Math.sin(this.compiledRedFrequency * this.nthRn) * this.redWidth + this.redColorCenter;
			this.fractal.img.data[(pixel * 4) + 1] = Math.sin(this.compiledGreenFrequency * this.nthGn) * this.greenWidth + this.greenColorCenter;
			this.fractal.img.data[(pixel * 4) + 2] = Math.sin(this.compiledBlueFrequency * this.nthBn) * this.blueWidth + this.blueColorCenter;
			this.fractal.img.data[(pixel * 4) + 3] = 255;  //alphas
		}
	}

	// normalizediterationcount(n: number, x: number, n_max: number, Zr: number, Zi: number): void {
	// 	if (n >= n_max) {
	// 		this.fractal.img.data[(x * 4) + 0] = 0; //red
	// 		this.fractal.img.data[(x * 4) + 1] = 0; //green
	// 		this.fractal.img.data[(x * 4) + 2] = 0; //blue
	// 		this.fractal.img.data[(x * 4) + 3] = 255;  //alphas
	// 	}
	// 	else {
	// 		// normalize colors
	// 		var log_zn = Math.log(Zr * Zr + Zi * Zi) / 2
	// 		var nu = Math.log(log_zn / Math.log(2)) / Math.log(2)
	// 		n = n + 1 - nu

	// 		var rgb = this.picColor(n, n_max);

	// 		this.fractal.img.data[(x * 4) + 0] = rgb[0]; //red
	// 		this.fractal.img.data[(x * 4) + 1] = rgb[1]; //green
	// 		this.fractal.img.data[(x * 4) + 2] = rgb[2]; //blue
	// 		this.fractal.img.data[(x * 4) + 3] = 255;  //alphas
	// 	}
	// }

	picColor(n: number, n_max: number): [number, number, number] {
		//phase shift colors
		var Rn = n + ((n_max / 100) * (this.redPhase + this.totalPhase));
		var Rn = Rn > n_max ? Rn - n_max : Rn;
		var Gn = n + ((n_max / 100) * (this.greenPhase + this.totalPhase));
		var Gn = Gn > n_max ? Gn - n_max : Gn;
		var Bn = n + ((n_max / 100) * (this.bluePhase + this.totalPhase));
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