import { Component, Input, OnInit } from '@angular/core';
import { DeviceData } from '../app.component';
import { DeviceDataService } from '../../charts/device-data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DatePicker } from '../date-picker/date-picker.component';

import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-device-data',
  templateUrl: './device-data.component.html',
  styleUrls: ['./device-data.component.css'],
  providers: [DeviceDataService],
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
    MatFormFieldModule,
    DatePicker,
  ],
})
export class DeviceDataComponent implements OnInit {
  @Input() data!: DeviceData[];

  showSpinner: boolean = false;
  tempDevice!: DeviceData;
  typeOfChart!: string;
  startTime!: string;
  endTime!: string;
  startNumber: number = 0;

  constructor(private dataChart: DeviceDataService) {}

  // when page is create this happens. Loads chart
  ngOnInit(): void {
    this.dataChart.createSensorDataChart(this.data[this.startNumber]);
  }
  //creates spinners for button presses
  loadSpinner() {
    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
    }, 250);
  }
  //updates data
  updateData(row: DeviceData) {
    this.tempDevice = row;
    this.dataChart.updateChartData(row);
  }
  //non functioning as of demo
  addDevice() {}
  removeDevice() {}
  //creates a png thats placed in downloads
  exportData() {
    this.dataChart.getDownload();
  }
  //calculates avg value
  calculateAve(array: number[]): number {
    var total: number = 0;

    for (var i = 0; i < array.length; i++) {
      total = total + array[i];
    }
    var avg = total / array.length;
    return avg;
  }
  //rounds number to whole number
  roundNumber(value: number): number {
    return Math.round(value);
  }
  //none functioning as of demo
  updateDataByDate(
    row: DeviceData,
    startTime: FormControl<Date>,
    endTime: FormControl<Date>
  ) {
    for (var i = 0; i < row.time.length; i++) {
      if (row.time[i] >= typeof startTime && row.time[i] <= typeof endTime) {
        this.dataChart.updateChartData(row);
      }
    }
  }
}
