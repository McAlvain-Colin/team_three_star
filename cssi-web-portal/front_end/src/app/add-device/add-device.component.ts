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
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { BadWordsFilterPipe } from '../badwords.pipe';
import Filter from 'bad-words';

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
  nameBadWords: boolean = false;

  baseUrl: string = 'http://localhost:5000';

  ngOnInit(): void {
    this.appId = this.route.snapshot.paramMap.get('appId'); //From the current route, get the route name, which should be the identifier for what you need to render.
    this.orgId = this.route.snapshot.paramMap.get('orgId');
  }

  checkBadWords(checkWord: string) {
    var filter = new Filter();

    if (filter.isProfane(checkWord)) {
      this.nameBadWords = true;
      this.deviceName = filter.clean(checkWord);
    } else {
      this.nameBadWords = false;
      this.deviceName = checkWord;
    }
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

    if (this.nameBadWords) {
      message = "Please don't use bad words in your inputs.";
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else {
      //  a POST request to the addOrgAppDevice route, request body contains an object with five properties: appId, devEUI, joinEui, appKey, and devName for the backend. The .subscribe() method is used to handle the response from the server.
      // The next callback function is executed when the server responds with a successful HTTP status code, a success message is displayed using the Angular Material snackBar component, indicating that the device has been added.The error callback function is executed when the server responds with an error HTTP status code (e.g., 400 Bad Request, 500 Internal Server Error).
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
            if (parsedRes.DeviceAdded) {
              this.snackBar.open(this.deviceName + ' has been added', 'Close', {
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
          },
        });
    }
  }
}
