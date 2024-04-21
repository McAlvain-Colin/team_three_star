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
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { BadWordsFilterPipe } from '../badwords.pipe';

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
    BadWordsFilterPipe,
  ],
})
export class AddDeviceComponent {
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}
  deviceName: string = '';
  appId: string | null = '';
  orgId: string | null = '';
  joinEUI: string = '';
  devEUI: string = '';
  appKey: string = '';

  baseUrl: string = 'http://localhost:5000';

  ngOnInit(): void {
    this.appId = this.route.snapshot.paramMap.get('appId'); //From the current route, get the route name, which should be the identifier for what you need to render.
    // this.orgId = this.route.snapshot.paramMap.get('orgId');
  }

  //use the `` to allow connections to the variable in the declaration.
  //This submit form method will check for the user's email entry to see if it's correct, currently it will display the user's email if login was successful.
  submitForm() {
    const httpOptions = {
      // withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // charset: 'UTF-8',
        observe: 'response',
        responseType: 'json',
      }),
    };
    //Retrive user id from the link, and then Post message with orgData and userID to backend for adding to the table
    var message: string = `${this.deviceName} is added to your Organization!`;

    //Post stuff cuz we're creating things
    this.http
      .post(
        this.baseUrl + '/addOrgAppDevice',
        {
          appId: this.appId,
          devEUI: this.devEUI,
          joinEui: this.joinEUI,
          appKey: this.appKey,
          devName: this.deviceName,
        },
        httpOptions
      )
      .subscribe({
        next: (response) => {
          const responseString = JSON.stringify(response);
          let parsedRes = JSON.parse(responseString);
          if (parsedRes.body.DeviceAdded) {
            this.snackBar.open('device added', 'Close', {
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
        error: (error: HttpErrorResponse) => {

          const message = error.error.errorMessage;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      });
  }
}
