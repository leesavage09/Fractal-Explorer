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
import { JuliaPickerComponent } from "../juliaPicker/juliaPicker.component";
import { FractalViewComponent } from '../fractalView/fractalView.component';

@Component({
  selector: "ExplorerComponent",
  templateUrl: "./explorer.component.html",
  styleUrls: ["./explorerThemes.component.scss"]
})
export class ExplorerComponent implements OnInit, Fractals.MaxZoomListner {
  // component config
  @Input() width: string = "300";
  @Input() height: string = "200";
  @Input() theme: string = "fractal-black";
  @Input() maximized: string = "false";
  // Fractal config
  @Input() equation: string;
  @Input() color: string;
  @Input() iterations: string = "50";
  @Input() complexCenter: string = "-0.8, 0";
  @Input() complexWidth: string = "3";
  @Input() complexJuliaPicker: string = "0,0";

  @ViewChild('explorer') readonly HTMLexplorer: ElementRef;
  @ViewChild('mainFractalView') readonly mainFractalView: FractalViewComponent;
  @ViewChild('juliaPicker') readonly HTMLjuliaPicker: JuliaPickerComponent;
  @ViewChild('juliaPickerDiv') readonly HTMLjuliaPickerDiv: ElementRef;
  @ViewChild('juliaPullOut') readonly HTMLjuliaPullOut: ElementRef;
  @ViewChild('alert') readonly HTMLalert: ElementRef;
  @ViewChild('iterationControls') readonly HTMLiterationControls: ElementRef;
  @ViewChild('colorControls') readonly HTMLcolorControls: ElementRef;
  @ViewChild('zoomControls') readonly HTMLzoomControls: ElementRef;
  @ViewChild('fullScreenControls') readonly HTMLfullScreenControls: ElementRef;
  @ViewChild('eyeControls') readonly HTMLeyeControls: ElementRef;
  @ViewChild('colourSelect') readonly HTMLcolourSelect: ElementRef;
  @ViewChild('gradientBuilder') readonly HTMLgradientBuilder: ElementRef;
  @ViewChild('jscolor') readonly HTMLjscolor: ElementRef;
  @ViewChild('histogram') readonly HTMLhistogram: HistogramComponent;
  @ViewChild('gradient') readonly HTMLgradient: GradientBuilderComponent;
  @ViewChild('colorPullDown') readonly HTMLcolorPullDown: ElementRef;
  @ViewChild('histogramdiv') readonly HTMLhistogramdiv: ElementRef;
  @ViewChild('gradientdiv') readonly HTMLgradientdiv: ElementRef;
  @ViewChild('colorPullDownCaret') readonly HTMLcolorPullDownCaret: ElementRef;
  @ViewChild('saveButton') readonly HTMLsaveButton: ElementRef;
  @ViewChild('eqSelect') readonly HTMLeqSelect: ElementRef;
  @ViewChild('downloadReadyAlert') readonly HTMLdownloadReadyAlert: ElementRef;
  @ViewChild('saveSelect') readonly HTMLsaveSelect: ElementRef;
  @ViewChild('saveIcon') readonly HTMLsaveIcon: ElementRef;
  @ViewChild('shareSelect') readonly HTMLshareSelect: ElementRef;
  @ViewChild('shareButton') readonly HTMLshareButton: ElementRef;
  readonly colorBW: string = '{"phase":0,"frequency":1,"min":0,"mid":0.5,"max":1,"arr":[{"stop":0,"color":{"r":0,"g":0,"b":0}},{"stop":1,"color":{"r":255,"g":255,"b":255}}]}'
  readonly colorRainbow: string = '{"phase":0,"frequency":1,"min":0,"mid":0.5,"max":1,"arr":[{"stop":0,"color":{"r":255,"g":0,"b":0}},{"stop":0.166,"color":{"r":255,"g":100,"b":0}},{"stop":0.332,"color":{"r":249,"g":255,"b":0}},{"stop":0.498,"color":{"r":0,"g":255,"b":13}},{"stop":0.664,"color":{"r":0,"g":67,"b":255}},{"stop":0.830,"color":{"r":133,"g":0,"b":255}},{"stop":1,"color":{"r":255,"g":0,"b":215}}]}'
  readonly colorBlueGold: string = '{"phase":0,"frequency":1,"min":0,"mid":0.5,"max":1,"arr":[{"stop":0,"color":{"r":0,"g":51,"b":255}},{"stop":0.8041666666666667,"color":{"r":255,"g":200,"b":0}},{"stop":1,"color":{"r":255,"g":115,"b":0}}]}';
  readonly colorBlackBlue: string = '{"phase":0,"frequency":1,"min":0.04325513196480939,"mid":0.5,"max":1,"arr":[{"stop":0,"color":{"r":0,"g":0,"b":0}},{"stop":0.21994134897360704,"color":{"r":0,"g":51,"b":255}},{"stop":0.49560117302052786,"color":{"r":255,"g":200,"b":0}},{"stop":1,"color":{"r":255,"g":255,"b":255}}]}'
  readonly colorCell: string = '{"phase":0,"frequency":1,"min":0,"mid":0.43328445747800587,"max":1,"arr":[{"stop":0,"color":{"r":0,"g":0,"b":0}},{"stop":0.1590909090909091,"color":{"r":0,"g":0,"b":0}},{"stop":0.16715542521994134,"color":{"r":89,"g":255,"b":225}},{"stop":0.17668621700879766,"color":{"r":0,"g":0,"b":0}},{"stop":0.30058651026392963,"color":{"r":74,"g":104,"b":255}},{"stop":0.5175953079178885,"color":{"r":18,"g":255,"b":0}},{"stop":1,"color":{"r":255,"g":255,"b":255}}]}'
  readonly colorBlob: string = '{"phase":0,"frequency":1,"min":0,"mid":0.36363636363636365,"max":1,"arr":[{"stop":0,"color":{"r":255,"g":255,"b":255}},{"stop":0.1495601173020528,"color":{"r":255,"g":255,"b":255}},{"stop":0.16715542521994134,"color":{"r":0,"g":0,"b":0}},{"stop":0.18841642228739003,"color":{"r":255,"g":255,"b":255}},{"stop":0.30058651026392963,"color":{"r":255,"g":0,"b":0}},{"stop":0.5175953079178885,"color":{"r":255,"g":110,"b":63}},{"stop":1,"color":{"r":255,"g":221,"b":0}}]}'
  readonly colorCrystal: string = '{"phase":0,"frequency":1,"min":0.2653958944281525,"mid":0.4868035190615836,"max":1,"arr":[{"stop":0,"color":{"r":0,"g":0,"b":0}},{"stop":0.001466275659824047,"color":{"r":0,"g":0,"b":0}},{"stop":0.4897360703812317,"color":{"r":250,"g":255,"b":115}},{"stop":1,"color":{"r":106,"g":103,"b":255}}]}'
  
