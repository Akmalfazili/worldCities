import { Component, OnInit , OnDestroy} from '@angular/core';
//import { HttpClient,HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

//import { environment } from './../../environments/environment';
import { City } from './city';
import { Country } from './../countries/country';
import { BaseFormComponent } from '../base-form.component';
import { CityService } from './city.service';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrl: './city-edit.component.scss'
})


export class CityEditComponent extends BaseFormComponent implements OnInit, OnDestroy {
  title?: string;
  //form!: FormGroup;
  city?: City;
  id?: number;
  //countries array for the select
  countries?: Country[];

  //Activity log for debugging purposes
  activityLog: string = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    //private http: HttpClient,
    private cityService: CityService) {
    super();
  }
    ngOnInit(){
      this.form = new FormGroup({
        name: new FormControl('', Validators.required),
        lat: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]{1,3}(\.[0-9]{1,4})?$/)]),
        lon: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]{1,3}(\.[0-9]{1,4})?$/)]),
        countryId: new FormControl('', Validators.required)
      }, null, this.isDupeCity());
      //react to from changes
      this.subscriptions.add(this.form.valueChanges.subscribe(() => {
        if (!this.form.dirty) {
          this.log("Form Model has been loaded.");
        }
        else {
          this.log("Form was updated by the user.");
        }
      }));
      // react to changes in the form.name control
      this.subscriptions.add(this.form.get("name")!.valueChanges.subscribe(() => {
        if (!this.form.dirty) {
          this.log("Name has been loaded with initial values");
        }
        else {
          this.log("Name was updated by the user")
        }
      }));
      this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  log(str: string) {
    this.activityLog += "[" + new Date().toLocaleString() + "] " + str + "<br>" ;
  }

  isDupeCity(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      var city = <City>{};
      city.id = (this.id) ? this.id : 0;
      city.name = this.form.controls['name'].value;
      city.lat = +this.form.controls['lat'].value;
      city.lon = +this.form.controls['lon'].value;
      city.countryId = +this.form.controls['countryId'].value;


      return this.cityService.isDupeCity(city).pipe(map(result => {
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
      this.cityService.get(this.id).subscribe({
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

    this.cityService.getCountries(0,9999,"name","asc",null,null).subscribe({
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
        this.cityService.put(city).subscribe({
          next: (result) => {
            console.log("City " + city!.id + " has been updated.");

            //go back to cities view
            this.router.navigate(['/cities']);
          },
          error: (error) => console.error(error)
        });
      }
      else {
        this.cityService.post(city).subscribe({
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
