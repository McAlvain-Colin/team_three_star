import { Component, Input, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DatePicker } from '../date-picker/date-picker.component'

import { FormControl} from '@angular/forms';
import { AboutComponent } from '../about/about.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-organization-page',
  templateUrl: './organization-page.component.html',
  styleUrls: ['./organization-page.component.css'],
  providers: [],
  standalone: true,
  imports: [AboutComponent,
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
            ]
})
export class OrganizationPageComponent {

}
