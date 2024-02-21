import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPageComponent } from './filter-page.component';

describe('FilterPageComponent', () => {
  let component: FilterPageComponent;
  let fixture: ComponentFixture<FilterPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterPageComponent]
    });
    fixture = TestBed.createComponent(FilterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
