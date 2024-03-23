import { Component } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatToolbarModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    HttpClientModule,
    TempNavBarComponent,
    NgIf,
  ],
})
export class AddDeviceComponent {
  constructor(private snackBar: MatSnackBar, private http: HttpClient) {}
  deviceName: string = '';
  appID: string = '';
  joinEUI: string = '';
  devEUI: string = '';
  appKey: string = '';

  baseUrl: string = 'http://localhost:5000';

  //use the `` to allow connections to the variable in the declaration.
  //This submit form method will check for the user's email entry to see if it's correct, currently it will display the user's email if login was successful.
  submitForm() {
    const httpOptions = {
      // withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        charset: 'UTF-8',
        observe: 'response',
        responseType: 'json',
      }),
    };
    //Retrive user id from the link, and then Post message with orgData and userID to backend for adding to the table
    var message: string = `${this.deviceName} is added to your Organization!`;

    //Post stuff cuz we're creating things
    this.http
      .post(
        this.baseUrl + 'createDevice',
        { appId: this.appID, joinEui: this.joinEUI, appKey: this.appKey },
        httpOptions
      )
      .subscribe({
        next: (response) => {
          const responseString = JSON.stringify(response);
          let parsedRes = JSON.parse(responseString);
          if (parsedRes.addSuccess) {
            this.snackBar.open(message, 'Close', {
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          } else {
            message = 'Failed to find device, please try again later.';
            this.snackBar.open(message, 'Close', {
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        },
        error: (error) => {
          message = 'There was an error that occurred: \n' + error;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });
  }
}