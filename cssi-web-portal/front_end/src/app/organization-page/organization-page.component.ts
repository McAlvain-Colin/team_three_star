// default page. Needs to be built
import { Component, Input, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DatePicker } from '../date-picker/date-picker.component';
import { DataLayout } from '../data.config';
import { ConnectionService } from '../connection.service';

import { AboutComponent } from '../about/about.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-organization-page',
  templateUrl: './organization-page.component.html',
  styleUrls: ['./organization-page.component.css'],
  providers: [],
  standalone: true,
  imports: [
    AboutComponent,
    ContactComponent,
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
export class OrganizationPageComponent {
  //Here we're injecting the service into the component's constructor so that we can call the service's methods
  constructor(private connectionService: ConnectionService) {}

  config: DataLayout | undefined;

  //Broadcasts a data parameter with the Config interface layout, and then maps it into values for the object in this class
  //Subscribe is a method of the HTTPClient which allows us to make an HTTP request for the backend
  showData() {
    this.connectionService
      .getJson()
      //Calls the method to locate the Url to get the data from, then submits an HTTP Request where we clone the data over to config since they have the same type
      .subscribe((data) => (this.config = { ...data }));
  }
}
