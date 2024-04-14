import { ChangeDetectorRef, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { AfterViewInit, ViewChild } from '@angular/core';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';import { MatTableDataSource } from '@angular/material/table';
import { DatePicker } from '../date-picker/date-picker.component';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js/auto';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { keyframes } from '@angular/animations';
import { HttpClient, HttpParams } from '@angular/common/http';

//testing the inteface as a solution next to several individual declations
export interface SensorData {
  dev_eui: any;
  dev_time: any;
  payload_dict: any;
  metadata_dict: any;
}
export interface PayloadRecord {
  [key: string]: number | string;
}

export interface Device {
  name: string;
  devEUI: string;
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
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatPaginatorModule,
    MatButtonModule,
    TempNavBarComponent,
    MatListModule
  ],
})
export class FilterPageComponent implements AfterViewInit {
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
  payloadColumns: string[] = []; // Property to hold the
  metadataColumns: string[] = []; // Property to hold the
  displayedPayloadColumns: string[] = []; // Property to hold the
  displayedMetadataColumns: string[] = []; // Property to hold the

  //filter variables
  filterForm!: FormGroup;
  disabled = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;
  startTime = 0;
  endTime = 0;

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
  deviceList: Device[] = [];

  routerLinkVariable = '/hi';
  devices: string[] = [];
  appName: string | null = 'Cat Chairs';
  orgId: string | null = '';
  appDescription: string | null =
    "These devices consists of the best possible devices made for cat patting, for the best of cats out there. Don't let your feline friend down, get them feline great with these devices below.";
  imgName: string | null = 'placeholder_cat2';
  removeApps: boolean = false;
  currentPage: number = 0;

