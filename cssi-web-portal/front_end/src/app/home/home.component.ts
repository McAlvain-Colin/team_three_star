import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';

//Basic generation of the typescript by angular, and the imports were made by Huy to properly import the correct materials for the page.

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [MatButtonModule, ToolBarComponent, TempNavBarComponent],
})
export class HomeComponent {}