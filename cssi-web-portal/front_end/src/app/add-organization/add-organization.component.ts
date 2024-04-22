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
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { BadWordsFilterPipe } from '../badwords.pipe';
import Filter from 'bad-words';

@Component({
  selector: 'app-add-organization',
  templateUrl: './add-organization.component.html',
  styleUrls: ['./add-organization.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatToolbarModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    TempNavBarComponent,
    NgIf,
    BadWordsFilterPipe,
  ],
})
export class AddOrganizationComponent {
  constructor(private snackBar: MatSnackBar, private http: HttpClient) {}
  orgName: string = '';
  orgDescription: string = '';
  userID: number = 0; //Set this from the link in order to navigate back home.
  nameBadWords: boolean = false;
  descriptBadWords: boolean = false;

  baseUrl: string = 'http://localhost:5000';

  checkBadWords(checkWord: string, itemType: number) {
    var filter = new Filter();

    if (filter.isProfane(checkWord)) {
      if (itemType == 0) {
        this.nameBadWords = true;
        this.orgName = filter.clean(checkWord);
      }
      if (itemType == 1) {
        this.descriptBadWords = true;
        this.orgDescription = filter.clean(checkWord);
      }
    } else {
      if (itemType == 0) {
        this.nameBadWords = false;
        this.orgName = checkWord;
      }
      if (itemType == 1) {
        this.descriptBadWords = false;
        this.orgDescription = checkWord;
      }
    }
  }

  //use the `` to allow connections to the variable in the declaration.
  //This submit form method will check for the user's email entry to see if it's correct, currently it will display the user's email if login was successful.
  submitForm() {
    //Retrive user id from the link, and then Post message with orgData and userID to backend for adding to the table
    const httpOptions = {
      // withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        observe: 'response',
        responseType: 'json',
      }),
    };

    var message: string = `${this.orgName} is added to your Organizations!`;

    if (this.nameBadWords || this.descriptBadWords) {
      message = "Please don't use bad words in your inputs.";
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else {
      this.http
        .post(
          this.baseUrl + '/createOrg',
          {
            orgName: this.orgName,
            orgDescript: this.orgDescription,
          },
          httpOptions
        )
        .subscribe({
          next: (response) => {
            const responseString = JSON.stringify(response);
            let parsedRes = JSON.parse(responseString);

            console.log(parsedRes);
            if (parsedRes.orgCreated) {
              this.snackBar.open(message, 'Close', {
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            } else {
              message =
                this.orgName +
                ' already exists, please add a different organization!';
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
