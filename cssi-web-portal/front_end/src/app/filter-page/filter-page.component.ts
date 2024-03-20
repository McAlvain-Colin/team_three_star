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

//testing the inteface as a solution next to several individual declations
export interface SensorData {
  dev_eui: any;
  dev_time: any; 
  payload_dict: any; 
  metadata_dict: any;
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
  panelOpenState = false;
  panelOpenStateDevEUI = false;
  panelOpenStatePayload = false;
  panelOpenStateMetadata = false;
  panelOpenStatePayloadGraph = false;
  panelOpenStateMetadataGraph = false;
  panelOpenStateDeviceSelect = false;

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

  filterForm!: FormGroup;
  disabled = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;

  defaultValue: [number, number] = [1, 1000];

  showSpinner: boolean = false;

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
        endValue: [{ value: this.defaultValue[1], disable: true}]
      }),
      dataType: [''],//, Validators.pattern('[a-zA-Z ]*')],
      deviceId: [''],//, Validators.pattern('[a-zA-Z ]*')],
      applicationID: [''],//, Validators.pattern('[a-zA-Z0-9]**')],
      location: [''],//, Validators.pattern('[a-zA-Z ]*')]
      metadataSelect: false,
      payloadSelect: false
    });

    // this.apiService.getAltData().subscribe((data: any) => {
    //   const ctx = document.getElementById('myChart') as HTMLCanvasElement;  //ctx is the canvas for the chart
    //   const myChart = new Chart(ctx, {   //render chart
    //     type: 'line',  //line chart 
    //     data: {
    //       labels: data.map(d => d.label),
    //       datasets: [{
    //         label: 'Your Data Label',
    //         data: data.map(d => d.value), 
    //         borderWidth: 1
    //       }]
    //     },
    //     options: {
    //       scales: {
    //         y: {
    //           beginAtZero: true
    //         }
    //       }
    //     }
    //   });
    // });
  }

  @ViewChild('payloadPaginator') payloadPaginator!: MatPaginator;
  @ViewChild('metadataPaginator') metadataPaginator!: MatPaginator;

  payloadDataSource = new MatTableDataSource<SensorData>([]);
  metadataSource = new MatTableDataSource<SensorData>([]);


  ngAfterViewInit() {
    this.payloadDataSource.paginator = this.payloadPaginator;
    this.metadataSource.paginator = this.metadataPaginator;
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
  //----------------------------------------------------------------------------
  // added for visual acions, once a button is clicked, this function is called to added a loading spinner for effect of loading on the page for 250 milliseconds.
  loadSpinner() {
    this.showSpinner = true;
    setTimeout(() =>{this.showSpinner = false}, 250)
  }
}