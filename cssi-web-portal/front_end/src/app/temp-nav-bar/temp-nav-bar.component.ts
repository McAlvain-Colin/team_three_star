import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-temp-nav-bar',
  templateUrl: './temp-nav-bar.component.html',
  styleUrls: ['./temp-nav-bar.component.css'],
  standalone: true,
  imports: [RouterModule],
})
export class TempNavBarComponent {}
