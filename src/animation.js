"use strict";

import * as THREE from 'three';
import * as maptilersdk from '@maptiler/sdk';
import {linear} from "everpolate";
import {flights} from "/src/main"

// Create clock object to keep time
export const clock = {
    step: 1, 
    t: 0, 
    start: Infinity, 
    stop:0, 
    advanceClock: function(){this.t = this.t + this.step}}

// Function to add position and other extras to the flights object
export function initFlights(flights) {
    // Loop over all flights
    for(var key of Object.keys(flights)) {
        // Remove any short flights (less than 3 datapoints)
        if (flights[key].time.length < 3) {
            delete flights[key]
            continue;
        }

        // Add start and stop times of the flight
        flights[key]["start"] = flights[key]["time"][0];
        flights[key]["stop"] = flights[key]["time"].slice(-1)[0];

        // Update the clock
        if(flights[key]["start"] < clock.start) {clock.start = flights[key]["start"]}
        if(flights[key]["stop"] > clock.stop) {clock.stop = flights[key]["stop"]}
        
        // Add curve
        const flight_points = [];
        for (let i = 0; i < flights[key].time.length; i++) {
            const model = maptilersdk.MercatorCoordinate.fromLngLat([flights[key].lon[i], flights[key].lat[i]], flights[key].alt[i]);
            flight_points.push( new THREE.Vector3( model.x, model.y, model.z ) );
        }
        const curve = new THREE.CatmullRomCurve3(flight_points);
        flights[key]["curve"] = curve;
        
        // Add curve object (visual representation of the curve)
        const points = curve.getPoints( 200 );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        const curveObject = new THREE.Line( geometry, material );
        flights[key]["curveObject"] = curveObject

        // Add a function to get the current position of the flight, given a time t
        flights[key]["getPosition"] = function(t) {
            // If t is out of bounds return undefined
            if (t < this.start || t > this.stop) { return(undefined) }
            
            // Create an evenly spaced vector
            function linStep(cardinality) {
                var arr = [];
                var step = (1 - 0) / (cardinality - 1);
                for (var i = 0; i < cardinality; i++) {
                  arr.push(0 + (step * i));
                }
                return arr;
              }

            // Use linear interpolation to get the u value from the time
            const u = linear(t, this.time, linStep(this.time.length))[0];
            const point = this.curve.getPointAt(u);
            return(point);
        }
    }
}

// Function 
export function initScene(scene) {
    for (var key of Object.keys(flights).slice(0,200)) {
        scene.add(flights[key].curveObject);
    }
}

export function animateScene() {
    return;
}
