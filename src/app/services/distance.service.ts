import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

export class Point {
  lat: number;
  lon: number;
}

export class Offset {
  lat: number;
  lon: number;
  t: number;
}

export class DistanceMap {
  center: Point;
  pixlength: number;
  pixlist: Offset[];
}

@Injectable({
  providedIn: 'root'
})
export class DistanceService {
  readonly PRICE_ENDPOINT = 'http://localhost:8080/distance';

  constructor(private  http: HttpClient) { }

  getDistances (longitude: number, latitude: number): Observable<DistanceMap> {
    const data = {
      longitude: longitude,
      latitude: latitude
    };
    console.log('Sending Request');


    return this.http
      .get<DistanceMap>(this.PRICE_ENDPOINT + '/' + data.latitude + '/' + data.longitude);
  }

  getDummyDistances (longitude: number, latitude: number): Observable<DistanceMap> {
    return this.http
      .get<DistanceMap>('./assets/dummy_data.json');
  }
}
