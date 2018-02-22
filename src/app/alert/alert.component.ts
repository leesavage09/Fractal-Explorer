import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { Fractals } from "../../fractal/fractal.module";
import { FractalColor, FractalHistogram } from "../../fractal/fractalColouring";
import { General } from "../../helper/helper.module";
import { FractalEquations } from "../../fractal/fractalEquations.module"
import { ComplexNumber } from '../../fractal/complexNumbers';
import { FractalViewComponent } from '../fractalView/fractalView.component';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: []
})
export class AlertComponent {
  private juliaFractal: Fractals.Fractal = null;
  @Input() titleStr: string = "title";
  @Input() textStr: string = "text";
  @Input() closeStr: string = "close";
  @Input() yesStr: string = "yes";
  @Input() noStr: string = "no";
  @ViewChild('close') closeElm: ElementRef;
  @ViewChild('yes') yesElm: ElementRef;
  @ViewChild('no') noElm: ElementRef;

  private callback: Function;
  private yesHREF:string

  public readonly CLOSE = 'close'
  public readonly YES = 'yes'
  public readonly NO = 'no'

  //@Output() response = new EventEmitter<string>();

  constructor() {
  }

  closeClick() {
    this.callback(this.CLOSE)
  }

  yesClick() {
    this.callback(this.YES)
  }
  
  noClick() {
    this.callback(this.NO)
  }

  enableOptions(close:boolean,yes:boolean,no:boolean) {
    if (close) this.closeElm.nativeElement.style.display = 'inline-block'
    else  this.closeElm.nativeElement.style.display = 'none'

    if (yes) this.yesElm.nativeElement.style.display = 'inline-block'
    else  this.yesElm.nativeElement.style.display = 'none'

    if (no) this.noElm.nativeElement.style.display = 'inline-block'
    else  this.noElm.nativeElement.style.display = 'none'
  }

  setCallback(f:Function){
    this.callback = f;
  }

  setYesHref(s:string) {
    this.yesHREF = s;
  }


}
