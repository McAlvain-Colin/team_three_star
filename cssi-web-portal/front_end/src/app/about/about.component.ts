///* artifact and will be replaced*/
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    ToolBarComponent,
    TempNavBarComponent,
    MatGridListModule,
  ],
})
export class AboutComponent {
  team_images = [
    { url: '../../assets/Colin.jpg', alt: 'Colin McAlvain' },
    { url: '../../assets/David.jpg', alt: 'David Vargas' },
    { url: '../../assets/Huy.jpg', alt: 'Huy Tran' },
  ];
  professor_images = [
    { url: '../../assets/DavidFeilSeifer.jpg', alt: 'Dr. David Feil-Seifer' },
    { url: '../../assets/devrin-lee.jpg', alt: 'Devrin Lee' },
    { url: '../../assets/Sara-Davis.jpg', alt: 'Sara Davis' },
  ];
  advisor_images = [
    { url: '../../assets/Jehren-Boehm.jpg', alt: 'Jehren Boehm' },
    { url: '../../assets/zach.png', alt: 'Zach Estreito' },
    { url: '../../assets/kaden.png', alt: 'Kaden N.' },
  ];
}
