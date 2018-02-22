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
  @Input() titleStr: string = "title";
  @Input() textStr: string = "text";
  @Input() closeStr: string = "close";
  @Input() yesStr: string = "yes";
  @Input() noStr: string = "no";
  @Input() inputStr: string = "no";
  @ViewChild('close') closeElm: ElementRef;
  @ViewChild('yes') yesElm: ElementRef;
  @ViewChild('no') noElm: ElementRef;
  @ViewChild('input') inputElm: ElementRef;
  
  private callback: Function;
  private juliaFractal: Fractals.Fractal = null;
  
  public readonly CLOSE = 'close'
  public readonly YES = 'yes'
  public readonly NO = 'no'
  public yesHREF: string

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

  enableOptions(close: boolean, yes: boolean, no: boolean, input: boolean) {
    if (close) this.closeElm.nativeElement.style.display = 'inline-block'
    else this.closeElm.nativeElement.style.display = 'none'

    if (yes) this.yesElm.nativeElement.style.display = 'inline-block'
    else this.yesElm.nativeElement.style.display = 'none'

    if (no) this.noElm.nativeElement.style.display = 'inline-block'
    else this.noElm.nativeElement.style.display = 'none'

    if (input) {
      this.inputElm.nativeElement.style.display = 'block'
    }
    else this.inputElm.nativeElement.style.display = 'none'
  }

  setCallback(f: Function) {
    this.callback = f;
  }

  setYesHref(s: string) {
    this.yesHREF = s;
  }

  selectInput() {
    this.inputElm.nativeElement.focus();
    this.inputElm.nativeElement.select();
  }


}
