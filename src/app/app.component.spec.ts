/* import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { PlaceBetComponent } from './place-bet/place-bet.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-place-bet',
  template: '',
})
export class PlaceBetComponentStub { }

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        { provide: PlaceBetComponent, useClass: PlaceBetComponentStub }
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
*/