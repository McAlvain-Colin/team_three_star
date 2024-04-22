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
import { CommonModule, JsonPipe, getLocaleNumberSymbol } from '@angular/common';
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
import { Chart, ChartConfiguration, ChartTypeRegistry, registerables } from 'chart.js/auto';
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
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatIconModule} from '@angular/material/icon';
import { HttpClient, HttpParams } from '@angular/common/http';

import { MatNativeDateModule } from '@angular/material/core';

import { inject } from '@angular/core';
import { DeviceMapComponent } from '../device-map/device-map.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';

//testing the inteface as a solution next to several individual declations
export interface SensorData {
  dev_eui: any;
  dev_time: any;
  payload_dict: any;
  metadata_dict: any;
  payloadDescription: any;
  metadataDescription: any;
}
export interface PayloadRecord {
  [key: string]: number | string;
}
export interface variableMap {
  [key: string]: any;
}


export interface Device {
  name: string;
  devEUI: string;
}

export class ApplicationPageComponent {
  base_url: string = 'http://localhost:5000';
  deviceList: Device[] = [];

  routerLinkVariable = '/hi';
  devices: string[] = [];
  appName: string | null = 'Cat Chairs';
  appId: string | null = '';
  orgId: string | null = '';
  appDescription: string | null =
    "These devices consists of the best possible devices made for cat patting, for the best of cats out there. Don't let your feline friend down, get them feline great with these devices below.";
  imgName: string | null = 'placeholder_cat2';
  removeApps: boolean = false;
  currentPage: number = 0;
  deviceSource = new MatTableDataSource(this.deviceList);
};

@Component({
  selector: 'app-filter-page',
  templateUrl: './filter-page.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
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
    MatToolbarModule,
    MatCardModule,
    TempNavBarComponent,
    MatListModule,
    JsonPipe,
    MatNativeDateModule,

    MatSidenavModule,
    MatIconModule,
    DeviceMapComponent,
  ],
})
export class FilterPageComponent {
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
    this.orgId = this.route.snapshot.paramMap.get('org');
    if (this.appId == null) {
      this.appName = 'Cat Patting';
    }

    const param = new HttpParams().set(
      'app',
      this.appId != null ? this.appId : '-1'
    );

