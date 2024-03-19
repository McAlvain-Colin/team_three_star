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
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
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
    MatSnackBarModule,
    TempNavBarComponent,
    NgIf,
  ],
})
export class ResetPasswordComponent {
  constructor(private snackBar: MatSnackBar) {}
  password: string = '';
  repeatPassword: string = '';
  hide1st: boolean = true;
  hide2nd: boolean = true;
  toolTipText: string =
    "Password must have: \n 1 Uppercase Letter \n 1 Lowercase Letter \n 1 Number \n 1 Special Character(i.e. ?,!,/,', etc.) \n More than 8 Letters";
  passwordCode: unknown = 0; //Set as unknown for if debugging is needed, so we can cast the hash into a viewable string.
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

  hasNumber(checkWord: string) {
    return /\d/.test(checkWord); //Checks through word for number and checks for metacharacter d = digit
  }

  hasProperCases(checkWord: string) {
    if (checkWord === checkWord.toLowerCase()) {
      alert('There is no uppercase');
      return false;
    } else if (checkWord === checkWord.toUpperCase()) {
      alert('There is no lowercase');
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

  //use the `` to allow connections to the variable in the declaration.
  //This method was developed by Huy to check if both submitted password fields match with one another, and alerts the user with the respective message
  submitForm() {
    var message: string = `Password submitted`;
    //password has the special char, then pass
    if (
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
    } else if (this.password === this.repeatPassword) {
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      this.passwordCode = this.hashPassword();
      //Send off the hashcode to the backend
    } else {
      message = "Password doesn't match";
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }
}