  private explorerCSSHeight;
  private explorerWindowStyle: string;
  private jscolorWindowStyle: string;
  private fractal: Fractals.Fractal;
  private juliaFractal: Fractals.Fractal;
  private explorerWindowIsMaximised: boolean = false;
  private iterationsAreChanging: boolean = false;
  private zoomGestureHappening: boolean = false;
  private static readonly htmlClassForFaEyeOpen: string = "fa fa-eye"
  private static readonly htmlClassForFaEyeClosed: string = "fa fa-eye-slash"

  public imageToDownload: string = null;
  public alertText: string;
  public NumIterations: number = 50;

  constructor() { }

  ngOnInit() {
    this.HTMLexplorer.nativeElement.style.width = this.width.toString();
    this.HTMLexplorer.nativeElement.style.height = this.height.toString();
    this.explorerCSSHeight = getComputedStyle(this.HTMLexplorer.nativeElement).height;

    let centerArr = this.complexCenter.split(",");
    let centerR = parseFloat(centerArr[0]);
    let centerI = parseFloat(centerArr[1]);
    let complexCenter = new ComplexNumber(centerR, centerI);

    let complexWidth = parseFloat(this.complexWidth);

    this.NumIterations = parseInt(this.iterations)

    let colorCommandString = this.colorBlueGold;
    let gradient = new FractalColor.LinearGradient();
    gradient.decodeJSON(colorCommandString)
    // if (this.color != undefined) {
    //   if (this.color == "rainbow") {
    //     colorCommandString = this.colorRainbow;
    //     this.HTMLcolourSelect.nativeElement.value = this.colorRainbow;
    //   }
    //   if (this.color == "B/W") {
    //     colorCommandString = this.colorBW;
    //     this.HTMLcolourSelect.nativeElement.value = this.colorBW;
    //   }
    // }

    let fractalEq = FractalEquations.mandelbrot;
    if (this.equation == "mandelbrot") {
      fractalEq = FractalEquations.mandelbrot;
    }
    if (this.equation == "burningShip") {
      fractalEq = FractalEquations.burningShip;
    }
    if (this.equation == "julia") {
      fractalEq = FractalEquations.julia;
    }

    let canvas = <HTMLCanvasElement>this.mainFractalView.getCanvas();
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;

    this.fractal = new Fractals.Fractal(new Fractals.ComplexPlain(complexCenter.r, complexCenter.i, complexWidth, canvas), new fractalEq, gradient);
    this.fractal.iterations = this.NumIterations;
    this.fractal.setMaxZoomListener(this);

    this.mainFractalView.setFractal(this.fractal);
    this.fractal.render();

    this.HTMLjuliaPickerDiv.nativeElement.style.width = "0px";
    this.HTMLjuliaPullOut.nativeElement.style.display = "none"

    if (this.maximized == "true") {
      this.explorerWindowIsMaximised = true;
      this.fullScreenWindow()
    }
  }

