import {AfterViewInit, Component, ElementRef, Inject, OnInit} from '@angular/core';
import {DistanceMap, DistanceService} from './services/distance.service';


declare let google;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'app';
  options: any;

  overlays: any[];

  distanceMap: DistanceMap;

  heatmap: any;
  marker: any;

  travelTime = 20;
  travelType = 'Foot';

  latitude = 0;
  longitude = 0;

  usePolygons = false;

  constructor (private distanceService: DistanceService) {}

  ngOnInit() {

    this.options = {
      center: {lat: 52.2443, lng: 10.5594},
      zoom: 12
    };
  }

  ngAfterViewInit() {
    /*
    const s = this.document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDLcP6rwyhz54vJnmbZ6BZcJe_FIQOPxMg&libraries=visualization';
    this.elementRef.nativeElement.appendChild(s);
    */
    // old
    /*
      <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDLcP6rwyhz54vJnmbZ6BZcJe_FIQOPxMg&libraries=visualization"
          async defer></script>
     */
  }

  resetMap () {
    this.overlays = [];
  }

  dummyRequest (map) {
    this.latitude = 52.265474119942986;
    this.longitude = 10.51102904262541;

    if (this.marker) {
      this.marker.setMap(null);
    }

    const myLatLng = {lat: this.latitude, lng: this.longitude};
    this.marker = new google.maps.Marker({
      position: myLatLng,
      map: map,
      title: 'Center Point'
    });


    console.log('Querying long: ' + this.longitude + ' lat: ' + this.latitude)

    this.distanceService.getDummyDistances(this.longitude, this.latitude).subscribe(res => {
      this.distanceMap = res;

      if (this.usePolygons) {
        this.createHeatMapPolygons(map);
      } else {
        this.createHeatMapCircles(map);
      }
    }, error => {
      console.log(error);
    });
  }

  createHeatMapPolygons (map) {
    if (!this.distanceMap) {
      return;
    }

    if (this.heatmap) {
      this.heatmap.setMap(null);
    }

    /*
    let min = -1;
    let max = 0;
    this.distanceMap.pixlist.forEach( item => {
      if (item.t > max) {
        max = item.t;
      }
      if (min = -1) {
        min = item.t;
      } else if (item.t < min) {
        min = item.t;
      }
    });
    console.log(min + ' ' + max);
    */
/*
    const heatmapData = [];
    this.distanceMap.pixlist.forEach( item => {
      // const scaled = ( item.t - min ) / (max - min);
      // console.log(scaled);

      const scaled = item.t;

      heatmapData.push({location: new google.maps.LatLng(item.lat, item.lon), weight: 1});
    });


    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData
    });

    // this.heatmap.set('radius', 20);

    this.heatmap.setMap(map);
*/
    // try polygon
    /*
    this.overlays = [];
    this.distanceMap.pixlist.forEach( item => {
      // const scaled = (( item.t - min ) / (max - min)) * 1000;
      // console.log(scaled);

      const scaled = item.t;

      this.overlays.push(
        new google.maps.Circle({center: {lat: item.lat, lng: item.lon}, fillColor: '#1976D2', fillOpacity: 0.35, strokeWeight: 1, radius: scaled})
      );
    });
*/

    // this.latitude = 52.26492092361997;
    // this.longitude = 10.50678578796385;

    // group green: 0-999
    // group yellow: 1000-1800
    // group red: > 1800

    const greenPoints = [];
    const yellowPoints = [];
    const redPoints = [];
    this.distanceMap.pixlist.forEach( item => {
      if (item.t < this.travelTime * 60) {
        const dx = item.lat - this.latitude;
        const dy = item.lon - this.longitude;

        const angle = Math.atan2(dy, dx);
        if (item.t < 1000) {
          greenPoints.push({lat: item.lat, lng: item.lon, angle: angle});
        } else if (item.t > 1800) {
          redPoints.push({lat: item.lat, lng: item.lon, angle: angle});
        } else {
          yellowPoints.push({lat: item.lat, lng: item.lon, angle: angle});
        }
      }
    });

    const sortedGreenPoints = greenPoints.sort(function(a, b) {
      return a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0;
    });

    const sortedYellowPoints = yellowPoints.sort(function(a, b) {
      return a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0;
    });

    const sortedRedPoints = redPoints.sort(function(a, b) {
      return a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0;
    });

    const greenPolygon = {
      paths: sortedGreenPoints,
      strokeOpacity: 0.5,
      strokeWeight: 0,
      fillColor: '#35d220',
      fillOpacity: 0.6
    };
    const yellowPolygon = {
      paths: [sortedYellowPoints, sortedGreenPoints],
      strokeOpacity: 0.5,
      strokeWeight: 0,
      fillColor: '#d2d238',
      fillOpacity: 0.4
    };
    const redPolygon = {
      paths: [sortedRedPoints, sortedYellowPoints],
      strokeOpacity: 0.5,
      strokeWeight: 0,
      fillColor: '#d2211b',
      fillOpacity: 0.2
    };
    this.overlays = [];
    this.overlays.push(new google.maps.Polygon(redPolygon));
    this.overlays.push(new google.maps.Polygon(yellowPolygon));
    this.overlays.push(new google.maps.Polygon(greenPolygon));
  }

  createHeatMapCircles (map) {
    if (!this.distanceMap) {
      return;
    }

    if (this.heatmap) {
      this.heatmap.setMap(null);
    }

    // this.latitude = 52.26492092361997;
    // this.longitude = 10.50678578796385;

    // group green: 0-999
    // group yellow: 1000-1800
    // group red: > 1800

    const greenPoints = [];
    const yellowPoints = [];
    const redPoints = [];

    let maxGreenDistance = 0;
    let maxGreenLat = 0;
    let maxGreenLong = 0;

    let maxYellowDistance = 0;
    let maxYellowLat = 0;
    let maxYellowLong = 0;

    let maxRedDistance = 0;
    let maxRedLat = 0;
    let maxRedLong = 0;

    this.distanceMap.pixlist.forEach( item => {
      if (item.t < this.travelTime * 60) {
        const dx = item.lat - this.latitude;
        const dy = item.lon - this.longitude;

        const angle = Math.atan2(dy, dx);
        if (item.t < 1000) {
          greenPoints.push({lat: item.lat, lng: item.lon, angle: angle});

          if (item.t > maxGreenDistance) {
            maxGreenDistance = item.t;
            maxGreenLat = item.lat;
            maxGreenLong = item.lon;
          }
        } else if (item.t > 1800) {
          redPoints.push({lat: item.lat, lng: item.lon, angle: angle});

          if (item.t > maxRedDistance) {
            maxRedDistance = item.t;
            maxRedLat = item.lat;
            maxRedLong = item.lon;
          }
        } else {
          yellowPoints.push({lat: item.lat, lng: item.lon, angle: angle});

          if (item.t > maxYellowDistance) {
            maxYellowDistance = item.t;
            maxYellowLat = item.lat;
            maxYellowLong = item.lon;
          }
        }
      }
    });

    const sortedGreenPoints = greenPoints.sort(function(a, b) {
      return a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0;
    });

    const sortedYellowPoints = yellowPoints.sort(function(a, b) {
      return a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0;
    });

    const sortedRedPoints = redPoints.sort(function(a, b) {
      return a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0;
    });

    this.overlays = [];

    let greenDistance = 0;
    if (sortedGreenPoints.length > 0) {
      greenDistance = this.getDistance(this.latitude, this.longitude, maxGreenLat, maxGreenLong);

      const greenCircle = {
        center: {
          lat: this.latitude,
          lng: this.longitude
        },
        radius: greenDistance,
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#35d220',
        fillOpacity: 0.35
      };

      this.overlays.push(new google.maps.Circle(greenCircle));
    }

    let yellowDistance = 0;
    if (sortedYellowPoints.length > 0) {
      yellowDistance = this.getDistance(this.latitude, this.longitude, maxYellowLat, maxYellowLong);

      /*
      const yellowCircle = {
        center: {
          lat: this.latitude,
          lng: this.longitude
        },
        radius: yellowDistance,
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#d2d238',
        fillOpacity: 0.35
      };
      */
      const outerPoints = this.drawCircle(this.latitude, this.longitude, yellowDistance, 1);
      const innerPoints = this.drawCircle(this.latitude, this.longitude, greenDistance, -1);

      const yellowPolygon = {
        paths: [outerPoints, innerPoints],
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#d2d238',
        fillOpacity: 0.35
      };
      this.overlays.push(new google.maps.Polygon(yellowPolygon));

    }

    if (sortedRedPoints.length > 0) {
      const redDistance = this.getDistance(this.latitude, this.longitude, maxRedLat, maxRedLong);

      const outerPoints = this.drawCircle(this.latitude, this.longitude, redDistance, 1);
      const innerPoints = this.drawCircle(this.latitude, this.longitude, yellowDistance, -1);

      const redPolygon = {
        paths: [outerPoints, innerPoints],
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#d2211b',
        fillOpacity: 0.35
      };
      this.overlays.push(new google.maps.Polygon(redPolygon));
    }
  }

  handleMapClick(event, map) {

    console.log(event);

    this.latitude = event.latLng.lat();
    this.longitude = event.latLng.lng();

    if (this.marker) {
      this.marker.setMap(null);
    }

    const myLatLng = {lat: this.latitude, lng: this.longitude};
    this.marker = new google.maps.Marker({
      position: myLatLng,
      map: map,
      title: 'Center Point'
    });


    console.log('Querying long: ' + this.longitude + ' lat: ' + this.latitude)

    this.distanceService.getDistances(this.longitude, this.latitude).subscribe(res => {
      this.distanceMap = res;

      if (this.usePolygons) {
        this.createHeatMapPolygons(map);
      } else {
        this.createHeatMapCircles(map);
      }
    }, error => {
      console.log(error);
    });
  }

  private rad (x): number {
    return x * Math.PI / 180;
  }

  private getDistance (p1Lat, p1Long, p2Lat, p2Long) {
    const R = 6378137; // Earth’s mean radius in meter
    const dLat = this.rad(p2Lat - p1Lat);
    const dLong = this.rad(p2Long - p1Long);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1Lat)) * Math.cos(this.rad(p2Lat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d; // returns the distance in meter
  }

   drawCircle (latitude, longitude, radius, dir) {
    const d2r = Math.PI / 180;   // degrees to radians
    const r2d = 180 / Math.PI;   // radians to degrees
    const earthsradius = 6378137; // 3963 is the radius of the earth in miles

    const points = 32;

    // find the raidus in lat/lon
    const rlat = (radius / earthsradius) * r2d;
    const rlng = rlat / Math.cos(latitude * d2r);


    const extp = new Array();
    let start = 0;
    let end = 0;
    if (dir === 1) {
      start = 0;
      end = points + 1; // one extra here makes sure we connect the
    } else {
      start = points + 1;
      end = 0;
    }
    for (let i = start; (dir === 1 ? i < end : i > end); i = i + dir) {
      const theta = Math.PI * (i / (points / 2));
      const ey = longitude + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
      const ex = latitude + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
      extp.push(new google.maps.LatLng(ex, ey));
    }
    // alert(extp.length);
    return extp;
  }


}
