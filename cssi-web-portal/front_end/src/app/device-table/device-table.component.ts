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
  providers: [],
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
// The DeviceTable component will recieve data from the dashboard component using the input decorator and will be placed in the
// variable DeviceElement array, here a boolean variable showSpinner is initialized to indicate whether the spinner should appear in the webpage.
// tempdevice is used to keep track of which device has been currently selected by the user from a row in the table.
// chart is declared here to keep track of which visualization should be displayed to the user depending on the selected option and device.
// typeOfChart varible will keep track of what type of chart the user has selcted to be visualized.
// Chartdata array was used to debug and checking whether the parameter when executing methods was able to alter the values within the array, this result was consistently 
// used for logging to the console for debugging purposes.
export class DeviceTableComponent implements OnInit {
  @Input() Devicelist!: DeviceElement[];

  showSpinner: boolean = false;
  tempDevice!: DeviceElement;
  typeOfChart!: string;

  chart!: Chart;

  chartData!: number[];

//createInitLineChart method was upon the intial loading of the dashboard, the chart would be initialized and would have the values retrieved from the first device within the devicelist 
//which was recieved using the input decorator. The chart consists from the Chart class from the Chart.JS library which was imported using "npm install chart.js", at the time of installation fro prototype, the newest
//version of ChartJS was 4.4.0, if no longer the newest version, use command "npm install chart.js@4.4.0". This function will create an line chart with the packet loss data present in the first device in our list.
//structure for initization was found in the Chart.JS documentation https://www.chartjs.org/docs/4.4.0/charts/line.html , and for chart white background, used in the plugin section, and examples were used from Chart.JS documentation 
//which can be found here: https://www.chartjs.org/docs/4.4.0/configuration/canvas-background.html in the options attribute of the chart object the maintainAspectRatio property is set to fasle to allow for the chart to change as the window size changes.

  createInitLineChart(device: DeviceElement) {
    this.chartData = device.packetLoss;
    console.log('inside create pkt ');

    this.chart = new Chart('myChart', {
      type: 'line',
      data: {
        labels: device.time,
        datasets: [
          {
            label: 'Packet Loss',
            data: device.packetLoss,
          },
        ],
        //removing this line will result in the chart reamining at the lowest window size that was opened
      },
      options: {
        maintainAspectRatio: false,
      },
      plugins: [
        {
          id: 'customCanvasBackgroundColor',
          beforeDraw: (chart, args, options) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          },
        },
      ],
    });
  }

// The updateChartData method will take in parameters the row of the table which was selected by the user, as well as the present type of chart the user has selected to visualize
// The method will be change data being presented to the user. this is done by checking the typeOfChart variable and chart data is altered to user selection, then the update method is called
// which is from the Chart.JS library. This method chart.update is in the Chart.JS documentation https://www.chartjs.org/docs/latest/developers/updates.html 
  updateChartData(row: DeviceElement, typeOfChart: string) {
    if (row !== undefined) {
      if (typeOfChart === 'packetLoss') {
        this.chart.data.datasets[0].data = row.packetLoss;
      } else if (typeOfChart === 'batteryStat') {
        this.chart.data.datasets[0].data = row.batteryStat;
      } else if (typeOfChart === 'rssi') {
        this.chart.data.datasets[0].data = row.RSSI;
      } else if (typeOfChart === 'snr') {
        this.chart.data.datasets[0].data = row.SNR;
      }
      this.chart.update();
    }
  }
  
