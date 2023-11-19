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

  createPktLossChart(device: DeviceElement): Chart
  {

    this.chart = new Chart("myChart", 
                    {
                      type: 'line',
                      data: {
                        labels: device.time,
                        datasets: [{
                          label: 'packet loss',
                          data: device.packetLoss
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

  toBarChart(device: DeviceElement)
  {
   // this.chart.destroy();
    this.chart = new Chart("myChart", {
                            type: 'bar',
                            data: {
                              labels: device.time,
                              datasets: [{
                                //label: '# of Votes',
                                data: device.batteryStat,
                                borderWidth: 1
                              }]
                            },
                            options: {
                              scales: {
                                y: {
                                  beginAtZero: true
                                }
                              }
                            }
                          });
   
  }

}
