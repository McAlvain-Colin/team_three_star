//created by angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempNavBarComponent } from './temp-nav-bar.component';

// Spec.ts is a testing component that is automatically generated for an angular component, and the team has not modified these files.

describe('TempNavBarComponent', () => {
  let component: TempNavBarComponent;
  let fixture: ComponentFixture<TempNavBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TempNavBarComponent],
    });
    fixture = TestBed.createComponent(TempNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
