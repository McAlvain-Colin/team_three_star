import { Component, Input, OnInit } from '@angular/core';
import { DeviceElement } from '../app.component';
import { ChartService } from '../chart.service';

@Component({
  selector: 'app-device-stats',
  templateUrl: './device-stats.component.html',
  styleUrls: ['./device-stats.component.css'],
  providers: [ChartService,]
})
export class DeviceStatsComponent implements OnInit {
  @Input() Devicelist!: DeviceElement [];

  showSpinner: boolean = false;
  tempDevice!: DeviceElement;
  
  constructor(private chart: ChartService){}

  ngOnInit(): void {
    this.chart.createPktLossChart(this.Devicelist[0]);
  }
  
  viewDeviceHealth(row: DeviceElement)
  {
    this.tempDevice = row;
    this.chart.updateChartData(row);
  }

  viewDevicePktloss()
  {
    this.chart.updateChartData(this.tempDevice);
  }

  viewDeviceBattery()
  {
    this.chart.toBarChart(this.tempDevice);
  }
  loadSpinner() {
    this.showSpinner = true;
    setTimeout(() =>{this.showSpinner = false}, 250)
  }


}
