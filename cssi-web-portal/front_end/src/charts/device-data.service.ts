import { Injectable } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DeviceData } from '../app/app.component';

@Injectable({
  providedIn: 'root'
})
export class DeviceDataService {

  constructor() { }

  chart!: Chart;

  createPktLossChart(device: DeviceData): Chart {
    this.chart = new Chart('myChart', {
      type: 'line',
      data: {
        labels: ['1', '2', '3', '4'], //device.time,
        datasets: [
          {
            label: 'packet loss',
            data: [1, 2, 3, 4], //device.packetLoss,
          },
        ],
      },
    });
    return this.chart;
  }

  updateChartData(row: DeviceData) {
    // this.chart.data.datasets[0].data = row.DataName;
    // this.chart.update();
  }

  toBarChart(device: DeviceData) {
    // this.chart.destroy();
    this.chart = new Chart('myChart', {
      type: 'bar',
      data: {
        labels: device.time,
        datasets: [
          {
            //label: '# of Votes',
            data: device.DataValue,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}