  appId: string | null = '';
  devName: string | null = '';
  base_url: string = 'http://localhost:5000';
  deviceEUI: string = '';

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    Chart.register(...registerables); // ...registerables is an array that contains all the components Chart.js offers
  }

  //when this page is initiated, get data from the apiService. Should connect to back end an get data from database.
  //currently hard coded until I learn how to send data back to backend so I can get data other than lab_sensor_json
  //itterating code to try and get the data in a formate I can use.

  ngOnInit(): void {
    this.appId = this.route.snapshot.paramMap.get('app'); //From the current route, get the route name, which should be the identifier for what you need to render.
    this.devName = this.route.snapshot.paramMap.get('dev');

    const param = new HttpParams()
      .set('app', this.appId != null ? this.appId : '-1')
      .set('devName', this.devName != null ? this.devName : 'none');

    // this is for giving one device EUI from the given dev name from the user.
    // this.http
    //   .get(this.base_url + '/userOrgAppDevice', {
    //     observe: 'response',
    //     responseType: 'json',
    //     params: param,
    //   })
    //   .subscribe({
    //     next: (response) => {
    //       const res = JSON.stringify(response);

    //       let resp = JSON.parse(res);

    //       // console.log('resp is in app page', resp.body.dev_eui);
    //       this.deviceEUI = resp.body.dev_eui;
    //       console.log('DEV_EUI', this.deviceEUI);
    //       console.log('AppId', this.appId);
    //       // this.getDataSetup();
    //     },
    //     error: (error) => {
    //       console.error(error);
    //     },
    //   });

    this.fetchDevices();
    this.getDataSetup();

    this.apiService.getAltData().subscribe({
      next: (data: SensorData[]) => {
        const records = data.map((item: SensorData) => ({
          dev_eui: item.dev_eui,
          dev_time: item.dev_time.replace(' GMT', ''),
          payload_dict: JSON.parse(item.payload_dict),
          metadata_dict: JSON.parse(item.metadata_dict),
        }));
        this.payloadDataSource.data = records;
        this.metadataSource.data = records;
     
        console.log(this.payloadDataSource.data[1].dev_time);

        if (records.length > 0) {
          this.payloadColumns = Object.keys(records[0].payload_dict);
          this.metadataColumns = Object.keys(records[0].metadata_dict);
          this.displayedPayloadColumns = ['Dev_eui', 'Dev_time'].concat(
            this.payloadColumns
          );
          this.displayedMetadataColumns = ['Dev_eui', 'Dev_time'].concat(
            this.metadataColumns
          );
        }
      },
      error: (error) => {
        console.error('Error: ', error);
      },
    });


    this.apiService.getDevID().subscribe({
      next: (data: string[][]) => {
        const idRecord = data.map((item: string[]) => item[0]);

        this.devIDSource.data = idRecord;
      },

      error: (error) => {
        console.error('Error: ', error);
      },
    });

    this.apiService.getPayloadStatisticsData(this.deviceEUI).subscribe({
      next: (data: any[]) => {
        // console.log(data)
        const payloadStatRecord = Object.keys(data).map((key: any) => {
          const stats = data[key];

          return {
            column: key,
            mean: stats.mean,
            variance: stats.variance,
            standard_deviation: stats.standardDeviation,
            median: stats.median,
            mode: stats.mode,
          };
        });
        // console.log(payloadStatRecord)

        this.paylaodStatSource.data = payloadStatRecord;
      },

      error: (error) => {
        console.error('Error: ', error);
      },
    });
    this.apiService.getMetadataStatisticsData(this.deviceEUI).subscribe({
      next: (data: any[]) => {
        console.log(data);
        const metadataStatRecord = Object.keys(data).map((key: any) => {
          const stats = data[key];

          return {
            column: key,
            mean: stats.mean,
            variance: stats.variance,
            standard_deviation: stats.standardDeviation,
            median: stats.median,
            mode: stats.mode,
          };
        });
        console.log(metadataStatRecord);

        this.metadataStatSource.data = metadataStatRecord;
      },

      error: (error) => {
        console.error('Error: ', error);
      },
    });

    this.filterForm = this.fb.group({
      startTime: [''], //, Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')],
      endTime: [''], //, Validators],
      range: this.fb.group({
        value: [this.value],
        min: [this.min],
        max: [this.max],
        step: [this.step],
        showTicks: [this.showTicks],
        thumbLabel: [this.thumbLabel],
        disabled: [this.disabled],
        startValue: [{ value: this.defaultValue[0], disabled: true }],
        endValue: [{ value: this.defaultValue[1], disable: true }],
        metadataSelect: false,
        payloadSelect: false,
        startTime: 0,
        endTime: 0,
      }),
      value: 0,
      dataType: [''], //, Validators.pattern('[a-zA-Z ]*')],
      deviceId: [''], //, Validators.pattern('[a-zA-Z ]*')],
      applicationID: [''], //, Validators.pattern('[a-zA-Z0-9]**')],
      location: [''], //, Validators.pattern('[a-zA-Z ]*')]

    });
    console.log('deviceEUI: ', this.deviceEUI)

    this.createPayloadChart(this.deviceEUI);
    this.createMetadataChart();
  }

  @ViewChild('payloadPaginator') payloadPaginator!: MatPaginator;
  @ViewChild('metadataPaginator') metadataPaginator!: MatPaginator;
  @ViewChild('devIDPaginator') devIDPaginator!: MatPaginator;
  @ViewChild('payloadStatsPaginator') payloadStatsPaginator!: MatPaginator;
  @ViewChild('metadataStatsPaginator') metadataStatsPaginator!: MatPaginator;
  @ViewChild('devicePaginator') devicePaginator!: MatPaginator;

  payloadDataSource = new MatTableDataSource<SensorData>([]);
  metadataSource = new MatTableDataSource<SensorData>([]);
  devIDSource = new MatTableDataSource<string>([]);
  paylaodStatSource = new MatTableDataSource<any>([]);
  metadataStatSource = new MatTableDataSource<any>([]);
  deviceSource = new MatTableDataSource<Device>([]);

  ngAfterViewInit() {
    this.payloadDataSource.paginator = this.payloadPaginator;
    this.metadataSource.paginator = this.metadataPaginator;
    this.devIDSource.paginator = this.devIDPaginator;
    this.paylaodStatSource.paginator = this.payloadPaginator;
    this.metadataStatSource.paginator = this.metadataPaginator;
    this.deviceSource.paginator = this.devicePaginator;

    console.log('Payload Source: ', this.payloadDataSource.data)
    console.log('Metadata Source: ', this.metadataSource.data)
    console.log('devID Source: ', this.devIDSource.data)
    console.log('PayStats Source: ', this.paylaodStatSource.data)
    console.log('MetaSatas Source: ', this.metadataStatSource.data)
    console.log('Device Source: ', this.deviceSource.data)
  }
  private getDataSetup(): void {
    if(this.deviceEUI) {
      this.apiService.getData(this.deviceEUI).subscribe({
        next: (data: SensorData[]) => {
          const records = data.map((item: SensorData) => ({
            dev_eui: item.dev_eui,
            dev_time: item.dev_time.replace(' GMT', ''),
            payload_dict: JSON.parse(item.payload_dict),
            metadata_dict: JSON.parse(item.metadata_dict),
          }));
          this.payloadDataSource.data = records;
          this.metadataSource.data = records;
  
          if (records.length > 0) {
            this.payloadColumns = Object.keys(records[0].payload_dict);
            this.metadataColumns = Object.keys(records[0].metadata_dict);
            this.displayedPayloadColumns = ['Dev_eui', 'Dev_time'].concat(
              this.payloadColumns
            );
            this.displayedMetadataColumns = ['Dev_eui', 'Dev_time'].concat(
              this.metadataColumns
            );
          }
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
      console.log('DEV_EUI_2', this.deviceEUI);

      const id = this.deviceEUI;
  
      this.createPayloadChart(id);
      this.createMetadataChart();
    }
  }

  fetchDevices(): void {
    this.appId = this.route.snapshot.paramMap.get('app'); //From the current route, get the route name, which should be the identifier for what you need to render.
    this.devName = this.route.snapshot.paramMap.get('dev');
    console.log('appId1: ', this.appId);
    console.log('devName1: ', this.devName)
    const param = new HttpParams()
      .set('app', this.appId != null ? this.appId : '-1')
      .set('devName', this.devName != null ? this.devName : 'none');

    this.http
      .get(this.base_url + '/userOrgAppDeviceList', {
        observe: 'response',
        responseType: 'json',
        params: param,
      })
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response);

          let resp = JSON.parse(res);

          for (var i = 0; i < resp.body.list.length; i++) {
            console.log('index: ', resp.body.list[i].name);
            this.devices.push(resp.body.list[i].name);
            this.deviceList.push({
              name: resp.body.list[i].name,
              devEUI: resp.body.list[i].dev,              
            });
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
      this.deviceSource.data = this.deviceList;
      this.deviceSource.filter = '';
      this.deviceSource._updateChangeSubscription();
      console.log('Device Source1: ', this.deviceSource.data);
  }

  //device management
  //----------------------------------------------------------------------------
  addDevice(): void {}
  removeDevice(): void {}

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
    return data.filter((item) =>
      Object.keys(item).some((key) =>
        item[key].toString().toLowerCase().includes(query.toLowerCase())
      )
    );
  }
  applyDeviceFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.deviceSource.filter = filterValue.trim().toLowerCase();
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
        endValue: event.value[1],
      },
    });
  }

  //for filter form
  onFormSubmit() {
    if (this.filterForm.valid) {
      this.filterSensorData();
    } else {
      console.error('Error: ', Error);
    }
  }

  filterSensorData() {
    console.log("Filter Called")
    console.log("payloadSelect:", this.filterForm.value)
    // console.log("metadataSelect:", this.filterForm.values.metadataSelect)

    // let filteredPayload = [];
    // let filteredMetadata = [];

    // this.filterForm = this.fb.group({
    //   startTime: [''], //, Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')],
    //   endTime: [''], //, Validators],
    //   range: this.fb.group({
    //     value: [this.value],
    //     min: [this.min],
    //     max: [this.max],
    //     step: [this.step],
    //     showTicks: [this.showTicks],
    //     thumbLabel: [this.thumbLabel],
    //     disabled: [this.disabled],
    //     startValue: [{ value: this.defaultValue[0], disabled: true }],
    //     endValue: [{ value: this.defaultValue[1], disable: true }],
    //     metadataSelect: false,
    //     payloadSelect: false,
    //     startTime: 0,
    //     endTime: 0,
    //   }),
    //   value: 0,
    //   dataType: [''], //, Validators.pattern('[a-zA-Z ]*')],
    //   deviceId: [''], //, Validators.pattern('[a-zA-Z ]*')],
    //   applicationID: [''], //, Validators.pattern('[a-zA-Z0-9]**')],
    //   location: [''], //, Validators.pattern('[a-zA-Z ]*')]
    // });

    if (this.filterForm.value.range.payloadSelect == true) {
      this.payloadDataSource.data = this.payloadDataSource.data.filter((item) => {
        //add filter logic
        console.log("this worked")
        return (
          (this.filterForm.value.range.startTime === '' || item.dev_time.includes(this.filterForm.value.range.startTime)) &&
          (this.filterForm.value.range.endTime === '' || item.dev_time.includes(this.filterForm.value.range.endTime)) &&
          (this.filterForm.value.range.value === '' || item.payload_dict.includes(this.filterForm.value.range.value)) &&
          (this.filterForm.value.range.min === '' || item.payload_dict.includes(this.filterForm.value.range.min)) &&
          (this.filterForm.value.range.max === '' || item.payload_dict.includes(this.filterForm.value.range.max)) &&
          (this.filterForm.value.range.startValue === '' || item.payload_dict.includes(this.filterForm.value.range.startValue)) &&
          (this.filterForm.value.range.endValue === '' || item.payload_dict.includes(this.filterForm.value.range.endValue)) &&

          (this.filterForm.value.value === '' || item.payload_dict.includes(this.filterForm.value.value)) &&
          (this.filterForm.value.dataType === '' || item.payload_dict.includes(this.filterForm.value.dataType)) &&
          (this.filterForm.value.deviceId === '' || item.payload_dict.includes(this.filterForm.value.deviceId)) &&
          (this.filterForm.value.applicationID === '' || item.payload_dict.includes(this.filterForm.value.applicationID)) &&
          (this.filterForm.value.location === '' || item.payload_dict.includes(this.filterForm.value.location)) 
        )
      });
    } 
    if (this.filterForm.value.range.metadataSelect== true) {
      this.metadataSource.data = this.metadataSource.data.filter((item) => {
        //add filter logic
        console.log("this worked")
        return (
          (this.filterForm.value.range.startTime === '' || item.dev_time.includes(this.filterForm.value.range.startTime)) &&
          (this.filterForm.value.range.endTime === '' || item.dev_time.includes(this.filterForm.value.range.endTime)) &&
          (this.filterForm.value.range.value === '' || item.metadata_dict.includes(this.filterForm.value.range.value)) &&
          (this.filterForm.value.range.min === '' || item.metadata_dict.includes(this.filterForm.value.range.min)) &&
          (this.filterForm.value.range.max === '' || item.metadata_dict.includes(this.filterForm.value.range.max)) &&
          (this.filterForm.value.range.startValue === '' || item.metadata_dict.includes(this.filterForm.value.range.startValue)) &&
          (this.filterForm.value.range.endValue === '' || item.metadata_dict.includes(this.filterForm.value.range.endValue)) &&

          (this.filterForm.value.deviceId === '' || item.dev_eui.includes(this.filterForm.value.deviceId)) &&

          (this.filterForm.value.deviceId === '' || item.dev_eui.includes(this.filterForm.value.deviceId)) &&
          (this.filterForm.value.deviceId === '' || item.dev_eui.includes(this.filterForm.value.deviceId)) 
        )
      });
    }
  }

  //data export functions
  //----------------------------------------------------------------------------
  exportToCSV(data: any[], filename: string = 'data.csv'): void {
    if (!data || data.length === 0) {
      alert('No data available for export');
      return;
    }

    // Validate data format
    if (!data.every((item) => typeof item === 'object' && item !== null)) {
      console.error('Invalid data format for CSV export');
      return;
    }

    let csvData = this.convertToCSV(data);
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  private convertToCSV(data: any[]): string {
    const array = [Object.keys(data[0])].concat(data); // header data for csv columns

    return array
      .map((row) => {
        //goes through each row of data
        return Object.values(row)
          .map((field) => {
            if (field === null || field === undefined) field = ''; //check for empty input
            return '"' + String(field).replace(/"/g, '""') + '"';
          })
          .join(',');
      })
      .join('\r\n');
  }
  exportPayloadData() {
    const payloadData = this.payloadDataSource.data.map(
      (item) => item.payload_dict
    );
    this.exportToCSV(payloadData, 'payload_data.csv');
  }
  exportMetadata() {
    const payloadData = this.payloadDataSource.data.map(
      (item) => item.metadata_dict
    );
    this.exportToCSV(payloadData, 'metadata.csv');
  }

  //Chart functions
  //----------------------------------------------------------------------------

  
  // added for visual acions, once a button is clicked, this function is called to added a loading spinner for effect of loading on the page for 250 milliseconds.
  loadSpinner() {
    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
    }, 250);
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

  createPayloadChart(devId: string) {
    console.log('devId 1: ', devId);
    this.apiService.getPayload(devId).subscribe({
      next: (data: PayloadRecord[][]) => {
        this.payloadTimeRecord = data.map(
          (item: PayloadRecord[]) => item[0] as PayloadRecord
        );
        // console.log('Time Record: ', this.payloadTimeRecord)
        this.payloadRecord = data.map(
          (item: PayloadRecord[]) => item[1] as PayloadRecord
        );
        this.initializePayloadChart();
      },
      error: (error) => {
        console.error('Error fetching payload data:', error);
      },
    });
  }

  createMetadataChart() {
    this.apiService.getMetadata().subscribe({
      next: (data: PayloadRecord[][]) => {
        this.metadataTimeRecord = data.map(
          (item: PayloadRecord[]) => item[0] as PayloadRecord
        );
        // console.log('this.metadataTimeRecord : ', typeof(this.metadataTimeRecord[0]), this.metadataTimeRecord[0]);

        // console.log('this.metadataTimeRecord : ', typeof(this.metadataTimeRecord[0]).replace(' GMT', ''));
        // console.log('Time Record: ', this.metadataTimeRecord)
        this.metadataRecord = data.map(
          (item: PayloadRecord[]) => item[1] as PayloadRecord
        );
        this.initializeMetadataChart();

      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });
  }
  initializePayloadChart() {
    const ctx = document.getElementById('payloadChart') as HTMLCanvasElement;
    if (
      ctx &&
      this.payloadTimeRecord.length > 0 &&
      this.payloadRecord.length > 0
    ) {
      const labels = this.payloadTimeRecord;
      const datasets = this.payloadColumns.map((col) => {
        return {
          label: col,
          data: this.payloadRecord.map((record) => +record[col]),
          fill: false,
          borderColor: this.getRandomColor(),
          tension: 0.1,
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
              beginAtZero: true,
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }
  initializeMetadataChart() {
    const meta_ctx = document.getElementById(
      'metadataChart'
    ) as HTMLCanvasElement;
    if (
      meta_ctx &&
      this.metadataTimeRecord.length > 0 &&
      this.metadataRecord.length > 0
    ) {
      // if(typeof this.metadataTimeRecord === 'string') {
      //   this.metadataTimeRecord['dev_time'] = dev_time.replace(' GMT', '')
      // }      
      const labels = this.metadataTimeRecord;
      const datasets = this.metadataColumns.map((col) => {
        return {
          label: col,
          data: this.metadataRecord.map((record) => +record[col]),
          fill: false,
          borderColor: this.getRandomColor(),
          tension: 0.1,
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
              beginAtZero: true,
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
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

  createChart(devId: string) {
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
    if (index !== undefined && row) {
      return `${
        this.selection.isSelected(row) ? 'deselect' : 'select'
      } row number ${index + 1}`;
    }
    console.warn('checkboxLabel wa called without a row or index.');
    return '';
  }
}
