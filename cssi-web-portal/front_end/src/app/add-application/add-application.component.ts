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
  HttpClientModule,
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { BadWordsFilterPipe } from '../badwords.pipe';
import Filter from 'bad-words';

@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrls: ['./add-application.component.css'],
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
export class AddApplicationComponent {
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}
  appName: string = '';
  appDescription: string = '';
  orgName: string | null = ''; //Set this from the link in order to navigate back home.
  userID: number = 0;
  nameBadWords: boolean = false;
  descriptBadWords: boolean = false;

  baseUrl: string = 'http://localhost:5000';

  ngOnInit(): void {
    this.orgName = this.route.snapshot.paramMap.get('orgId');
  }

  checkBadWords(checkWord: string, itemType: number) {
    var filter = new Filter();

    if (filter.isProfane(checkWord)) {
      if (itemType == 0) {
        this.nameBadWords = true;
        this.appName = filter.clean(checkWord);
      }
      if (itemType == 1) {
        this.descriptBadWords = true;
        this.appDescription = filter.clean(checkWord);
      }
    } else {
      if (itemType == 0) {
        this.nameBadWords = false;
        this.appName = checkWord;
      }
      if (itemType == 1) {
        this.descriptBadWords = false;
        this.appDescription = checkWord;
      }
    }
  }

  //use the `` to allow connections to the variable in the declaration.
  //This submit form method will check for the user's email entry to see if it's correct, currently it will display the user's email if login was successful.
  submitForm() {
    const httpOptions = {
      // withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        observe: 'response',
        responseType: 'json',
      }),
    };

    //Retrive user id from the link, and then Post message with orgData and userID to backend for adding to the table
    var message: string = `${this.appName} is added to your Organization!`;

    if (this.nameBadWords || this.descriptBadWords) {
      message = "Please don't use bad words in your inputs.";
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else {
      this.http
        .post(
          this.baseUrl + '/createOrgApp',
          {
            orgId: this.orgName,
            appName: this.appName,
            appDescript: this.appDescription,
          },
          httpOptions
        )
        .subscribe({
          next: (response) => {
            const responseString = JSON.stringify(response);
            let parsedRes = JSON.parse(responseString);
            if (parsedRes.orgCreated) {
              this.snackBar.open(message, 'Close', {
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            } else {
              message = 'Failed to add application, please try again later.';
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
