import { Injectable } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DeviceElement } from './app.component';
@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  chart!: Chart;

  createChart(): Chart
  {
    this.chart = new Chart("myChart", 
                    {
                      type: 'line',
                      data: {
                        labels: ['11/17/23', '11/18/23', '11/19/23', '11/20/23', '11/21/23', '11/22/23', '11/23/23'],
                        datasets: [{
                          label: 'packet loss',
                          data: [1.5, 2, 4, 2, 4, 2,1,2]
                        }]
                      }
                    });
    return this.chart;
  }

  updateChartData(row: DeviceElement)
  {
    this.chart.data.datasets[0].data = row.packetLoss;
    this.chart.update();
  }

  updateChartType(chartType: string) 
  {
    // this.chart = 
  }

}
