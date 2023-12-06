import { Component, Input, OnInit } from '@angular/core';
import { DeviceElement } from '../dashboard/dashboard.component';
import { Chart } from 'chart.js/auto';

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

  chart!: Chart;
  
  chartData!: number[];

  createInitLineChart(device: DeviceElement)
  { 
    this.chartData = device.packetLoss;
    console.log('inside create pkt ');

    this.chart = new Chart("myChart", 
    {
      type: 'line',
      data: {
        labels: device.time,
        datasets: [{
          label: 'Packet Loss',
          data: device.packetLoss
        }]
          //removing this line will result in the chart reamining at the lowest window size that was opened
      }, 
      options: {
        maintainAspectRatio: false
      },
      plugins: [{
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
          const {
            ctx
          } = chart;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        }
      }]
    });
  }

  updateChartData(row: DeviceElement, typeOfChart: string)
  {
    if(row !== undefined)
    {
      if(typeOfChart === 'packetLoss')
      {
        this.chart.data.datasets[0].data = row.packetLoss;
        
      }
      else if(typeOfChart === 'batteryStat')
      {
        this.chart.data.datasets[0].data = row.batteryStat;

      }
      else if(typeOfChart === 'rssi')
      {
        this.chart.data.datasets[0].data = row.RSSI;
      }
      else if(typeOfChart === 'snr')
      {
        this.chart.data.datasets[0].data = row.SNR;
      }
      this.chart.update();
    }
  }

  createBarChart(device: DeviceElement)
  {   
    console.log('inside of createBarChart'); 
    console.log(device); 
    this.chartData = device.batteryStat;
    console.log(this.chartData);

    this.chart.destroy();
    
    this.chart = new Chart("myChart", 
    {
      type: 'bar',
      data: {
        labels: device.time,
        datasets: [{
          label: 'Battery',
          data: device.batteryStat
        }]
      }, 
      options: {
        maintainAspectRatio: false
      },
      plugins: [{
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
          const {
            ctx
          } = chart;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        }
      }]
    });
  }

  createScatterChart(device: DeviceElement)
  {   
    console.log('inside of createBarChart'); 
    console.log(device); 
    this.chartData = device.batteryStat;
    console.log(this.chartData);

    this.chart.destroy();
    
    this.chart = new Chart("myChart", 
    {
      type: 'scatter',
      data: {
            labels: device.time,
            datasets: [{
              label: 'dBm',
              data: device.RSSI
            }]
      }, 
      options: {
        maintainAspectRatio: false
      },
      plugins: [{
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
          const {
            ctx
          } = chart;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        }
      }]
    });
  }
  createLineChart(device: DeviceElement)
  {   
    console.log('inside of createBarChart'); 
    console.log(device); 
    this.chartData = device.batteryStat;
    console.log(this.chartData);

    this.chart.destroy();
    
    this.chart = new Chart("myChart", 
    {
      type: 'line',
      data: {
            labels: device.time,
            datasets: [{
              label: 'Packet Loss',
              data: device.packetLoss
            }]
      }, 
      options: {
        maintainAspectRatio: false
      },
      plugins: [{
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
          const {
            ctx
          } = chart;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        }
      }]
    });
  }

  createSNRChart(device: DeviceElement)
  {   
    console.log('inside of createBarChart'); 
    console.log(device); 
    this.chartData = device.batteryStat;
    console.log(this.chartData);

    this.chart.destroy();
    
    this.chart = new Chart("myChart", 
    {
      type: 'line',
      data: {
            labels: device.distance,
            datasets: [{
              label: 'dBm',
              data: device.SNR // add here
            }]
      }, 
      options: {
        maintainAspectRatio: false
      },
      plugins: [{
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
          const {
            ctx
          } = chart;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        }
      }]
    });
  }



  ngOnInit()
  {
    //ensuring that the device sent as a parameter is not undefined at initialization
    this.tempDevice = this.Devicelist[0];
    this.typeOfChart = 'packetLoss'

    console.log('oninit is called');
    this.createInitLineChart(this.Devicelist[0]);
    
  }
  
  //when a row in a table is clicked, this function will be called, updating the data on chart
  viewDeviceHealth(row: DeviceElement)
  {
    console.log('inside of viewDeviceHealth');
    console.log(row);
    this.tempDevice = row;
    this.updateChartData(row, this.typeOfChart);
  }

  viewDevicePktloss()
  {
    this.typeOfChart = 'packetLoss';
    //this.chart.updateChartData(this.tempDevice, this.typeOfChart);
    this.createLineChart(this.tempDevice);
  }

  viewGatewayRSSI()
  {
    this.typeOfChart = 'rssi';
    //this.chart.updateChartData(this.tempDevice, this.typeOfChart);
    this.createScatterChart(this.tempDevice);
  }

  viewGatewaySNR()
  {
    this.typeOfChart = 'snr';
    this.createSNRChart(this.tempDevice);
  }


  viewDeviceBattery()
  {
    this.createBarChart(this.tempDevice);
    this.typeOfChart = 'batteryStat';

  }
  loadSpinner() 
  {
    this.showSpinner = true;
    setTimeout(() =>{this.showSpinner = false}, 250)
  }

  getDownload()
  {
    let link = document.createElement('a');
    link.href = this.chart.toBase64Image();
    link.download = 'chart.png';
    link.click();
  }

}
