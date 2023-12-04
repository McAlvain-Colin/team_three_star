import { Injectable } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DeviceElement } from './app.component';
import { startWith } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  chart!: Chart;
  chartLabels!: string[];
  chartData!: number[];

  createInitLineChart(device: DeviceElement)
  { 
    this.chartData = device.packetLoss;
    console.log('inside create pkt ');
    //this.chart.destroy();

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
      }, options: {maintainAspectRatio: false}
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
          }, options: {maintainAspectRatio: false}
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
          }, options: {maintainAspectRatio: false}
    });
  }
}