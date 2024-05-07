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
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BadWordsFilterPipe } from '../badwords.pipe';
import Filter from 'bad-words';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  standalone: true,
  imports: [
    ToolBarComponent,
    MatFormFieldModule,
    MatTooltipModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ToolBarComponent,
    MatSnackBarModule,
    TempNavBarComponent,
    MatSnackBarModule,
    NgIf,
    BadWordsFilterPipe,
  ],
})
export class SignUpComponent {
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private router: Router
  ) {}
  emailField = new FormControl('', [Validators.required, Validators.email]);
  hide: boolean = true;
  name: string = '';
  email: string = '';
  emailConfirm: string = '';
  password: string = '';
  passwordConfirm: string = '';
  toolTipText: string =
    "Password must have: \n 1 Uppercase Letter \n 1 Lowercase Letter \n 1 Number \n 1 Special Character(i.e. ?,!,/,', etc.) \n More than 8 Letters";
  passwordCode: number = 0; //Set as unknown for if debugging is needed, so we can cast the hash into a viewable string.
  sentPassword: string = '';
  hasBadWords: boolean = false;
  specialChars: string[] = [
    '~',
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '_',
    '-',
    '+',
    '=',
    '`',
    '|',
    '()',
    '{}',
    '[]',
    ':',
    ';',
    "'",
    '<>',
    ',',
    '.',
    '?',
    '/',
  ];

  //Using the badwords library this function checks if the user has inputed bad words, and will filter it out into * and sets the form to be unsubmitable
  checkBadWords(checkWord: string) {
    var filter = new Filter();
    filter.removeWords('Dick'); //Removing this word from the filter because it's a name a user can have.

    if (filter.isProfane(checkWord)) {
      this.hasBadWords = true;
      this.name = filter.clean(checkWord);
    } else {
      this.hasBadWords = false;
      this.name = checkWord;
    }
  }

  //When called, the string passed in will be scanned to see if there is a number, and then returns true or false.
  hasNumber(checkWord: string) {
    return /\d/.test(checkWord); //Checks through word for number and checks for metacharacter d = digit
  }

  //When called, the string passed in will be scanned to see if there is atleast 1 uppercase and 1 lowercase, and then returns true or false.
  hasProperCases(checkWord: string) {
    if (checkWord === checkWord.toLowerCase()) {
      var message: string = 'There is no uppercase';
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return false;
    } else if (checkWord === checkWord.toUpperCase()) {
      var message: string = 'There is no lowercase';
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return false;
    } else {
      return true;
    }
  }

  //Derived from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript for basic hashing on front end for secure sending to the backend.
  hashPassword() {
    var hash = 0;
    var i, chr;
    if (this.password.length === 0) return hash;
    for (i = 0; i < this.password.length; i++) {
      chr = this.password.charCodeAt(i);
      hash = hash * 31 + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  base_url: string = 'http://localhost:5000';

  // constructor(private http: HttpClient, private router : Router){}

  //use the `` to allow connections to the variable in the declaration.
  //This submit form method will check for the user's email entry to see if it's correct, currently it will display the user's email if login was successful.
  submitForm() {
    var message: string = `Confirmation email sent! Please check your email.`;
    if (this.hasBadWords) {
      message = "Please don't use bad words in your inputs.";
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else {
      if (
        this.emailField.hasError('required') ||
        this.emailField.hasError('email')
      ) {
        message = 'Email incorrect!';
        this.snackBar.open(message, 'Close', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      } else if (this.email != this.emailConfirm) {
        message = "Emails don't match!";
        this.snackBar.open(message, 'Close', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      } else if (
        this.password.length < 8 ||
        !this.specialChars.some((char) => this.password.includes(char)) ||
        !this.hasNumber(this.password) ||
        !this.hasProperCases(this.password)
      ) {
        message = "Your password doesn't meet the proper requirements!";
        this.snackBar.open(message, 'Close', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      } else if (this.password != this.passwordConfirm) {
        message = "Passwords don't match!";
        this.snackBar.open(message, 'Close', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      } else {
        this.passwordCode = this.hashPassword();
        this.sentPassword = this.passwordCode.toString();

        // PUT request to the createUser route, with body for getting the email, password and name. The .subscribe() method is used to handle the response from the server. It takes an object with two callback functions: next and error. response body is parsed from JSON to a JavaScript object, 
        // If resp.emailConfirmation is true, it displays a success message using the Angular Material snackBar component and navigates to the /login route, if result is false, it navigates to the /sign-up route. The error callback function is executed when the server responds with an error HTTP status code, then The error message is displayed using the snackBar component.  
        this.http
          .put(
            this.base_url + '/createUser',
            {
              email: this.emailField.getRawValue(),
              password: this.sentPassword,
              name: this.name,
            },
            { observe: 'response', responseType: 'json' }
          )
          .subscribe({
            next: (response) => {
              const res = JSON.stringify(response.body);

              let resp = JSON.parse(res);

              if (resp.emailConfirmation) {
                this.snackBar.open(message, 'Close', {
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                });
                this.router.navigate(['/login']);
              } else {
                this.router.navigate(['/sign-up']);
              }
            },
            error: (error: HttpErrorResponse) => {
              message = error.error.errorMessage;
              this.snackBar.open(message, 'Close', {
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });

              this.router.navigate(['/sign-up']);
            },
          });
      }
    }
  }

  // This method gets an error message based on what error that the user has produced, empty, or invalid email. The number is to signify if it needs to be confirmed.
  getErrorMessage(confirm: number) {
    if (this.emailField.hasError('required')) {
      return 'You must enter a value';
    }

    return this.emailField.hasError('email') ? 'Not a valid email' : '';
  }
}
