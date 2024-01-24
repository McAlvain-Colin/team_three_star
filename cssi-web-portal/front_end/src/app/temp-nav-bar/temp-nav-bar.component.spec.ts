//created by angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempNavBarComponent } from './temp-nav-bar.component';

describe('TempNavBarComponent', () => {
  let component: TempNavBarComponent;
  let fixture: ComponentFixture<TempNavBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TempNavBarComponent]
    });
    fixture = TestBed.createComponent(TempNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
