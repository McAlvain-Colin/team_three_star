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
import { HttpClient, HttpParams } from '@angular/common/http';

//using code from the filter page here since it is essentiall the same
//I want to redo this code if theres time using the pageinate module.
//Requires data rework and I dont wanna break it yet.
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
  ],
})
export class DevicePageComponent implements AfterViewInit {
  // private breakpointObserver = inject(BreakpointObserver);

  // I need to reimpliment this but the code seems to reject it will the onInit
  // isHandset$: Observable<boolean> = this.breakpointObserver
  //   .observe(Breakpoints.Handset)
  //   .pipe(
  //     map((result) => result.matches),
  //     shareReplay()
  //   );

  panelOpenState = false;
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
    private http: HttpClient
  ) {
    Chart.register(...registerables); // ...registerables is an array that contains all the components Chart.js offers
  }

  //chart variables.
  @Input() Devicelist!: SensorData[];

  showSpinner: boolean = false;
  // records!: SensorData;
  typeOfChart!: string;

  chart!: Chart;
  payloadChart!: Chart;
  metadataChart!: Chart;

  chartData!: number[];

  appId: string | null = '';
  devName: string | null = '';
  base_url: string = 'http://localhost:5000';
  deviceEUI: string = '';

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
        error: (error) => {
          console.error(error);
        },
      });

    // this.apiService.getData(this.deviceEUI).subscribe({
    //   next: (data: SensorData[]) => {
    //     const records = data.map((item: SensorData) => ({
    //       dev_eui: item.dev_eui,
    //       dev_time: item.dev_time,
    //       payload_dict: JSON.parse(item.payload_dict),
    //       metadata_dict: JSON.parse(item.metadata_dict),
    //     }));
    //     this.payloadDataSource.data = records;
    //     this.metadataSource.data = records;

    //     if (records.length > 0) {
    //       this.payloadColumns = Object.keys(records[0].payload_dict);
    //       this.metadataColumns = Object.keys(records[0].metadata_dict);
    //       this.displayedPayloadColumns = ['Dev_eui', 'Dev_time'].concat(
    //         this.payloadColumns
    //       );
    //       this.displayedMetadataColumns = ['Dev_eui', 'Dev_time'].concat(
    //         this.metadataColumns
    //       );
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error: ', error);
    //   },
  // // });
  //   console.log('DEV_EUI_2', this.deviceEUI);

  //   this.createPayloadChart(this.deviceEUI);
  //   this.createMetadataChart();
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

  addDevice(): void {}
  removeDevice(): void {}

  private getDataSetup(): void {
    if(this.deviceEUI) {
      this.apiService.getData(this.deviceEUI).subscribe({
        next: (data: SensorData[]) => {
          const records = data.map((item: SensorData) => ({
            dev_eui: item.dev_eui,
            dev_time: item.dev_time,
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
  
      this.createPayloadChart(this.deviceEUI);
      this.createMetadataChart();
    }
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
  createPayloadChart(devId: string) {
    this.apiService.getPayload(devId).subscribe({
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

  createMetadataChart() {
    this.apiService.getMetadata().subscribe({
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
}