//creataBarChart method will create a bar chart using the data provided from the device sent in as a parameter, the initalization structure was found in the ChartJS documentation
// https://www.chartjs.org/docs/4.4.0/charts/bar.html Since a chart exist upon initialization, the current chart object will be deleted and any references to it will be destroyed befor ecreate the bar chart using the 
// destroy method found in the documentation https://www.chartjs.org/docs/4.4.0/developers/api.html. again the color of the background is set to white implemented in the plugin portion of the
// initialization. 
  createBarChart(device: DeviceElement) {
    console.log('inside of createBarChart');
    console.log(device);
    this.chartData = device.batteryStat;
    console.log(this.chartData);

    this.chart.destroy();

    this.chart = new Chart('myChart', {
      type: 'bar',
      data: {
        labels: device.time,
        datasets: [
          {
            label: 'Battery',
            data: device.batteryStat,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
      },
      plugins: [
        {
          id: 'customCanvasBackgroundColor',
          beforeDraw: (chart, args, options) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          },
        },
      ],
    });
  }

// createScatterChart method will destroy the current chart object and any references to it will be destroyed before create the scatter chart, structure in ChartJS documentation https://www.chartjs.org/docs/4.4.0/charts/scatter.html using the 
// destroy method found in the documentation https://www.chartjs.org/docs/4.4.0/developers/api.html. The method will create a object that will be a scatter plot chart with units of dBm, using the currently
// selected devices RSSI readings provided from the device element object. The maintainAspectRatio attribute is set to false again to allow the chart size to vary when window size changes. The plugins attribute is used in the 
// initizaltion structure to provide a white background to the new chart created and the data is using the RSSI values from the device of type DeviceElement sent in as a parameter. 
  createScatterChart(device: DeviceElement) {
    console.log('inside of createBarChart');
    console.log(device);
    this.chartData = device.batteryStat;
    console.log(this.chartData);

    this.chart.destroy();

    this.chart = new Chart('myChart', {
      type: 'scatter',
      data: {
        labels: device.time,
        datasets: [
          {
            label: 'dBm',
            data: device.RSSI,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
      },
      plugins: [
        {
          id: 'customCanvasBackgroundColor',
          beforeDraw: (chart, args, options) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          },
        },
      ],
    });
  }

// createLineChart method will destroy the current chart object and any references to it will be destroyed before create the new line chart, structure in ChartJS documentation https://www.chartjs.org/docs/4.4.0/charts/scatter.html using the 
// destroy method found in the documentation https://www.chartjs.org/docs/4.4.0/developers/api.html. The structure for creating the new line chart is from the ChartJS documentation https://www.chartjs.org/docs/4.4.0/charts/line.html, here
// the function creates a new line chart using the the device  time recording and packet loss information sent as a parameter to method once its called. The plugins are used to provide the newly created chart with a white background, the use of maintainAspectRatio is 
// used to allow the size of the chart to vary with the window size. 
  createLineChart(device: DeviceElement) {
    console.log('inside of createBarChart');
    console.log(device);
    this.chartData = device.batteryStat;
    console.log(this.chartData);

    this.chart.destroy();

    this.chart = new Chart('myChart', {
      type: 'line',
      data: {
        labels: device.time,
        datasets: [
          {
            label: 'Packet Loss',
            data: device.packetLoss,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
      },
      plugins: [
        {
          id: 'customCanvasBackgroundColor',
          beforeDraw: (chart, args, options) => {
            const { ctx }= chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white'
            ctx.fillRect(0,0, chart.width, chart.height);
            ctx.restore();
          },
        },
      ],
    });
  }
  
// createSNRChart method will destroy the current chart object and any references to it will be destroyed before create the new line chart with SNR values from the device sent in as a parameter, structure in ChartJS documentation https://www.chartjs.org/docs/4.4.0/charts/scatter.html using the 
// destroy method found in the documentation https://www.chartjs.org/docs/4.4.0/developers/api.html. The structure for creating the new line chart is from the ChartJS documentation https://www.chartjs.org/docs/4.4.0/charts/bar.html, here the chart will create scatter chart with SNR data retrieved
// from the device sent in as a parameter to the method, with the labels of each data value being the distance recorded. The plugins within the chart initialization allows for the chart to have a white background, the maintainAspectRatio variabel being set to false so that the cahrt size can change with 
// the window size. 
  createSNRChart(device: DeviceElement) {
    console.log('inside of createBarChart');
    console.log(device);
    this.chartData = device.batteryStat;
    console.log(this.chartData);

    this.chart.destroy();

    this.chart = new Chart('myChart', {
      type: 'line',
      data: {
        labels: device.distance,
        datasets: [
          {
            label: 'dBm',
            data: device.SNR, // add here
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
      },
      plugins: [
        {
          id: 'customCanvasBackgroundColor',
          beforeDraw: (chart, args, options) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          },
        },
      ],
    });
  }
  
// This is a lifecycle hook used by Angular, it allows for defining which properties should be initialized upon when the component is being used,documentation is found here https://angular.io/api/core/OnInit. Here the lifecycle will
// initialize the first device in the device list should be used for the chart for visualization when the component is being used. Also the type of chart is indicated to be present the packet loss, and the createInitLineChart method is called. 
  ngOnInit() {
    //ensuring that the device sent as a parameter is not undefined at initialization
    this.tempDevice = this.Devicelist[0];
    this.typeOfChart = 'packetLoss';

    console.log('oninit is called');
    this.createInitLineChart(this.Devicelist[0]);
  }

//When a row in a table is clicked, updateChartData method will be called, updating the data on chart visualization, as well as indicating the type of chart with the current value in the typeOfChart variable which should be used for presenting the data.
  viewDeviceHealth(row: DeviceElement) {
    console.log('inside of viewDeviceHealth');
    console.log(row);
    this.tempDevice = row;
    this.updateChartData(row, this.typeOfChart);
  }
  
// When viewDevicePktloss is called, the typeofChart will indicate the visualization should be displaying device packet loss data, keeping log of what visualization type altered to, and creatLineChart is called with the selected device from the user. 
  viewDevicePktloss() {
    this.typeOfChart = 'packetLoss';
    //this.chart.updateChartData(this.tempDevice, this.typeOfChart);
    this.createLineChart(this.tempDevice);
  }

// When viewGatewayRSSI is called, the typeofChart will indicate the visualization should be displaying gateway RSSI values, keeping log of what visualization type altered to, and creatScatterChart is called with the selected device from the user. 
  viewGatewayRSSI() {
    this.typeOfChart = 'rssi';
    //this.chart.updateChartData(this.tempDevice, this.typeOfChart);
    this.createScatterChart(this.tempDevice);
  }

// When viewGatewaySNR is called, the typeofChart will indicate the visualization should be displaying gateway SNR values, keeping log of what visualization type altered to, and createSNRChart is called with the selected device from the user. 
  viewGatewaySNR() {
    this.typeOfChart = 'snr';
    this.createSNRChart(this.tempDevice);
  }

// When viewDeviceBattery is called, the typeofChart will indicate the visualization should be displaying device battery values, keeping log of what visualization type altered to, and createBarChart is called with the selected device from the user. 
  viewDeviceBattery() {
    this.createBarChart(this.tempDevice);
    this.typeOfChart = 'batteryStat';
  }
  
// added for visual acions, once a button is clicked, this function is called to added a loading spinner for effect of loading on the page for 250 milliseconds.
  loadSpinner() {
    this.showSpinner = true;
    setTimeout(() =>{this.showSpinner = false}, 250)
  }

// getDownload will called once the user clicks on the export data button in the webpage, it will first create a anchor element assigned to a variable "link", the user will then use a chartJS method called toBase64Image, which will create a base 64 string which has the current chart visualization
// The download method from the anchor element is used to indicate that the element should be downloaded rather then displayed to the screen. the click method also indicates that the a simulation of a click so that the download of the chart visualization can begin. click method documentation is here: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click 
// use of chart JS method toBase64Image is here: https://www.chartjs.org/docs/latest/developers/api.html http://www.java2s.com/example/javascript/chart.js/chartjs-to-update-and-exporting-chart-as-png.html, download method documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/download.
  getDownload() {
    let link = document.createElement('a');
    link.href = this.chart.toBase64Image();
    link.download = 'chart.png';
    link.click();
  }
}
