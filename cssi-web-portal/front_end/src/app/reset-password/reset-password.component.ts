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

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [
    ToolBarComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TempNavBarComponent,
    NgIf,
  ],
})
export class ResetPasswordComponent {
  password: string = '';
  repeatPassword: string = '';
  hide1st: boolean = true;
  hide2nd: boolean = true;

  //use the `` to allow connections to the variable in the declaration.
  submitForm() {
    var message: string = `Password submitted`;
    if (this.password === this.repeatPassword) {
      alert(message);
    } else {
      message = "Password doesn't match";
      alert(message);
    }
  }
}
