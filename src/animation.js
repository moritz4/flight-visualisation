"use strict";

import * as THREE from 'three';
import * as maptilersdk from '@maptiler/sdk';
import {unix, format} from 'dayjs'
import {linear} from "everpolate";
import {flights} from "/src/main"

// Create clock object to keep time
export const clock = {
    step: 1000, // 1 = real time, 2 = x2, 3 = x3 etc.
    t: 0, 
    start: Infinity, 
    stop:0, 
    advanceClock: function(delta){this.t = this.t + this.step * delta}}

// Function which returns mecator coordinates given lat lon and alt
function fromLatLonAlt(lat, lon, alt) {
    return(maptilersdk.MercatorCoordinate.fromLngLat([lon, lat], alt))
}

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
            const model = fromLatLonAlt(flights[key].lat[i], flights[key].lon[i], flights[key].alt[i]);
            flight_points.push( new THREE.Vector3( model.x, model.y, model.z ) );
        }
        const curve = new THREE.CatmullRomCurve3(flight_points);
        flights[key]["curve"] = curve;
        
        // Add curve object (visual representation of the curve)
        const points = curve.getPoints( 300 );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.2 } );
        const curveObject = new THREE.Line( geometry, material );
        flights[key]["curveObject"] = curveObject

        //Add an indiator for whether the point of the plane has been added or not
        flights[key]["pointAdded"] = false;
        flights[key]["curveAdded"] = false;
    }

    // Update the clock again to set the current time to the start time
    clock.t = clock.start
}

// Function which is run once at the start
export function initScene(scene) {
    return;
}

export function animateScene(scene) {    
    // Set the clock display on screen
    document.getElementById("time").innerHTML = unix(clock.t).format('DD/MM/YYYY HH:mm')

    
    // Loop through all flights
    for (var key of Object.keys(flights)) {
        animateLine(scene, key);
    }
}

function animateLine(scene, key) {

    // Add line of the flightpath if it needs to be added
    if (flights[key].curveAdded == false && clock.t >= flights[key].start && clock.t <= flights[key].stop) {
        scene.add(flights[key].curveObject);
        flights[key].curveAdded = true;   
    }

    // Remove line
    if (flights[key].curveAdded == true && (clock.t < flights[key].start || clock.t > flights[key].stop)) {
        scene.remove(flights[key].curveObject)
        flights[key].curveAdded = false;
    }
}

document.getElementById("button").addEventListener("click", () => {
    console.log("running debug")
});