  /*
  * User triggerable functions \/
  */

  download() {
    this.HTMLdownloadReadyAlert.nativeElement.style.visibility = "hidden";
    this.HTMLsaveIcon.nativeElement.setAttribute("class", "fa fa-save");
    this.HTMLsaveSelect.nativeElement.setAttribute("class", "select");
    this.HTMLsaveSelect.nativeElement.disabled = false;
  }

  save(event) {
    this.HTMLsaveIcon.nativeElement.setAttribute("class", "fa fa-save disabled");
    this.HTMLsaveSelect.nativeElement.setAttribute("class", "select disabled");
    this.HTMLsaveSelect.nativeElement.disabled = true;
    let width = 1920
    let height = 1080
    switch (event.target.value) {
      case "HD 1920×1080":
        width = 1920
        height = 1080
        break;
      case "2K 2048×1080":
        width = 2248
        height = 1080
        break;
      case "4K 4096×2160":
        width = 4096
        height = 2160
        break;
      case "8k 7680×4320":
        width = 7680
        height = 4320
        break;
      case "16k 15360×8640":
        width = 15360
        height = 8640
        break;
    }

    var element = {
      base: <Fractals.ChangeObserver>{
        explorer: this,
        changed(fractal: Fractals.Fractal) {
          fractal.unsubscribe(element.base)
          this.explorer.imageToDownload = fractal.complexPlain.getViewCanvas().toDataURL("image/jpeg");
          this.explorer.downloadReady()
        }
      }
    }
    let img = this.mainFractalView.downloadImage(width, height, element.base);

    (<HTMLSelectElement>this.HTMLsaveSelect.nativeElement).selectedIndex = 0
  }

  share(event) {
    let content = "http://leesavage.co.uk/";
    let service = null

    switch (event.target.value) {
      case "facebook":
        service = "http://www.facebook.com/sharer.php?u=" + content
        break;
      case "fb-messenger":
        service = "fb-messenger:share/?link=" + content
        break;
      case "whatsapp":
        service = "whatsapp://send?text=" + content
        break;
      case "twitter":
        service = "https://twitter.com/share?url=" + content
        break;
      case "linkedin":
        service = "http://www.linkedin.com/shareArticle?mini=true&amp;url=" + content
        break;
      case "plus.google":
        service = "https://plus.google.com/share?url=" + content
        break;
      case "mailto":
        service = "mailto:?Body=" + content;
        break;
    }

    if (service != null) window.open(service);
    else window.open(content);

    (<HTMLSelectElement>this.HTMLshareSelect.nativeElement).selectedIndex = 0
  }

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


  toggleJuliaPullOut() {
    if (this.HTMLjuliaPickerDiv.nativeElement.style.width == "0px") {
      this.HTMLjuliaPickerDiv.nativeElement.style.width = "200px"
      if (!this.HTMLjuliaPicker.hasInit) this.HTMLjuliaPicker.init(this.fractal.getColor(), this.NumIterations, this.complexJuliaPicker);
      this.HTMLjuliaPicker.getFractalView().sizeChanged();
    }
    else if (this.HTMLjuliaPickerDiv.nativeElement.style.width == "200px") {
      this.HTMLjuliaPickerDiv.nativeElement.style.width = "0px"
    }
  }

  toggleColorPullDown(event) {
    if (this.HTMLhistogramdiv.nativeElement.style.display == "block") {
      this.HTMLgradient.setGradient(null);
      this.HTMLhistogram.setFractal(null);
      this.HTMLcolorPullDown.nativeElement.style.height = 0;
      this.HTMLhistogramdiv.nativeElement.style.display = "none";
      this.HTMLgradientdiv.nativeElement.style.display = "none";
      this.HTMLcolorPullDownCaret.nativeElement.setAttribute("class", "fa fa-caret-down");

    } else {
      this.HTMLcolorPullDown.nativeElement.style.height = this.explorerCSSHeight;
      this.HTMLhistogramdiv.nativeElement.style.display = "block";
      this.HTMLgradientdiv.nativeElement.style.display = "block";
      this.HTMLgradient.setGradient(this.fractal.getColor());
      this.HTMLhistogram.setFractal(this.fractal);
      this.HTMLcolorPullDownCaret.nativeElement.setAttribute("class", "fa fa-caret-up");
    }
    this.mainFractalView.sizeChanged();
  }

