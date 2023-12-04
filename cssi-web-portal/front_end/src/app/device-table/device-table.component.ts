import { Component, Input, OnInit } from '@angular/core';
import { DeviceElement } from '../app.component';
import { ChartService } from '../chart.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-device-table',
    templateUrl: './device-table.component.html',
    styleUrls: ['./device-table.component.css'],
    providers: [ChartService],
    standalone: true,
    imports: [
        MatCardModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatButtonModule,
        NgIf,
        MatProgressSpinnerModule,
        PercentPipe,
    ],
})
export class DeviceTableComponent implements OnInit {
  @Input() Devicelist!: DeviceElement[];

  showSpinner: boolean = false;
  tempDevice!: DeviceElement;
  typeOfChart!: string;

  constructor(private chart: ChartService) {}

  ngOnInit(): void 
  {
    //ensuring that the device sent as a parameter is not undefined at initialization
    this.tempDevice = this.Devicelist[0];
    this.typeOfChart = 'packetLoss'

    console.log('oninit is called');
    this.chart.createInitLineChart(this.Devicelist[0]);
    
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
    this.chart.createLineChart(this.tempDevice);
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
