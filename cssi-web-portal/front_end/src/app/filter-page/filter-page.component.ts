import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { MatTableModule }  from '@angular/material/table';
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DatePicker } from '../date-picker/date-picker.component';
import { saveAs  } from 'file-saver';
import { Chart, registerables } from 'chart.js/auto';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider'
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';

//testing the inteface as a solution next to several individual declations
export interface SensorData {
  dev_eui: any;
  dev_time: any; 
  payload_dict: any; 
  metadata_dict: any;
}
interface PayloadRecord {
  [key: string]: number | string;
}

@Component({
  selector: 'app-filter-page',
  templateUrl: './filter-page.component.html',
  styleUrls: ['./filter-page.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatGridListModule,
    MatCardModule,
    MatExpansionModule,
    MatRadioModule,
    TempNavBarComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    NgFor,
    MatTableModule,  
    MatPaginatorModule,
    DatePicker,
    MatButtonModule,
    NgIf,
    MatProgressSpinnerModule,
    PercentPipe,
    ReactiveFormsModule,
    MatSliderModule,
    MatDatepickerModule,
    MatCheckboxModule,
  ],
})
export class FilterPageComponent implements AfterViewInit{

  // Declared variables. Currently has duplicates until the better method is determined. 
  //chart variables
  panelOpenState = false;
  panelOpenStateDevEUI = false;
  panelOpenStatePayload = false;
  panelOpenStateMetadata = false;
  panelOpenStatePayloadGraph = false;
  panelOpenStateMetadataGraph = false;
  panelOpenStateDeviceSelect = false;

  //dev data variables
  dev_eui: any[] = []; //Property to hold the device id
  dev_time: any[] = []; //Property to hold to hold the data time stamp
  records: any[] = []; //Property to hold the full JSON record
  payloadData: any[] = []; //Property to hold the payloadData JSON record
  metadataData: any[] = []; //Property to hold the metadataData JSON record
  recordsFilter: string = ''; // Property to hold the payload filter query
  payloadFilter: string = ''; // Property to hold the payload filter query
  metadataFilter: string = ''; // Property to hold the metadata filter query
  payloadColumns: string[] = [];  // Property to hold the 
  metadataColumns: string[] = [];  // Property to hold the
  displayedPayloadColumns: string[] = [];  // Property to hold the
  displayedMetadataColumns: string[] = [];  // Property to hold the

  //filter variables
  filterForm!: FormGroup;
  disabled = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;

  defaultValue: [number, number] = [1, 1000];

  payloadRecord: PayloadRecord[] = [];
  payloadTimeRecord: PayloadRecord[] = [];
  metadataRecord: PayloadRecord[] = [];
  metadataTimeRecord: PayloadRecord[] = [];

  selection = new SelectionModel<string>(true, []);

  //chart variables.
  @Input() Devicelist!: SensorData[];

  showSpinner: boolean = false;
  // records!: SensorData;
  typeOfChart!: string;

  chart!: Chart;
  payloadChart!: Chart;
  metadataChart!: Chart;

  chartData!: number[];

  constructor(private apiService: ApiService, private fb: FormBuilder) { 
    Chart.register(...registerables); // ...registerables is an array that contains all the components Chart.js offers
  }

  //when this page is initiated, get data from the apiService. Should connect to back end an get data from database.
  //currently hard coded until I learn how to send data back to backend so I can get data other than lab_sensor_json
  //itterating code to try and get the data in a formate I can use.
  