  onEqChanged(event) {
    let eqString = event.target.value;
    if (eqString == "mandelbrot") {
      this.fractal.complexPlain.replaceView(-0.8, 0, 3, <HTMLCanvasElement>this.mainFractalView.getCanvas())
      this.fractal.setCalculationFunction(new FractalEquations.mandelbrot);
    }
    else if (eqString == "burningShip") {
      this.fractal.complexPlain.replaceView(-0.5, -0.5, 3, <HTMLCanvasElement>this.mainFractalView.getCanvas())
      this.fractal.setCalculationFunction(new FractalEquations.burningShip);
    }

    if (eqString == "julia") {
      this.fractal.complexPlain.replaceView(0, 0, 20, <HTMLCanvasElement>this.mainFractalView.getCanvas())
      this.fractal.setCalculationFunction(new FractalEquations.julia);
      this.HTMLjuliaPullOut.nativeElement.style.display = "block"
    }
    else {
      this.HTMLjuliaPullOut.nativeElement.style.display = "none"
    }
    (<HTMLSelectElement>this.HTMLeqSelect.nativeElement).selectedIndex = 0
    this.fractal.render();
  }

  onColorChanged(event) {
    this.fractal.getColor().decodeJSON(event.target.value);
    this.fractal.getColor().notify(null);
    (<HTMLSelectElement>this.HTMLcolourSelect.nativeElement).selectedIndex = 0
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
    let canvas = <HTMLCanvasElement>this.mainFractalView.getCanvas();
    this.fractal.getAnimator().zoomStart(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 0.5, 200);
  }

  zoomInClick(event) {
    let canvas = <HTMLCanvasElement>this.mainFractalView.getCanvas();
    this.fractal.getAnimator().zoomStart(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 2, 200);
  }

  toggelEye() {
    if (this.HTMLeyeControls.nativeElement.className == ExplorerComponent.htmlClassForFaEyeOpen) {
      this.HTMLeyeControls.nativeElement.className = ExplorerComponent.htmlClassForFaEyeClosed;
      this.HTMLfullScreenControls.nativeElement.style.visibility = "visible";
      this.HTMLzoomControls.nativeElement.style.visibility = "visible";
      this.HTMLcolorControls.nativeElement.style.visibility = "visible";
      this.HTMLiterationControls.nativeElement.style.visibility = "visible";
      this.HTMLcolorPullDown.nativeElement.style.visibility = "visible";
      this.HTMLjuliaPullOut.nativeElement.style.visibility = "visible";
      this.HTMLsaveButton.nativeElement.style.visibility = "visible";
      this.HTMLshareButton.nativeElement.style.visibility = "visible";
    }
    else {
      this.HTMLeyeControls.nativeElement.className = ExplorerComponent.htmlClassForFaEyeOpen;
      this.HTMLfullScreenControls.nativeElement.style.visibility = "hidden";
      this.HTMLzoomControls.nativeElement.style.visibility = "hidden";
      this.HTMLcolorControls.nativeElement.style.visibility = "hidden";
      this.HTMLiterationControls.nativeElement.style.visibility = "hidden";
      this.closeAllPullOuts();
      this.HTMLcolorPullDown.nativeElement.style.visibility = "hidden";
      this.HTMLsaveButton.nativeElement.style.visibility = "hidden";
      this.HTMLjuliaPullOut.nativeElement.style.visibility = "hidden";
      this.HTMLshareButton.nativeElement.style.visibility = "hidden";
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
      this.mainFractalView.sizeChanged();
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
    this.fractal.iterations = this.NumIterations;
    this.HTMLjuliaPicker.setIterations(this.NumIterations);
    this.fractal.render();
  }

  /*
  * Callbacks
  */

  maxZoomReached() {
    this.fractal.deleteMaxZoomListener();
    this.alertText = "You have reached the max zoom, What you can see are floting point errors as the diffrences between the numbers are so small!";
    this.HTMLalert.nativeElement.style.visibility = "visible";
  }

  juliaNumberChanged(center: ComplexNumber) {    
    let fun = this.fractal.getCalculationFunction();
    if (fun instanceof FractalEquations.julia) {
      (<FractalEquations.julia>fun).juliaReal = center.r;
      (<FractalEquations.julia>fun).juliaImaginary = center.i;
      this.fractal.render();
    }
  }

  downloadReady() {
    this.HTMLdownloadReadyAlert.nativeElement.style.visibility = "visible";
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
        self.NumIterations = Math.ceil(self.NumIterations * i)
      } else {
        self.NumIterations = Math.floor(self.NumIterations * i)
      }

      if (self.NumIterations < 1) {
        self.NumIterations = 1;
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
    this.mainFractalView.sizeChanged();
  }

  private closeAllPullOuts() {
    if (this.HTMLhistogramdiv.nativeElement.style.display == "block") {
      this.toggleColorPullDown(null)
    }
    if (this.HTMLjuliaPickerDiv.nativeElement.style.width == "200px") {
      this.toggleJuliaPullOut();
    }
  }

}
