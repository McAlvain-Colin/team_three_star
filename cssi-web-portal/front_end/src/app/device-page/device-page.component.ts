import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatButtonModule } from '@angular/material/button';
import { DeviceMapComponent } from '../device-map/device-map.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DatePicker } from '../date-picker/date-picker.component';
import { saveAs } from 'file-saver';

import { Chart, registerables } from 'chart.js/auto';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, PercentPipe } from '@angular/common';
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
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimerService } from '../login/login.component';
import * as Leaflet from 'leaflet';
import { MatRippleModule } from '@angular/material/core';

//using code from the filter page here since it is essentiall the same
//I want to redo this code if theres time using the pageinate module.
//Requires data rework and I dont wanna break it yet.
export interface SensorData {
  dev_eui: any;
  dev_time: any;
  payload_dict: any;
  metadata_dict: any;
}
export interface DeviceLocation {
  dev_eui: any;
  latitude: any;
  longitude: any;
  altitude: any;
  type: any;
  application: any;
}

interface PayloadRecord {
  [key: string]: number | string;
}

@Component({
  selector: 'app-device-page',
  templateUrl: './device-page.component.html',
  styleUrls: ['./device-page.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatGridListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatExpansionModule,
    MatButtonModule,
    TempNavBarComponent,
    DeviceMapComponent,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    NgFor,
    MatTableModule,
    MatPaginatorModule,
    DatePicker,
    NgIf,
    MatProgressSpinnerModule,
    PercentPipe,
    ReactiveFormsModule,
    MatSliderModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatRippleModule,
  ],
})
export class DevicePageComponent implements AfterViewInit {
  form = new FormGroup({
    notes: new FormControl(''),
  });
  // private breakpointObserver = inject(BreakpointObserver);

  // I need to reimpliment this but the code seems to reject it will the onInit
  // isHandset$: Observable<boolean> = this.breakpointObserver
  //   .observe(Breakpoints.Handset)
  //   .pipe(
  //     map((result) => result.matches),
  //     shareReplay()
  //   );

  panelOpenState = false;
  panelMetaOpenState = false;
  panelOpenStatePayload = false;
  panelOpenStateMetadata = false;
  panelOpenStatePayloadGraph = false;
  panelOpenStateMetadataGraph = false;

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

  payloadRecord: PayloadRecord[] = [];
  payloadTimeRecord: PayloadRecord[] = [];
  metadataRecord: PayloadRecord[] = [];
  metadataTimeRecord: PayloadRecord[] = [];