    // this request is for getting application name, id, and description
    this.http
      .get(this.base_url + '/userOrgApp', {
        observe: 'response',
        responseType: 'json',
        params: param,
      })
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response);

          let resp = JSON.parse(res);

          //console.log('resp is in app page', resp);

          this.appName = resp.body.name;
        },
        error: (error) => {
          //console.error(error);
        },
      });
     // this is for giving one device EUI from the given dev name from the user.
    // this.http
    // .get(this.base_url + '/userOrgAppDevice', {
    //   observe: 'response',
    //   responseType: 'json',
    //   params: param,
    // })
    // .subscribe({
    //   next: (response) => {
    //     const res = JSON.stringify(response);

    //     let resp = JSON.parse(res);

    //     //console.log('resp is in app page', resp.body.dev_eui);
    //     this.deviceList[1].devEUI = resp.body.dev_eui;
    //     //console.log('DEV_EUI', this.deviceList[1].devEUI);
    //     this.getDataSetup();
    //   },
    //   error: (error) => {
    //     //console.error(error);
    //   },
    // });
    // this is for getting the organizations's applications associated with it

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
            console.log('index: ', resp.body.list[i].name, resp.body.list[i].dev);
            this.devices.push(resp.body.list[i].name);
            this.deviceList.push({
              name: resp.body.list[i].name,
              devEUI: resp.body.list[i].dev,
            });
          } 
          this.getDataSetup();
        },
        error: (error) => {
          //console.error(error);
        },       
      });
    
      this.deviceSource.data = this.deviceList;
      this.deviceSource.filter = '';
      this.deviceSource._updateChangeSubscription();

    this.filterForm = this.fb.group({
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
        startTime: '',
        endTime: '',
        deviceId: '',
        dateInfo: '',
        dataType: [''], //, Validators.pattern('[a-zA-Z ]*')],
        applicationID: [''], //, Validators.pattern('[a-zA-Z0-9]**')],
        location: [''] //, Validators.pattern('[a-zA-Z ]*')]
      }),

    });
  }

  @ViewChild('payloadPaginator') payloadPaginator!: MatPaginator;
  @ViewChild('metadataPaginator') metadataPaginator!: MatPaginator;
  @ViewChild('devIDPaginator') devIDPaginator!: MatPaginator;
  @ViewChild('payloadStatsPaginator') payloadStatsPaginator!: MatPaginator;
  @ViewChild('metadataStatsPaginator') metadataStatsPaginator!: MatPaginator;
  @ViewChild('fileteredPayloadStatsPaginator') fileteredPayloadStatsPaginator!: MatPaginator;
  @ViewChild('fileteredMetadataStatsPaginator') fileteredMetadataStatsPaginator!: MatPaginator;
  @ViewChild('devicePaginator') devicePaginator!: MatPaginator;
  @ViewChild('filteredPayloadPaginator') filteredPayloadPaginator!: MatPaginator;
  @ViewChild('filteredMetadataPaginator') filteredMetadataPaginator!: MatPaginator;

  payloadDataSource = new MatTableDataSource<SensorData>([]);
  filteredPayloadDataSource = new MatTableDataSource<SensorData>([]);
  metadataSource = new MatTableDataSource<SensorData>([]);
  filteredMetadataSource = new MatTableDataSource<SensorData>([]);
  devIDSource = new MatTableDataSource<string>([]);
  payloadStatSource = new MatTableDataSource<any>([]);
  metadataStatSource = new MatTableDataSource<any>([]);
  filteredPayloadStatSource = new MatTableDataSource<any>([]);
  filteredMetadataStatSource = new MatTableDataSource<any>([]);
  deviceSource = new MatTableDataSource<Device>([]);

  ngAfterViewInit() {
    this.payloadDataSource.paginator = this.payloadPaginator;
    this.metadataSource.paginator = this.metadataPaginator;
    this.filteredPayloadDataSource.paginator = this.filteredPayloadPaginator;
    this.metadataSource.paginator = this.metadataPaginator;
    this.filteredMetadataSource.paginator = this.filteredMetadataPaginator;
    this.devIDSource.paginator = this.devIDPaginator;
    this.payloadStatSource.paginator = this.payloadStatsPaginator;
    this.filteredMetadataStatSource.paginator = this.metadataStatsPaginator;
    this.filteredPayloadStatSource.paginator = this.payloadStatsPaginator;
    this.metadataStatSource.paginator = this.metadataStatsPaginator;
    this.deviceSource.paginator = this.devicePaginator;
  }
  private getDataSetup(): void {
    this.displayedPayloadColumns = [];
    this.displayedMetadataColumns = ['Dev_eui', 'Dev_time', 'snr','rssi','channel_rssi'];
    let allPayloadColumns = new Set<string>(this.displayedPayloadColumns);

    this.deviceList.forEach((device, index) => { 
      this.apiService.getData(device.devEUI).subscribe({
        next: (data: SensorData[]) => {
          const records = data.map((item: SensorData) => ({
            dev_eui: item.dev_eui,
            dev_time: item.dev_time.replace(' GMT', ''),
            payload_dict: JSON.parse(item.payload_dict),
            metadata_dict: JSON.parse(item.metadata_dict),
          }));
          this.payloadDataSource.data.push(...records);
          this.metadataSource.data.push(...records);

          this.filteredPayloadDataSource.data = [...this.payloadDataSource.data];
          this.filteredMetadataSource.data = [...this.metadataSource.data];
          this.filteredPayloadDataSource.data.flat()// = this.filteredPayloadDataSource.data.flat(Infinity)
          this.filteredMetadataSource.data.flat()// = this.filteredMetadataSource.data.flat(Infinity);
          // console.log('filteredPayloadDataSource: ', this.filteredPayloadDataSource.data)
          // console.log('filteredMetadataSource: ', this.filteredMetadataSource.data)

          records.forEach(record => {
            Object.keys(record.payload_dict).forEach(key => allPayloadColumns.add(key));
          })
          // console.log('Payload Columns: ', allPayloadColumns)

          if (index === this.deviceList.length -1) {
            this.displayedPayloadColumns = Array.from(allPayloadColumns);
          }
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
    });
    this.deviceList.forEach((device, index) => { 
      this.apiService.getPayloadStatisticsData(device.devEUI).subscribe({
        next: (data: any[]) => {
          const payloadStatRecord = Object.keys(data).map((key: any) => {
            const stats = data[key];

            return {
              devEUI: device.devEUI,
              column: key,
              mean: stats.mean,
              variance: stats.variance,
              standard_deviation: stats.standardDeviation,
              median: stats.median,
              mode: stats.mode,
            };
          });
            // console.log('payloadStatRecord: ',payloadStatRecord)

            this.payloadStatSource.data.push(...payloadStatRecord);
            this.filteredPayloadStatSource.data = [...this.payloadStatSource.data];
            this.filteredPayloadStatSource.data.flat();
            // console.log('Stat: ', this.payloadStatSource.data)
            // console.log('index: ', index)
          
        },

        error: (error) => {
          //console.error('Error: ', error);
        },
      });
      // console.log('Stat: ', this.payloadStatSource.data)
    });
    this.deviceList.forEach((device, index) => {    
      this.apiService.getMetadataStatisticsData(device.devEUI).subscribe({
        next: (data: any[]) => {
          const metadataStatRecord = Object.keys(data).map((key: any) => {
            const stats = data[key];
            return {
              devEUI: device.devEUI,
              column: key,
              mean: stats.mean,
              variance: stats.variance,
              standard_deviation: stats.standardDeviation,
              median: stats.median,
              mode: stats.mode,
            };            
          });
            // console.log('payloadStatRecord: ',payloadStatRecord)

            this.metadataStatSource.data.push(...metadataStatRecord);
            this.filteredMetadataStatSource.data = [...this.metadataStatSource.data];
            this.filteredPayloadStatSource.data.flat();
            // console.log('MetaStat: ', this.metadataStatSource.data)
            // console.log('index: ', index)
          
        },

        error: (error) => {
          //console.error('Error: ', error);
        },
      });
    });
    // this.fetchDevices();
    this.createPayloadChart(this.deviceList[0].devEUI);
    this.createMetadataChart(this.deviceList[0].devEUI);      
  }

  fetchDevices(): void {
    this.appId = this.route.snapshot.paramMap.get('app'); //From the current route, get the route name, which should be the identifier for what you need to render.
    this.devName = this.route.snapshot.paramMap.get('dev');
    ////console.log('appId1: ', this.appId);
    ////console.log('devName1: ', this.devName)
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
            ////console.log('index: ', resp.body.list[i].name);
            this.devices.push(resp.body.list[i].name);
            this.deviceList.push({
              name: resp.body.list[i].name,
              devEUI: resp.body.list[i].dev,              
            });
          }
        },
        error: (error) => {
          //console.error(error);
        },
      });
      this.deviceSource.data = this.deviceList;
      this.deviceSource.filter = '';
      this.deviceSource._updateChangeSubscription();
      ////console.log('Device Source1: ', this.deviceSource.data);
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
  applyFilter(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.filteredPayloadDataSource.filter = filterValue.trim().toLowerCase();
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
      //console.error('Error: ', Error);
    }
  }

  filterSensorData() {
    //console.log("this worked")
    const formValues = this.filterForm.value.range;
    // console.log("form Values: ", formValues);
    //console.log("payloadDataSource: ", this.payloadDataSource.data);
    const dict = this.payloadDataSource.data;
    //console.log("object keys:  ", Object.keys(dict[1].payload_dict));

    let variables : variableMap = {};

    Object.keys(dict[0].payload_dict).forEach(key =>{
      variables['value_${keys}'] = dict[0].payload_dict[key];
    })
    let dataValue: any;

    if (formValues.payloadSelect == true) {
      //console.log("in payload filter")
      this.filteredPayloadDataSource.data = this.payloadDataSource.data.filter((item) => {
        if(formValues){
          const dataTypeKey = formValues.dataType;
          dataValue = +item.payload_dict[dataTypeKey];
        }

        return (
          (!formValues.startTime || item.dev_time.includes(formValues.startTime)) &&
          (!formValues.endTime || item.dev_time.includes(formValues.endTime))  &&
          (!formValues.deviceId || item.dev_eui.includes(formValues.deviceId)) &&
          (!formValues.dateInfo || item.dev_time.includes(formValues.dateInfo)) &&
          (!formValues.min || (dataValue != null && dataValue >= formValues.min)) &&
          (!formValues.max || (dataValue != null && dataValue <= formValues.max)) 
        )
      });
      // if(this.filteredPayloadDataSource.paginator){
      //   this.filteredPayloadDataSource.paginator.firstPage();
      // }
    } 
    if (formValues.metadataSelect == true) {
      //console.log("in metadata filter")
      this.filteredMetadataSource.data = this.metadataSource.data.filter((item) => {
        const dataTypeKey = formValues.dataType;
        const value = +item.metadata_dict[dataTypeKey];

        return (
          (!formValues.startTime || item.dev_time.includes(formValues.startTime)) &&
          (!formValues.endTime || item.dev_time.includes(formValues.endTime))  &&
          (!formValues.deviceId || item.dev_eui.includes(formValues.deviceId)) &&
          (!formValues.dateInfo || item.dev_time.includes(formValues.dateInfo)) &&
          (!formValues.min || value >= formValues.min) &&
          (!formValues.max || value <= formValues.max) 
        )
      });
      // if(this.filteredMetadataSource.paginator){
      //   this.filteredMetadataSource.paginator.firstPage();
      // }
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
      //console.error('Invalid data format for CSV export');
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
      (item) => ({
        devEUI: item.dev_eui,
        devTime: item.dev_time,
        ...item.payload_dict
      })
    );
    this.exportToCSV( payloadData, 'payload_data.csv');
  }
  exportMetadata() {
    const metadata = this.metadataSource.data.map(
      (item) => ({
        devEUI: item.dev_eui,
        devTime: item.dev_time,
        ...item.metadata_dict
      })
    );
    this.exportToCSV( metadata, 'metadata_data.csv');
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
    link.href = this.payloadChart.toBase64Image();
    link.download = 'chart.png';
    link.click();
  }
  createPayloadChart(devId: string) {
    let payload: any
    let payloadTime: any
    this.deviceList.forEach((device, index) => {
      this.apiService.getPayload(device.devEUI).subscribe({
        next: (data: PayloadRecord[][]) => {
          payloadTime= data.map(
            (item: PayloadRecord[]) => item[0] as PayloadRecord
          );
          payload = data.map(
            (item: PayloadRecord[]) =>  item[1] as PayloadRecord
          );

          this.payloadTimeRecord.push(...payloadTime)
          this.payloadRecord.push(...payload)

          this.payloadTimeRecord.flat();
          this.payloadRecord.flat();
          this.payloadTimeRecord.reverse();

          // console.log('time: ', this.payloadTimeRecord);
          // console.log('record 1: ', this.payloadRecord);

          this.initializePayloadChart();
        },
        error: (error) => {
          //console.error('Error fetching payload data:', error);
        },
      });
    });
  }

  createMetadataChart(devId: string) {
    this.deviceList.forEach((device, index) => {
      this.apiService.getMetadata(device.devEUI).subscribe({
        next: (data: PayloadRecord[][]) => {
          this.metadataTimeRecord = data.map(
            (item: PayloadRecord[]) => item[0] as PayloadRecord
          );
          this.metadataRecord = data.map(
            (item: PayloadRecord[]) =>  item[1] as PayloadRecord
          );

          this.metadataTimeRecord.push(...this.metadataTimeRecord)
          this.metadataRecord.push(...this.metadataRecord)

          this.metadataTimeRecord.flat();
          this.metadataRecord.flat();
          this.metadataTimeRecord.reverse();

          // console.log('time: ', this.metadataTimeRecord);
          // console.log('record 1: ', this.metadataRecord);

          this.initializeMetadataChart();
        },
        error: (error) => {
          //console.error('Error fetching payload data:', error);
        },
      });
    });
  }
  initializePayloadChart() {
    // console.log('time: ', this.payloadTimeRecord);
    // console.log('record 2: ', this.payloadRecord);
    // console.log('columns: ', this.displayedPayloadColumns);
    let labels: any;
    let datasets: any;
    // const dataKeys = this.payloadRecord.map(record => Object.keys(record));
    // console.log('dataKeys: ', dataKeys);
    const ids = this.deviceList.map(record => record.devEUI);
    const ctx = document.getElementById('payloadChart') as HTMLCanvasElement;
    if (
      ctx &&
      this.payloadTimeRecord.length > 0 &&
      this.payloadRecord.length > 0
    ) {
      labels = this.payloadTimeRecord;

      // ids.forEach(id => {
      datasets = this.displayedPayloadColumns.map((col) => {
        return {
          label: col,
          data: this.payloadRecord.map((record) => +record[col]),
          fill: false,
          borderColor: this.getRandomColor(),
          tension: 0.1,
        };
      });
      // });

      if (this.payloadChart) {
        this.payloadChart.destroy();
      }

      // console.log('labels: ', labels);
      // console.log('datasets: ', datasets);

      this.payloadChart = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
          // scales: {
          //   y: {
          //     beginAtZero: true,
          //   },
          // },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }
  initializeMetadataChart() {
    // console.log('time: ', this.metadataTimeRecord);
    // console.log('record 2: ', this.metadataRecord[100]);
    let labels: any;
    let datasets: any = [];
    const meta_ctx = document.getElementById('metadataChart') as HTMLCanvasElement;
    if (
      meta_ctx &&
      this.metadataTimeRecord.length > 0 &&
      this.metadataRecord.length > 0
    ) {
      labels = this.metadataTimeRecord;
      const dataKeys = ['snr','rssi','channel_rssi'];
      const ids = this.deviceList.map(record => record.devEUI);
      // console.log('ids: ', ids);
      // console.log('dataKeys: ', dataKeys);

      // console.log('data: ', this.metadataRecord);

      ids.forEach((id, index) => {
        console.log('index: ', index)
        dataKeys.forEach(key => {
          const dataset = {
            label: `${id}: ${key}`,
            data: this.metadataRecord.slice(((index+1)*1)-((index+1)*100)).map(record => +record[key]),
            fill: false,
            borderColor: this.getRandomColor(),
            tension: 0.1,            
          };
          // console.log('dataset: ', dataset);
          datasets.push(dataset);
        });
      });

      if (this.metadataChart) {
        this.metadataChart.destroy();
      }

      this.metadataChart = new Chart(meta_ctx, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
          // scales: {
          //   y: {
          //     beginAtZero: true,
          //   },
          // },
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
    this.createMetadataChart(devId);
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
    // //console.log('Selection: ', this.selection.selected)
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    if (index !== undefined && row) {
      return `${
        this.selection.isSelected(row) ? 'deselect' : 'select'
      } row number ${index + 1}`;
    }
    ////console.warn('checkboxLabel wa called without a row or index.');
    return '';
  }
  shouldHighlightPayload(value: any, key: any): boolean {
    const dataValues = this.payloadStatSource.data;
    const statValues = dataValues[key+1];
    try{
      const mean = parseFloat(statValues.mean);
      const stddev = parseFloat(statValues.standard_deviation);
      if( (value > (mean + stddev)) && (value < (mean - stddev))){ 
        return true;
      }
      return false; 
    }
    catch{
      return false;
    }
  }

  shouldHighlightMetadata(value: any, key: any): boolean {
    const dataValues = this.metadataStatSource.data;
    const statValues = dataValues[key+1];
    try{
      const mean = parseFloat(statValues.mean);
      const stddev = parseFloat(statValues.standard_deviation);
      if( (value > (mean + stddev)) && (value < (mean - stddev))){ 
        return true;
      }
      return false; 
    }
    catch{
      return false;
    }
  }
}

