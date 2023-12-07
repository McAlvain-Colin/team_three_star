import { Component, Input, OnInit } from '@angular/core';
import { DataStats } from '../app.component';
import { DataStatsService } from '../../charts/data-stats.service';
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
  selector: 'app-device-stats',
  templateUrl: './device-stats.component.html',
  styleUrls: ['./device-stats.component.css'],
  providers: [DataStatsService],
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
    DatePicker,
  ],
})
export class DeviceStatsComponent implements OnInit {
  @Input() stats!: DataStats[];

  showSpinner: boolean = false;
  tempDevice!: DataStats;
  typeOfChart!: string;
  startTime!: string;
  endTime!: string;

  constructor(private statsChart: DataStatsService) {}

  ngOnInit(): void {
    this.statsChart.createStatsChart(this.stats[0]);
  }

  loadSpinner() {
    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
    }, 250);
  }
  updateData(row: DataStats){
    this.statsChart.updateChartData(row);
  }
  addDevice(){}
  removeDevice(){}
  exportData(){
    this.statsChart.getDownload();
  }


  calculateAve(array: number[]): number {
    var total: number= 0;

    for(var i = 0; i < array.length; i++){
      total = total + array[i]
    }
    var avg = total/array.length
    return avg
  }
  roundNumber(value: number): number {
    return Math.round(value);
  }
  updateDataByDate(row: DataStats, startTime: FormControl<Date>, endTime: FormControl<Date>) {
    for (var i = 0; i < row.time.length; i++) {
      if (row.time[i] >= typeof startTime && row.time[i] <= typeof endTime) {
        this.statsChart.updateChartData(row);
      }
    }
  }
  
}