  selection = new SelectionModel<string>(true, []);

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private timerService: TimerService
  ) {
    Chart.register(...registerables); // ...registerables is an array that contains all the components Chart.js offers
  }

  //chart variables.
  @Input() Devicelist!: SensorData[];
  @Input() locationRecord!: DeviceLocation[];

  myMap!: Leaflet.Map;
  sensorIcon: Leaflet.Icon<Leaflet.IconOptions> = Leaflet.icon({
    iconUrl: '../assets/sensor.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  //array to keep map sensor info
  sensors: Leaflet.Marker<any>[] = [];
  gateways: Leaflet.Circle<any>[] = [];

  showSensors: boolean = false;
  showGateways: boolean = false;

  // locationRecord: DeviceLocation[] = [];
  // locationData: DeviceLocation[] = [];

  // orgId: string | null = "";
  // appId: string | null = "";
  // devName: string | null = "";

  showSpinner: boolean = false;
  // records!: SensorData;
  typeOfChart!: string;

  chart!: Chart;
  payloadChart!: Chart;
  metadataChart!: Chart;

  chartData!: number[];

  appId: string | null = '';
  orgId: string | null = '';
  devName: string | null = '';
  base_url: string = 'http://localhost:5000';
  deviceEUI: string = '';
  deviceAnnotation: string = 'No Annotations';

  //when this page is initiated, get data from the apiService. Should connect to back end an get data from database.
  //currently hard coded until I learn how to send data back to backend so I can get data other than lab_sensor_json
  //itterating code to try and get the data in a formate I can use.
  ngOnInit(): void {
    this.appId = this.route.snapshot.paramMap.get('app'); //From the current route, get the route name, which should be the identifier for what you need to render.
    this.orgId = this.route.snapshot.paramMap.get('org');
    this.devName = this.route.snapshot.paramMap.get('dev');

    const param = new HttpParams()
      .set('app', this.appId != null ? this.appId : '-1')
      .set('devName', this.devName != null ? this.devName : 'none');

    // this is for giving one device EUI from the given dev name from the user.
    this.http
      .get(this.base_url + '/userOrgAppDevice', {
        observe: 'response',
        responseType: 'json',
        params: param,
      })
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response);

          let resp = JSON.parse(res);

          console.log('resp is in app page', resp.body.dev_eui);
          this.deviceEUI = resp.body.dev_eui;
          console.log('DEV_EUI', this.deviceEUI);
          this.getDataSetup();
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error.errorMessage;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });
  }

  logout() {
    this.timerService.logout();
  }

  @ViewChild('payloadPaginator') payloadPaginator!: MatPaginator;
  @ViewChild('metadataPaginator') metadataPaginator!: MatPaginator;
  @ViewChild('devIDPaginator') devIDPaginator!: MatPaginator;
  @ViewChild('payloadStatsPaginator') payloadStatsPaginator!: MatPaginator;
  @ViewChild('metadataStatsPaginator') metadataStatsPaginator!: MatPaginator;
  @ViewChild('locationPaginator') locationPaginator!: MatPaginator;

  locationSource = new MatTableDataSource<DeviceLocation>([]);
  payloadDataSource = new MatTableDataSource<SensorData>([]);
  metadataSource = new MatTableDataSource<SensorData>([]);
  devIDSource = new MatTableDataSource<string>([]);
  paylaodStatSource = new MatTableDataSource<any>([]);
  metadataStatSource = new MatTableDataSource<any>([]);

  ngAfterViewInit() {
    this.payloadDataSource.paginator = this.payloadPaginator;
    this.metadataSource.paginator = this.metadataPaginator;
    this.devIDSource.paginator = this.devIDPaginator;
    this.paylaodStatSource.paginator = this.payloadStatsPaginator;
    this.metadataStatSource.paginator = this.metadataStatsPaginator;
    this.locationSource.paginator = this.locationPaginator;
  }

  addDevice(): void {}
  removeDevice(): void {}

  private getDataSetup(): void {
    if (this.deviceEUI) {
      this.apiService.getData(this.deviceEUI, '100').subscribe({
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
            this.displayedMetadataColumns = [
              'Dev_eui',
              'Dev_time',
              'snr',
              'rssi',
              'channel_rssi',
            ];
          }
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
      this.apiService.getdevAnnotation(this.deviceEUI).subscribe({
        next: (data: string) => {
          console.log('annotation: ', data);
          this.deviceAnnotation = data;
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
      console.log('Annotation', this.deviceAnnotation);

      this.createPayloadChart(this.deviceEUI);
      this.createMetadataChart(this.deviceEUI);
    }
    this.apiService.getPayloadStatisticsData(this.deviceEUI, '100').subscribe({
      next: (data: any[]) => {
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
        // //console.log(payloadStatRecord)

        this.paylaodStatSource.data = payloadStatRecord;
      },

      error: (error) => {
        //console.error('Error: ', error);
      },
    });
    this.apiService.getMetadataStatisticsData(this.deviceEUI, '100').subscribe({
      next: (data: any[]) => {
        ////console.log(data);
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
        ////console.log(metadataStatRecord);

        this.metadataStatSource.data = metadataStatRecord;
      },

      error: (error) => {
        //console.error('Error: ', error);
      },
    });

    this.apiService.getDeviceLocation(this.deviceEUI).subscribe({ 
      next: (data: any[]) => {
        const locationRecord = data.map((item: any) => ({
          dev_eui: item[0],
          latitude: item[1],
          longitude: item[2],
          altitude: item[3],
          type: item[4],
          application: item[5],
        }));
        console.log('location record: ', locationRecord)

        this.locationSource.data = locationRecord;
        // this.locationData = this.locationSource.data;

        console.log("Location Source: ", this.locationSource.data);
        console.log("Location keys: ", Object.keys(this.locationSource.data));

        console.log("Location Size: ", this.locationSource.data.length);

        
        if (this.showSensors === false) {
          this.showSensors = true;

          for (let i = 0; i < this.locationSource.data.length; i++) {
            if(this.locationSource.data[i].type === 'device') {
              this.sensors[i] = Leaflet.marker(
                Leaflet.latLng(
                  this.locationSource.data[i].latitude,
                  this.locationSource.data[i].longitude,
                  this.locationSource.data[i].altitude,                  
                ),
                { 
                  icon: this.sensorIcon,
                  title: this.locationSource.data[i].application
                }
              )
                .addTo(this.myMap)
                .bindPopup('endDevice: ' + this.locationSource.data[i].dev_eui.toString());
            }
          }
        }

        if (this.showGateways === false) {
          this.showGateways = true;
          for (let i = 0; i < this.locationSource.data.length; i++) {
            if(this.locationSource.data[i].type === 'gateway') {
              this.gateways[i] = Leaflet.circle(
                Leaflet.latLng(
                  this.locationSource.data[i].latitude,
                  this.locationSource.data[i].longitude,
                  this.locationSource.data[i].altitude,
                ),
                { radius: 25000 }
              )
                .addTo(this.myMap)
                .bindPopup('gateway: ' + this.locationSource.data[i].dev_eui.toString());
            }
          }
        }
      },

      error: (error) => {
        console.error('Error: ', error);
      },
    });

    this.myMap = Leaflet.map('map').setView([39.1, -120.05], 9);
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.myMap);
  }

  //filter function in order to allow users display only realivant data.
  //filters requested by pi
  // -Date(start/end) :option there:
  // -Time of day(start hour/end hour)(Across multiple days)
  // -Data range of values (min/max)
  // -Data type (temperature, moisture, pressure, etc)
  // -Device ID
  // -Functional Group/Application id
  // -Device location/area
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
  applyPayloadFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.payloadDataSource.filter = filterValue.trim().toLowerCase();
  }
  applyMetadataFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.metadataSource.filter = filterValue.trim().toLowerCase();
  }
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
    const payloadData = this.payloadDataSource.data.map((item) => ({
      devEUI: item.dev_eui,
      devTime: item.dev_time,
      ...item.payload_dict,
    }));
    this.exportToCSV(payloadData, 'payload_data.csv');
  }
  exportMetadata() {
    const metadata = this.metadataSource.data.map((item) => ({
      devEUI: item.dev_eui,
      devTime: item.dev_time,
      ...item.metadata_dict,
    }));
    this.exportToCSV(metadata, 'metadata_data.csv');
  }
  createPayloadChart(devId: string) {
    this.apiService.getPayload(devId, '100').subscribe({
      next: (data: PayloadRecord[][]) => {
        this.payloadTimeRecord = data.map(
          (item: PayloadRecord[]) => item[0] as PayloadRecord
        );
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

  createMetadataChart(devId: string) {
    this.apiService.getMetadata(this.deviceEUI, '100').subscribe({
      next: (data: PayloadRecord[][]) => {
        this.metadataTimeRecord = data.map(
          (item: PayloadRecord[]) => item[0] as PayloadRecord
        );
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
      const labels = Array.from(
        { length: this.payloadTimeRecord.length },
        (_, i) => i + 1
      );
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
        plugins: [
          {
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart, args, options) => {
              const { ctx } = chart;
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            },
          },
        ],
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
      const labels = this.metadataTimeRecord;//Array.from({length: this.metadataTimeRecord.length }, (_,i) =>i+1); 
      const dataKeys = ['snr','rssi','channel_rssi'];
      const datasets = dataKeys.map((key) => {
        return {
          label: key,
          data: this.metadataRecord.map((record) => +record[key]),
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
        plugins: [
          {
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart, args, options) => {
              const { ctx } = chart;
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            },
          },
        ],
      });
    }
  }
  shouldHighlightPayload(value: any, key: any): boolean {
    const dataValues = this.paylaodStatSource.data;
    const statValues = dataValues[key + 1];
    try {
      const mean = parseFloat(statValues.mean);
      const stddev = parseFloat(statValues.standard_deviation);
      if (value > mean + stddev && value < mean - stddev) {
        return true;
      }
      return false;
    } catch {
      return false;
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
  getDownload() {
    let link = document.createElement('a');
    link.href = this.chart.toBase64Image();
    link.download = 'chart.png';
    link.click();
  }
  loadSpinner() {
    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
    }, 250);
  }
  onSubmit() {
    console.log('Form Submitted: ', this.form.value);
    const notesValue = this.form.value['notes'];
    if (notesValue !== null && notesValue !== undefined) {
      this.apiService.setdevAnnotation(this.deviceEUI, notesValue).subscribe({
        next: (data: string) => {
          console.log('annotation: ', data);
          this.deviceAnnotation = data;
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
    } else {
      console.error('No notes to submit');
    }
  }
  getDownloadPayloadChart() {
    let link = document.createElement('a');
    link.href = this.payloadChart.toBase64Image();
    link.download = 'chart.png';
    link.click();
  }
  getDownloadMetadataChart() {
    let link = document.createElement('a');
    link.href = this.metadataChart.toBase64Image();
    link.download = 'chart.png';
    link.click();
  }

  // ###################################################################################
  

  // ngAfterViewInit() {
  //   this.locationSource.paginator = this.locationPaginator;
  // }

  // addMarkers method will check if gateways are being displayed, if they are, the boolean value for checking gateway visibility is changed to false, the gateways icons previously added will be removed from the map and the array containing the gateway icons.
  // if the end devices sensors are not being displayed, then the method will places the sensor icons using the marker function from Leaflet JS, which are created using the end device locations retrieved from the current selected device from the device list and will be placed on top of the map layer,
  // and also add sensor popup icons depending on if the user clicks on the end device icon which as been added to the map. This was built using the marker documentation on Leaflet https://leafletjs.com/reference.html#marker
  addMarkers(): void {
    console.log('locationData: ',this.locationSource)
    if (this.showGateways === true) {
      this.showGateways = false;
      for (let i = this.gateways.length - 1; i >= 0; i--) {
        this.gateways[i].removeFrom(this.myMap);
        this.gateways.pop();
      }
    }

    if (this.showSensors === false) {
      this.showSensors = true;
      //placing all sensor locations in an array to be used later to delete if view gateways is called as well as placing the sensors into the leaflet map
      console.log(this.locationRecord.length);
      for (let i = 0; i < this.locationRecord.length; i++) {
        this.sensors[i] = Leaflet.marker(
          Leaflet.latLng(
            this.locationRecord[i].latitude,
            this.locationRecord[i].longitude,
            this.locationRecord[i].altitude
          ),
          { icon: this.sensorIcon }
        )
          .addTo(this.myMap)
          .bindPopup('endDevice: ' + this.locationRecord[i].dev_eui.toString());
      }
    }
  }

  // ShowGatewayRanges method will check if end device icons are being displayed, if they are, the boolean value for tracking end devices is changed to false, the end device sensor icons previously added will be removed from the map and the array containing the end device sensor icons.
  // if the gateways are not being displayed, then the method will places the gateway polygons using the circle method from the Leaflet JS, which are created using the gateway locations retrieved from the current selected device from the device list and will be placed on top of the map layer using methods from Leaflet JS library,
  // and also add gateway popup icons with EUI and depending on if the user clicks on any one of the gateway polygon which as been added to the map. The circle method comes from the Leaflet JS Documentation provided here: https://leafletjs.com/reference.html#circle
  showGatewayRanges() {
    if (this.showSensors === true) {
      for (let i = this.sensors.length - 1; i >= 0; i--) {
        this.sensors[i].removeFrom(this.myMap);
        this.sensors.pop();
      }
      this.showSensors = false;
    }
    if (this.showGateways === false) {
      this.showGateways = true;

      for (let i = 0; i < this.locationRecord.length; i++) {
        this.gateways[i] = Leaflet.circle(
          Leaflet.latLng(
            this.locationRecord[i].latitude,
            this.locationRecord[i].longitude
          ),
          { radius: 3500 }
        )
          .addTo(this.myMap)
          .bindPopup('gateway: ' + this.locationRecord[i].dev_eui.toString());
      }
    }
  }

  // showDevicesAndGateways will check if either types of icons are showing, end device sensors or gateways, if either one isnt displaying, then the method will add the missing type of layer to the map with similar functionality from showGatewayRanges or
  // addMarkers methods above.
  showDevicesAndGateways() {
    if (this.showSensors === false) {
      this.showSensors = true;

      for (let i = 0; i < this.locationRecord.length; i++) {
        this.sensors[i] = Leaflet.marker(
          Leaflet.latLng(
            this.locationRecord[i].latitude,
            this.locationRecord[i].longitude
          ),
          { icon: this.sensorIcon}
        )
          .addTo(this.myMap)
          .bindPopup('endDevice: ' + this.locationRecord[i].dev_eui.toString());
      }
    }

    if (this.showGateways === false) {
      this.showGateways = true;
      for (let i = 0; i < this.locationRecord.length; i++) {
        this.gateways[i] = Leaflet.circle(
          Leaflet.latLng(
            this.locationRecord[i].latitude,
            this.locationRecord[i].longitude
          ),
          { 
            radius: 3500, 
            color: '#ff3388',
            fillColor: 'red'
          },
        )
          .addTo(this.myMap)
          .bindPopup('gateway: ' + this.locationRecord[i].dev_eui.toString());
      }
    }
  }

  // Flyto method will use the flyto method from the leaflet JS library to indicate that if sensors or gateways are being displayed, then the map will center the map based on the location attributes from the device sent in as a parameter, this implementation was based off the Leaflet documetntation
  // here :https://leafletjs.com/reference.html#map-flyto
  flyTo(row: DeviceLocation) {
    if (this.showSensors === true) {
      this.myMap.flyTo(Leaflet.latLng(row.latitude, row.longitude), 11);
    }
    if (this.showGateways === true) {
      this.myMap.flyTo(Leaflet.latLng(row.latitude, row.longitude), 11);
    }
  }
}
