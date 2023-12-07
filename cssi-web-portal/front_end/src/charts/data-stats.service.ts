import { Injectable } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DataStats } from '../app/app.component';

@Injectable({
  providedIn: 'root'
})
export class DataStatsService {

  constructor() { }

  chart!: Chart;
  chartLabels!: string[];
  chartData!: number[];

  createStatsChart(device: DataStats): Chart  { 
    this.chart = new Chart("statsChart", {
      type: 'bar',
      data: {
        labels: device.time,
        datasets: [
          {
            label: 'Mean',
            data: device.mean,
          },
          {
            label: 'Variance',
            data: device.variance,
          },
          {
            label: 'Standard Deviation',
            data: device.standardDeviation,
          },
        ],
      },options: {maintainAspectRatio: false}
    });
    return this.chart;
  }

  updateChartData(row: DataStats)
  {
    this.chart.data.datasets[0].data = row.mean;
    this.chart.data.datasets[1].data = row.variance;
    this.chart.data.datasets[2].data = row.standardDeviation;
    this.chart.update();
  }

  calculateAve(array: number[]): number {
    var total: number= 0;

    for(var i = 0; i < array.length; i++){
      total = total + array[i]
    }
    var avg = total/array.length
    return avg
  }

  getDownload()
  {
    let link = document.createElement('a');
    link.href = this.chart.toBase64Image();
    link.download = 'dataChart.png';
    link.click();
  }
}