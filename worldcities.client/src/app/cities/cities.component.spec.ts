import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from '../angular-material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { CitiesComponent } from './cities.component';
import { City } from './city';
import { CityService } from './city.service';
import { ApiResult } from '../base.service';

describe('CitiesComponent', () => {
  let fixture: ComponentFixture<CitiesComponent>; //fixture is a property that hosts a fixed state of CitiesComponent for running tests; it can be used to interact with the instantiated component and child elements
  let component: CitiesComponent; //contains the CitiesComponent instance that is created from the fixture
  beforeEach(async () => {
    //create a mock cityService object with a mock 'getData' method
    let cityService = jasmine.createSpyObj<CityService>('CityService', ['getData']);
    //configure the 'getData' spy method
    cityService.getData.and.returnValue(
      //return an Observable with some test data
      of<ApiResult<City>>(<ApiResult<City>>{
        data: [
          <City>{
            name: 'TestCity1',
            id: 1, lat: 1, lon: 1,
            countryId: 1, countryName: 'TestCountry1'
          },
          <City>{
            name: 'TestCity2',
            id: 2, lat: 1, lon: 1,
            countryId: 1, countryName: 'TestCountry1'
          },
          <City>{
            name: 'TestCity3',
            id: 3, lat: 1, lon: 1,
            countryId: 1, countryName: 'TestCountry1'
          }
        ],
        totalCount: 3,
        pageIndex: 0,
        pageSize: 10
      })
    );
    await TestBed.configureTestingModule({
      declarations: [CitiesComponent],
      imports: [
        BrowserAnimationsModule,
        AngularMaterialModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: CityService,
          useValue:cityService
        }
        
      ]
    })
      .compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(CitiesComponent);
    component = fixture.componentInstance;

    component.paginator = jasmine.createSpyObj("MatPaginator", ["length", "pageIndex", "pageSize"]);
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //title test
  it('should display a "Cities" title', () => {
    let title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toEqual('Cities');
  });
  //cities table test
  it('should contain a table with a list of one or more cities', () => {
    let table = fixture.nativeElement.querySelector('table.striped-table');
    let tableRows = table.querySelectorAll('tr.mat-mdc-row');
    expect(tableRows.length).toBeGreaterThan(0);
  })
})
