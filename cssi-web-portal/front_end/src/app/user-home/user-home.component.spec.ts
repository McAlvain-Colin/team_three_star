import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { UserHomeComponent } from './user-home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { inject } from '@angular/core';

describe('UserHomeComp', () => {
  let route: ActivatedRoute;
  const paramsSubject = new BehaviorSubject({
    id1: 'hi',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject,
          },
        },
      ],
    });
    TestBed.runInInjectionContext(() => {
      route = inject(ActivatedRoute);
    });
  });

  it('route should be hi', (done) => {
    route.params.subscribe((params) => {
      expect(params['id1']).toBe('hi');
      done();
    });
  });

  it('notifications should be empty', () => {
    TestBed.runInInjectionContext(() => {
      route = inject(ActivatedRoute);
    });
    const comp = new UserHomeComponent(route);
    let array: string[] = [];
    expect(comp.notifications)
      .withContext('notifications is empty at first')
      .toBe(array);
    comp.setupExampleLists();
    array = [
      'Notification 1',
      'Notification 2',
      'Notification 3',
      'Notification 4',
      'Notification 5',
      'Notification 6',
      'Notification 7',
      'Notification 8',
      'Notification 9',
      'Notification 10',
      'Notification 11',
      'Notification 12',
      'Notification 13',
      'Notification 14',
    ];
    expect(comp.notifications)
      .withContext('notifications should be filled with 14 notifications')
      .toBe(array);
  });
});
