import { Component, OnInit, ViewChild } from '@angular/core';
//import { HttpClient, HttpParams } from '@angular/common/http';
//import { environment } from './../../environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../auth/auth.service';

import { City } from './city';
import { CityService } from './city.service';
import { ApiResult } from '../base.service';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss']
})
export class CitiesComponent implements OnInit{
  public displayedColumns: string[] = ['id', 'name', 'lat', 'lon', 'countryName'];
  public cities!: MatTableDataSource<City>;

  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  public defaultSortColumn: string = "name";
  public defaultSortOrder: "asc" | "desc" = "asc";

  defaultFilterColumn: string = "name";
  filterQuery?: string;

  isLoggedIn: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private cityService: CityService, private authService: AuthService) {
  }
  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.loadData();
  }
  loadData(query?:string) {
    var pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    this.filterQuery = query;
    this.getData(pageEvent);
  }

  getData(event: PageEvent) {
    //var url = environment.baseUrl + 'api/Cities';
    //var params = new HttpParams().set("pageIndex", event.pageIndex.toString())
    //  .set("pageSize", event.pageSize.toString())
    //  .set("sortColumn", (this.sort) ? this.sort.active : this.defaultSortColumn)
    //  .set("sortOrder", (this.sort) ? this.sort.direction : this.defaultSortOrder);
    //if (this.filterQuery) {
    //  params = params.set("filterColumn", this.defaultFilterColumn).set("filterQuery", this.filterQuery);
    //}
    //this.http.get<any>(url, { params }).subscribe({
    //  next: (result) => {
    //    this.paginator.length = result.totalCount;
    //    this.paginator.pageIndex = result.pageIndex;
    //    this.paginator.pageSize = result.pageSize;
    //    this.cities = new MatTableDataSource<City>(result.data);
    //  },
    //  error: (error) => console.error(error)
    //});

    var sortColumn = (this.sort) ? this.sort.active : this.defaultSortColumn;
    var sortOrder = (this.sort) ? this.sort.direction : this.defaultSortOrder;
    var filterColumn = (this.filterQuery) ? this.defaultFilterColumn : null;
    var filterQuery = (this.filterQuery) ? this.filterQuery : null;

    this.cityService.getData(event.pageIndex, event.pageSize, sortColumn, sortOrder, filterColumn, filterQuery).subscribe({
      next: (result) => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.cities = new MatTableDataSource<City>(result.data);
      },
      error: (error) => console.error(error)
    });
  }
}
