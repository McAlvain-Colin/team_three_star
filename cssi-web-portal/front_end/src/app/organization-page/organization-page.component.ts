import { Component, inject } from '@angular/core';
import { DataLayout } from '../data.config';
import { RequestService } from '../request.service';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatButtonModule } from '@angular/material/button';
import { DeviceMapComponent } from '../device-map/device-map.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';

@Component({
  selector: 'app-organization-page',
  templateUrl: './organization-page.component.html',
  styleUrls: ['./organization-page.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatGridListModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    TempNavBarComponent,
    DeviceMapComponent,
  ],
})
export class OrganizationPageComponent {
  //   //Here we're injecting the service into the component's constructor so that we can call the service's methods
  //   constructor(private requestService: RequestService) {}
  //   config: DataLayout | undefined;
  //   headers: Array<string> | undefined;
  //   //Broadcasts a data parameter with the Config interface layout, and then maps it into values for the object in this class
  //   //Subscribe is a method of the HTTPClient which allows us to make an HTTP request for the backend
  //   showData() {
  //     this.requestService
  //       .getJson()
  //       //Calls the method to locate the Url to get the data from, then submits an HTTP Request where we clone the data over to config since they have the same type using destructuring
  //       .subscribe((data) => (this.config = { ...data }));
  //   }
  //   showServerResponse() {
  //     this.requestService
  //       .getResponse()
  //       //This subscription asks the server for a response, and the casts that response into the attributes in the HTTP Response class
  //       .subscribe((response) => {
  //         //Assigning keys from the values received from the the HTTP Request as well as the headers
  //         const keys = response.headers.keys();
  //         this.headers = keys.map(
  //           (key) => '${key}: ${response.headers.get(key)}'
  //         );
  //         //Accesses the body of the response which has the typing as DataLayout
  //         this.config = { ...response.body! };
  //       });
  //   }
  //   newData() {
  //     //this.requestService.sendData(newData); //Sends a newData variable to the sendData function to be processed
  //   }

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
}
