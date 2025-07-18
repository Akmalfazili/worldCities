import { Component, OnInit, ViewChild } from '@angular/core';
//import { HttpClient, HttpParams } from '@angular/common/http';
//import { environment } from './../../environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../auth/auth.service';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Country } from './country';
import { CountryService } from './country.service';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss'
})
export class CountriesComponent implements OnInit{
  public displayedColumns: string[] = ['id', 'name', 'iso2', 'iso3','totCities'];
  public countries!: MatTableDataSource<Country>

  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  public defaultSortColumn: string = "name";
  public defaultSortOrder: "asc" | "desc" = "asc";

  defaultFilterColumn: string = "name";
  filterQuery?: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterTextChanged: Subject<string> = new Subject<string>();

  isLoggedIn: boolean = false;
  constructor(private countryService: CountryService, private authService: AuthService) {
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.loadData();
  }

  //debounce filter text changes
  onFilterTextChanged(filterText: string) {
    if (!this.filterTextChanged.observed) {
      this.filterTextChanged.pipe(debounceTime(1000), distinctUntilChanged())
        .subscribe(query => {
          this.loadData(query);
        });
    }
    this.filterTextChanged.next(filterText);
  }

  loadData(query?: string) {
    var pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    this.filterQuery = query;
    this.getData(pageEvent);
  }

  getData(event: PageEvent) {
    //var url = environment.baseUrl + 'api/Countries';
    //var params = new HttpParams().set("pageIndex", event.pageIndex.toString())
    //  .set("pageSize", event.pageSize.toString())
    //  .set("sortColumn", (this.sort) ? this.sort.active : this.defaultSortColumn)
    //  .set("sortOrder", (this.sort) ? this.sort.direction : this.defaultSortOrder);
    //if (this.filterQuery) {
    //  params = params
    //    .set("filterColumn", this.defaultFilterColumn)
    //    .set("filterQuery", this.filterQuery);
    //}
    var sortColumn = (this.sort) ? this.sort.active : this.defaultSortColumn;
    var sortOrder = (this.sort) ? this.sort.direction : this.defaultSortOrder;
    var filterColumn = (this.filterQuery) ? this.defaultFilterColumn : null;
    var filterQuery = (this.filterQuery) ? this.filterQuery : null;

    this.countryService.getData(event.pageIndex, event.pageSize, sortColumn, sortOrder, filterColumn, filterQuery)
      .subscribe({
      next: (result) => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.countries = new MatTableDataSource<Country>(result.data);
      },
      error: (error) => console.error(error)
    });
  }
}
