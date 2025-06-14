import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from './../../environments/environment';
import { City } from './city';
import { Country } from './../countries/country';
import { BaseFormComponent } from '../base-form.component';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrl: './city-edit.component.scss'
})
export class CityEditComponent extends BaseFormComponent implements OnInit {
  title?: string;
  //form!: FormGroup;
  city?: City;
  id?: number;
  //countries array for the select
  countries?: Country[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient) {
    super();
  }
    ngOnInit(){
      this.form = new FormGroup({
        name: new FormControl('', Validators.required),
        lat: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]{1,3}(\.[0-9]{1,4})?$/)]),
        lon: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]{1,3}(\.[0-9]{1,4})?$/)]),
        countryId: new FormControl('', Validators.required)
      },null, this.isDupeCity());
      this.loadData();
  }

  isDupeCity(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      var city = <City>{};
      city.id = (this.id) ? this.id : 0;
      city.name = this.form.controls['name'].value;
      city.lat = +this.form.controls['lat'].value;
      city.lon = +this.form.controls['lon'].value;
      city.countryId = +this.form.controls['countryId'].value;

      var url = environment.baseUrl + 'api/Cities/IsDupeCity';
      return this.http.post<boolean>(url, city).pipe(map(result => {
        return (result ? { isDupeCity: true } : null);
      }));
    }
  }

  loadData() {
    //load countries
    this.loadCountries();

    //retrieve the ID from the 'id' parameter
    var idParam = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : 0;
    if (this.id) {
      //fetch the city from the server
      var url = environment.baseUrl + 'api/Cities/' + this.id;
      this.http.get<City>(url).subscribe({
        next: (result) => {
          this.city = result;
          this.title = "Edit - " + this.city.name;

          //update the form with the city value
          this.form.patchValue(this.city);
        },
        error: (error) => console.error(error)
      });
    }
    else {
      this.title = "Create a new City";
    }
  }

  loadCountries() {
    //fetch all countries from server

    var url = environment.baseUrl + 'api/Countries';
    var params = new HttpParams().set("pageIndex", "0").set("pageSize", "9999").set("sortColumn", "name");
    this.http.get<any>(url, { params }).subscribe({
      next: (result) => {
        this.countries = result.data;
      },
      error: (error) => console.error(error)
    });
  }

  onSubmit() {
    var city = (this.id) ? this.city : <City>{};
    if (city) {
      city.name = this.form.controls['name'].value;
      city.lat = +this.form.controls['lat'].value;
      city.lon = +this.form.controls['lon'].value;
      city.countryId = +this.form.controls['countryId'].value;

      if (this.id) {
        var url = environment.baseUrl + 'api/Cities/' + city.id;
        this.http.put<City>(url, city).subscribe({
          next: (result) => {
            console.log("City " + city!.id + " has been updated.");

            //go back to cities view
            this.router.navigate(['/cities']);
          },
          error: (error) => console.error(error)
        });
      }
      else {
        var url = environment.baseUrl + 'api/Cities';
        this.http.post<City>(url, city).subscribe({
          next: (result) => {
            console.log("City " + result.id + " has been created.");
            this.router.navigate(['/cities']);
          },
          error: (error) => console.error(error)
        });
      }
      
    }
  }
  }
