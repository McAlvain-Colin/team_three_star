import { Component, Input, OnInit, DoCheck, OnChanges } from '@angular/core';
import { DeviceElement } from '../app.component';
import { ChartService } from '../chart.service';
import { Chart } from 'chart.js/auto';
@Component({
  selector: 'app-device-table',
  templateUrl: './device-table.component.html',
  styleUrls: ['./device-table.component.css'],
  providers: [ChartService]
})
export class DeviceTableComponent implements OnInit, OnChanges{
  @Input() Devicelist!: DeviceElement [];

  showSpinner: boolean = false;
  tempDevice!: DeviceElement;
  typeOfChart!: string;
  
  constructor(private chart: ChartService){}

  ngOnInit(): void 
  {
    //ensuring that the deviec sent as a parameter is not undefined at initialization
    this.tempDevice = this.Devicelist[0];
    this.typeOfChart = 'packetLoss'

    console.log('oninit is called');
    this.chart.createPktLossChart(this.Devicelist[0]);
    
  }

  ngOnChanges(): void 
  {
    console.log('onChanges is called'); 
  }
  
  
  //when a row in a table is clicked, this function will be called, updating the data on chart
  viewDeviceHealth(row: DeviceElement)
  {
    console.log('inside of viewDeviceHealth');
    console.log(row);
    this.tempDevice = row;
    this.chart.updateChartData(row, this.typeOfChart);
  }

  viewDevicePktloss()
  {
    this.typeOfChart = 'packetLoss';
    //this.chart.updateChartData(this.tempDevice, this.typeOfChart);
    this.chart.createPktChart(this.tempDevice);
  }

  viewDeviceBattery()
  {
    this.chart.createBarChart(this.tempDevice);
    this.typeOfChart = 'batteryStat';

  }
  loadSpinner() {
    this.showSpinner = true;
    setTimeout(() =>{this.showSpinner = false}, 250)
  }


}
