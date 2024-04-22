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
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  form = new FormGroup({
    notes: new FormControl('')
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
    private snackBar: MatSnackBar 
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
  
        }
      });
  }

  @ViewChild('payloadPaginator') payloadPaginator!: MatPaginator;
  @ViewChild('metadataPaginator') metadataPaginator!: MatPaginator;
  @ViewChild('devIDPaginator') devIDPaginator!: MatPaginator;
  @ViewChild('payloadStatsPaginator') payloadStatsPaginator!: MatPaginator;
  @ViewChild('metadataStatsPaginator') metadataStatsPaginator!: MatPaginator;

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
  }

  addDevice(): void {}
  removeDevice(): void {}

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
            this.displayedMetadataColumns = ['Dev_eui', 'Dev_time', 'snr','rssi','channel_rssi'];
          }
        },
        error: (error) => {
          console.error('Error: ', error);
        },
      });
      this.apiService.getdevAnnotation(this.deviceEUI).subscribe({
        next: (data: string) => {
          console.log("annotation: ", data)
          this.deviceAnnotation = data},
        error: (error) => {console.error('Error: ', error);},
      });
      console.log('Annotation', this.deviceAnnotation);
  
      this.createPayloadChart(this.deviceEUI);
      this.createMetadataChart(this.deviceEUI);
    }
    this.apiService.getPayloadStatisticsData(this.deviceEUI).subscribe({
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
    this.apiService.getMetadataStatisticsData(this.deviceEUI).subscribe({
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

  createMetadataChart(devId: string) {
    this.apiService.getMetadata(this.deviceEUI).subscribe({
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
  }
  initializeMetadataChart() {
    const meta_ctx = document.getElementById('metadataChart') as HTMLCanvasElement;
    if (
      meta_ctx &&
      this.metadataTimeRecord.length > 0 &&
      this.metadataRecord.length > 0
    ) {
      const labels = this.metadataTimeRecord;
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
  }
  shouldHighlightPayload(value: any, key: any): boolean {
    const dataValues = this.paylaodStatSource.data;
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
  onSubmit(){
    console.log('Form Submitted: ', this.form.value)
    const notesValue = this.form.value['notes'];
    if(notesValue !== null && notesValue !== undefined){
      this.apiService.setdevAnnotation(this.deviceEUI, notesValue).subscribe({
        next: (data: string) => {
          console.log("annotation: ", data);
          this.deviceAnnotation = data;
      },
      error: (error) => {console.error('Error: ', error);},
      });
    }
    else {
      console.error('No notes to submit');
    }
  }
}
