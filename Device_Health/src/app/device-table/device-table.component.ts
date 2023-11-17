import { Component, Input, OnInit } from '@angular/core';
import { DeviceElement } from '../app.component';
import { ChartService } from '../chart.service';

@Component({
  selector: 'app-device-table',
  templateUrl: './device-table.component.html',
  styleUrls: ['./device-table.component.css'],
  providers: [ChartService]
})
export class DeviceTableComponent implements OnInit {
  @Input() Devicelist!: DeviceElement [];

  showSpinner: boolean = false;
  
  constructor(private chart: ChartService){}

  ngOnInit(): void {
    this.chart.createChart();
  }
  
  viewDeviceHealth(row: DeviceElement)
  {
    this.chart.updateChartData(row);
  }

  loadData() {
    this.showSpinner = true;
    setTimeout(() =>{this.showSpinner = false}, 1000)
  }


}
