import { Component, Input, OnInit } from '@angular/core';
import { DeviceElement } from '../app.component';
import { ChartService } from '../chart.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-device-data',
  templateUrl: './device-data.component.html',
  styleUrls: ['./device-data.component.css'],
  providers: [ChartService],
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
export class DeviceDataComponent implements OnInit {
  @Input() Devicelist!: DeviceElement[];

  showSpinner: boolean = false;
  tempDevice!: DeviceElement;

  constructor(private chart: ChartService) {}

  ngOnInit(): void {
    this.chart.createPktLossChart(this.Devicelist[0]);
  }

  viewDeviceHealth(row: DeviceElement) {
    this.tempDevice = row;
    this.chart.updateChartData(row);
  }

  viewDevicePktloss() {
    this.chart.updateChartData(this.tempDevice);
  }

  viewDeviceBattery() {
    this.chart.toBarChart(this.tempDevice);
  }
  loadSpinner() {
    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
    }, 250);
  }
}