  ngOnInit(): void {
    this.apiService.getAltData().subscribe({
      next: (data: SensorData[]) => {
        const records = data.map((item: SensorData) => ({
          dev_eui: item.dev_eui,
          dev_time: item.dev_time,
          payload_dict: JSON.parse(item.payload_dict),
          metadata_dict: JSON.parse(item.metadata_dict)
        }));
        this.payloadDataSource.data = records;
        this.metadataSource.data = records;

        if (records.length > 0) {        
          this.payloadColumns = Object.keys(records[0].payload_dict);
          this.metadataColumns = Object.keys(records[0].metadata_dict);
          this.displayedPayloadColumns = ['Dev_eui', 'Dev_time'].concat(this.payloadColumns);
          this.displayedMetadataColumns = ['Dev_eui', 'Dev_time'].concat(this.metadataColumns);
        }
      },
      error: (error) => {
        console.error('Error: ', error);
      }
    });

    this.apiService.getDevID().subscribe({
      next: (data: string[][]) => {
        const idRecord = data.map((item: string[]) => item[0]);

        this.devIDSource.data = idRecord;

        this.displayedPayloadColumns = ['Dev_eui'];
      },

      error: (error) => {
        console.error('Error: ', error);
      }
    })
    
    this.filterForm = this.fb.group({
      startTime: [''],//, Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')],
      endTime: [''],//, Validators],
      range: this.fb.group({
        value: [this.value],
        min: [this.min],
        max: [this.max],
        step: [this.step],
        showTicks: [this.showTicks],
        thumbLabel: [this.thumbLabel],
        disabled: [this.disabled],
        startValue: [{ value: this.defaultValue[0], disabled: true}],
        endValue: [{ value: this.defaultValue[1], disable: true}],
        metadataSelect: false,
        payloadSelect: false,
      }),
      dataType: [''],//, Validators.pattern('[a-zA-Z ]*')],
      deviceId: [''],//, Validators.pattern('[a-zA-Z ]*')],
      applicationID: [''],//, Validators.pattern('[a-zA-Z0-9]**')],
      location: [''],//, Validators.pattern('[a-zA-Z ]*')]
      
      panelOpenState: false,
      panelOpenStateDevEUI: false,
      panelOpenStatePayload: false,
      panelOpenStateMetadata: false,
      panelOpenStatePayloadGraph: false,
      panelOpenStateMetadataGraph: false,
      panelOpenStateDeviceSelect: false
    });

    this.createPayloadChart('0025CA0A00015E62');
    this.createMetadataChart();
  }

  @ViewChild('payloadPaginator') payloadPaginator!: MatPaginator;
  @ViewChild('metadataPaginator') metadataPaginator!: MatPaginator;
  @ViewChild('devIDPaginator') devIDPaginator!: MatPaginator;

  payloadDataSource = new MatTableDataSource<SensorData>([]);
  metadataSource = new MatTableDataSource<SensorData>([]);
  devIDSource = new MatTableDataSource<string>([]);


  ngAfterViewInit() {
    this.payloadDataSource.paginator = this.payloadPaginator;
    this.metadataSource.paginator = this.metadataPaginator;
    this.devIDSource.paginator = this.devIDPaginator;
  }
  
  //device management
  //----------------------------------------------------------------------------
  addDevice(): void {}
  removeDevice() {}

  //filter functions
  //----------------------------------------------------------------------------
  //filter function in order to allow users display only realivant data. 
  //filters requested by pi
  // -Date(start/end) 
  // -Time of day(start hour/end hour)(Across multiple days)
  // -Data range of values (min/max)
  // -Data type (temperature, moisture, pressure, etc)
  // -Device ID
  // -Functional Group/Application id
  // -Device location/area
  //----------------------------------------------------------------------------
  filterData(data: any[], query: string): any[] {
    if (!query) {
      return data;
    }
    return data.filter(item => 
      Object.keys(item).some(key =>
        item[key].toString().toLowerCase().includes(query.toLowerCase())
      )
    );
  }

  applyPayloadFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.payloadDataSource.filter = filterValue.trim().toLowerCase();
  }
  applyMetadataFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.metadataSource.filter = filterValue.trim().toLowerCase();
  }

  //for inline text filter
  onInput(event: any) {
    // Update the range values in the form when the slider value changes
    this.filterForm.patchValue({
      range: {
        startValue: event.value[0],
        endValue: event.value[1]
      }
    });
  }

  //for filter form
  onFormSubmit(){
    if (this.filterForm.valid) {
      this.filterSensorData();
    } 
    else {
      console.error('Error: ', Error);
      
    }
  }

  filterSensorData() {
    const formValues = this.filterForm.value;

    let filteredPayload = [];
    let filteredMetadata = [];
    
    if(formValues.payloadSelect == true){
      filteredPayload = this.payloadDataSource.data.filter(item => {
        //add filter logic

      });
    }
    else {
      filteredPayload = this.payloadDataSource.data;
    }
    if(formValues.metadataSelect == true){
      filteredMetadata = this.metadataSource.data.filter(item => {
        //add filter logic
        
      });
    }
    else{
      filteredMetadata = this.metadataSource.data;
    }
  
    this.payloadDataSource.data = filteredPayload;
    this.metadataSource.data = filteredMetadata;
  }

  //data export functions
  //----------------------------------------------------------------------------
  exportToCSV(data: any[], filename: string = 'data.csv'): void {
    if (!data || data.length === 0) {
      alert('No data available for export');
      return;
    }
  
    // Validate data format
    if (!data.every(item => typeof item === 'object' && item !== null)) {
      console.error('Invalid data format for CSV export');
      return;
    }
  
    let csvData = this.convertToCSV(data);
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  private convertToCSV(data: any[]): string {
    const array = [Object.keys(data[0])].concat(data); // header data for csv columns
  
    return array.map(row => {  //goes through each row of data
      return Object.values(row).map(field => {
        if (field === null || field === undefined) field = '';  //check for empty input
        return '"' + String(field).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');
  }
  exportPayloadData(){
    const payloadData = this.payloadDataSource.data.map(item=> item.payload_dict)
    this.exportToCSV(payloadData, 'payload_data.csv')
  }
  exportMetadata(){
    const payloadData = this.payloadDataSource.data.map(item=> item.metadata_dict)
    this.exportToCSV(payloadData, 'metadata.csv')
  }
  
  //Chart functions
  //----------------------------------------------------------------------------


  // createInitLineChart method was upon the intial loading of the dashboard, the chart would be initialized and would have the values retrieved from the first device within the devicelist 
  // which was recieved using the input decorator. The chart consists from the Chart class from the Chart.JS library which was imported using "npm install chart.js", at the time of installation fro prototype, the newest
  // version of ChartJS was 4.4.0, if no longer the newest version, use command "npm install chart.js@4.4.0". This function will create an line chart with the packet loss data present in the first device in our list.
  // structure for initization was found in the Chart.JS documentation https://www.chartjs.org/docs/4.4.0/charts/line.html , and for chart white background, used in the plugin section, and examples were used from Chart.JS documentation 
  // which can be found here: https://www.chartjs.org/docs/4.4.0/configuration/canvas-background.html in the options attribute of the chart object the maintainAspectRatio property is set to fasle to allow for the chart to change as the window size changes.

  createInitLineChart(device: SensorData) {
    this.chartData = device.payload_dict;
    console.log('inside create pkt ');

    this.chart = new Chart('payloadChart', {
      type: 'line',
      data: {
        labels: device.dev_time,
        datasets: [
          {
            label: 'Packet Loss',
            data: [],
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
  updateChartData(row: SensorData, typeOfChart: string) {
    if (row !== undefined) {
      // if (typeOfChart === 'packetLoss') {
      //   this.chart.data.datasets[0].data = row.packetLoss;
      // } else if (typeOfChart === 'batteryStat') {
      //   this.chart.data.datasets[0].data = row.batteryStat;
      // } else if (typeOfChart === 'rssi') {
      //   this.chart.data.datasets[0].data = row.RSSI;
      // } else if (typeOfChart === 'snr') {
      //   this.chart.data.datasets[0].data = row.SNR;
      // }
      this.chart.update();
    }
  }

  //creataBarChart method will create a bar chart using the data provided from the device sent in as a parameter, the initalization structure was found in the ChartJS documentation
  // https://www.chartjs.org/docs/4.4.0/charts/bar.html Since a chart exist upon initialization, the current chart object will be deleted and any references to it will be destroyed befor ecreate the bar chart using the 
  // destroy method found in the documentation https://www.chartjs.org/docs/4.4.0/developers/api.html. again the color of the background is set to white implemented in the plugin portion of the
  // initialization. 
  createBarChart(device: SensorData) {
  //   console.log('inside of createBarChart');
  //   console.log(device);
  //   // this.chartData = device.batteryStat;
  //   console.log(this.chartData);

  //   this.chart.destroy();

  //   this.chart = new Chart('payloadChart', {
  //     type: 'bar',
  //     data: {
  //       // labels: device.time,
  //       datasets: [
  //         {
  //           label: 'Battery',
  //           // data: device.batteryStat,
  //         },
  //       ],
  //     },
  //     options: {
  //       maintainAspectRatio: false,
  //     },
  //     plugins: [
  //       {
  //         id: 'customCanvasBackgroundColor',
  //         beforeDraw: (chart, args, options) => {
  //           const { ctx } = chart;
  //           ctx.save();
  //           ctx.globalCompositeOperation = 'destination-over';
  //           ctx.fillStyle = '#ffffff';
  //           ctx.fillRect(0, 0, chart.width, chart.height);
  //           ctx.restore();
  //         },
  //       },
  //     ],
  //   });
  }

  // createScatterChart method will destroy the current chart object and any references to it will be destroyed before create the scatter chart, structure in ChartJS documentation https://www.chartjs.org/docs/4.4.0/charts/scatter.html using the 
  // destroy method found in the documentation https://www.chartjs.org/docs/4.4.0/developers/api.html. The method will create a object that will be a scatter plot chart with units of dBm, using the currently
  // selected devices RSSI readings provided from the device element object. The maintainAspectRatio attribute is set to false again to allow the chart size to vary when window size changes. The plugins attribute is used in the 
  // initizaltion structure to provide a white background to the new chart created and the data is using the RSSI values from the device of type SensorData sent in as a parameter. 
  createScatterChart(device: SensorData) {
    console.log('inside of createBarChart');
    console.log(device);
    // this.chartData = device.batteryStat;
    console.log(this.chartData);

    this.chart.destroy();

    this.chart = new Chart('payloadChart', {
      type: 'scatter',
      data: {
        // labels: device.time,
        datasets: [
          // {
          //   label: 'dBm',
          //   data: device.RSSI,
          // },
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
  createLineChart(devicePayload: SensorData) {
    // device: any[];
    // device:  = JSON.parse(devicePayload.payload_dict);
    // console.log('inside of createBarChart');
    // console.log(device.);
    // this.chartData = device.metadata_dict.;
    // console.log(this.chartData);

    // this.chart.destroy();

    // this.chart = new Chart('payloadChart', {
    //   type: 'line',
    //   data: {
    //     labels: device.time,
    //     datasets: [
    //       {
    //         label: 'Packet Loss',
    //         data: device.packetLoss,
    //       },
    //     ],
    //   },
    //   options: {
    //     maintainAspectRatio: false,
    //   },
    //   plugins: [
    //     {
    //       id: 'customCanvasBackgroundColor',
    //       beforeDraw: (chart, args, options) => {
    //         const { ctx } = chart;
    //         ctx.save();
    //         ctx.globalCompositeOperation = 'destination-over';
    //         ctx.fillStyle = '#ffffff';
    //         ctx.fillRect(0, 0, chart.width, chart.height);
    //         ctx.restore();
    //       },
    //     },
    //   ],
    // });
  }

  // createSNRChart method will destroy the current chart object and any references to it will be destroyed before create the new line chart with SNR values from the device sent in as a parameter, structure in ChartJS documentation https://www.chartjs.org/docs/4.4.0/charts/scatter.html using the 
  // destroy method found in the documentation https://www.chartjs.org/docs/4.4.0/developers/api.html. The structure for creating the new line chart is from the ChartJS documentation https://www.chartjs.org/docs/4.4.0/charts/bar.html, here the chart will create scatter chart with SNR data retrieved
  // from the device sent in as a parameter to the method, with the labels of each data value being the distance recorded. The plugins within the chart initialization allows for the chart to have a white background, the maintainAspectRatio variabel being set to false so that the cahrt size can change with 
  // the window size. 
  createSNRChart(device: SensorData) {
    // console.log('inside of createBarChart');
    // console.log(device);
    // this.chartData = device.batteryStat;
    // console.log(this.chartData);

    // this.chart.destroy();

    // this.chart = new Chart('payloadChart', {
    //   type: 'line',
    //   data: {
    //     labels: device.distance,
    //     datasets: [
    //       {
    //         label: 'dBm',
    //         data: device.SNR, // add here
    //       },
    //     ],
    //   },
    //   options: {
    //     maintainAspectRatio: false,
    //   },
    //   plugins: [
    //     {
    //       id: 'customCanvasBackgroundColor',
    //       beforeDraw: (chart, args, options) => {
    //         const { ctx } = chart;
    //         ctx.save();
    //         ctx.globalCompositeOperation = 'destination-over';
    //         ctx.fillStyle = '#ffffff';
    //         ctx.fillRect(0, 0, chart.width, chart.height);
    //         ctx.restore();
    //       },
    //     },
    //   ],
    // });
  }//When a row in a table is clicked, updateChartData method will be called, updating the data on chart visualization, as well as indicating the type of chart with the current value in the typeOfChart variable which should be used for presenting the data.
  viewDeviceHealth(row: SensorData) {
    // console.log('inside of viewDeviceHealth');
    // console.log(row);
    // this.records = row;
    // this.updateChartData(row, this.typeOfChart);
  }

  // When viewDevicePktloss is called, the typeofChart will indicate the visualization should be displaying device packet loss data, keeping log of what visualization type altered to, and creatLineChart is called with the selected device from the user. 
  viewDevicePktloss() {
    // this.typeOfChart = 'packetLoss';
    // //this.chart.updateChartData(this.records, this.typeOfChart);
    // this.createLineChart(this.records);
  }

  // When viewGatewayRSSI is called, the typeofChart will indicate the visualization should be displaying gateway RSSI values, keeping log of what visualization type altered to, and creatScatterChart is called with the selected device from the user. 
  viewGatewayRSSI() {
    // this.typeOfChart = 'rssi';
    // //this.chart.updateChartData(this.records, this.typeOfChart);
    // this.createScatterChart(this.records);
  }

  // When viewGatewaySNR is called, the typeofChart will indicate the visualization should be displaying gateway SNR values, keeping log of what visualization type altered to, and createSNRChart is called with the selected device from the user. 
  viewGatewaySNR() {
    // this.typeOfChart = 'snr';
    // this.createSNRChart(this.records);
  }

  // When viewDeviceBattery is called, the typeofChart will indicate the visualization should be displaying device battery values, keeping log of what visualization type altered to, and createBarChart is called with the selected device from the user. 
  viewDeviceBattery() {
    // this.createBarChart(this.records);
    // this.typeOfChart = 'batteryStat';
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

  createPayloadChart(devId: string){
    this.apiService.getPayload(devId).subscribe({
      next: (data: PayloadRecord[][]) => {
        this.payloadTimeRecord = data.map((item: PayloadRecord[]) => item[0] as PayloadRecord);
        this.payloadRecord = data.map((item: PayloadRecord[]) => item[1] as PayloadRecord);
        this.initializePayloadChart();
      },
      error: (error) => {
        console.error('Error fetching payload data:', error);
      }
    });
  }
  
  createMetadataChart(){
    this.apiService.getMetadata().subscribe({
      next: (data: PayloadRecord[][]) => {
        this.metadataTimeRecord = data.map((item: PayloadRecord[]) => item[0]as PayloadRecord);
        this.metadataRecord = data.map((item: PayloadRecord[]) => item[1] as PayloadRecord);
        this.initializeMetadataChart();
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      }
    });
  }
  initializePayloadChart() {
    const ctx = document.getElementById('payloadChart') as HTMLCanvasElement;
    if (ctx && this.payloadTimeRecord.length > 0 && this.payloadRecord.length > 0) {
      const labels = this.payloadTimeRecord; 
      const datasets = this.payloadColumns.map(col => {
        return {
          label: col,
          data: this.payloadRecord.map(record => +record[col]),
          fill: false,
          borderColor: this.getRandomColor(),
          tension: 0.1
        };
      });
  
      if (this.payloadChart) {
        this.payloadChart.destroy(); 
      }
  
      this.payloadChart = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          responsive: true,
          maintainAspectRatio: false,
        }
      });
    }
  }
  initializeMetadataChart() {
    const meta_ctx = document.getElementById('metadataChart') as HTMLCanvasElement;
    if (meta_ctx && this.metadataTimeRecord.length > 0 && this.metadataRecord.length > 0) {
      const labels = this.metadataTimeRecord; 
      const datasets = this.metadataColumns.map(col => {
        return {
          label: col,
          data: this.metadataRecord.map(record => +record[col]),
          fill: false,
          borderColor: this.getRandomColor(),
          tension: 0.1
        };
      });
  
      if (this.metadataChart) {
        this.metadataChart.destroy(); 
      }
  
      this.metadataChart = new Chart(meta_ctx, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          responsive: true,
          maintainAspectRatio: false,
        }
      });
    }
  }

  //since the jsons are dynamic we assin chart element colors randomly
  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  createChart(devId: string){
    this.loadSpinner();
    this.createPayloadChart(devId);
    this.createMetadataChart();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.devIDSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.devIDSource.data);
  }

  checkboxLabel(index?: number, row?: string): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    if (index !== undefined && row){ 
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row number ${index + 1}`;
    }
    console.warn('checkboxLabel wa called without a row or index.');
    return '';
  }
}