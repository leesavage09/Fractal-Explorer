import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ExplorerComponent } from "./explorer/explorer.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.demo.html",
  styleUrls: []
})
export class AppDemo {
  @ViewChild('configComponent') configComponent: ExplorerComponent;

  ngAfterContentInit() {
    var host = location.protocol + "//" + window.location.hostname + ":" + location.port + "/?"
    let st = decodeURI(window.location.href)
    st = st.replace(host, "");
    let arr = st.split('&');

    let result: Array<Array<string>> = new Array();
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];
      result.push(element.split('='));
    }

    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      if (element[0] == "theme") {
        this.configComponent.theme = element[1];
      }
      if (element[0] == "equation") {
        this.configComponent.equation = element[1];
      }
      if (element[0] == "color") {
        this.configComponent.color = element[1];
      }
      if (element[0] == "iterations") {
        this.configComponent.iterations = element[1];
      }
      if (element[0] == "complexCenter") {
        this.configComponent.complexCenter = element[1];
      }
      if (element[0] == "complexWidth") {
        this.configComponent.complexWidth = element[1];
      }
      if (element[0] == "complexJuliaPicker") {
        this.configComponent.complexJuliaPicker = element[1];
      }
    }
  }
}