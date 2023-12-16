import { Injectable } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DeviceData } from '../app/app.component';

@Injectable({
  providedIn: 'root'
})
export class DeviceDataService {

  constructor() { }

  chart!: Chart;
  chartLabels!: string[];
  chartData!: number[];

  createSensorDataChart(device: DeviceData): Chart  { 
    this.chart = new Chart("dataChart", {
      type: 'line',
      data: {
        labels: device.time, //device.time,
        datasets: [
          {
            label:device.DataName,
            data: device.DataValue, //device.dataValue
          },
        ],
      },options: {maintainAspectRatio: false}
    });
    return this.chart;
  }

  updateChartData(row: DeviceData)
  {
    this.chart.data.datasets[0].label = row.DataName
    this.chart.data.datasets[0].data = row.DataValue;
    this.chart.update();
  }

  getDownload()
  {
    let link = document.createElement('a');
    link.href = this.chart.toBase64Image();
    link.download = 'dataChart.png';
    link.click();
  }
}
