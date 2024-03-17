"use strict";

import * as THREE from 'three';
import * as maptilersdk from '@maptiler/sdk';
import {unix, format} from 'dayjs'
import {linear} from "everpolate";
import {flights} from "/src/main"
import { vertexShader, fragmentShader } from './shaders';

const TRAILLENGTH = 1200; // trail length in seconds
const LINESEGMENTS = 500;

// Create clock object to keep time
export const clock = {
    step: 100, // 1 = real time, 2 = x2, 3 = x3 etc.
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
        const points = curve.getSpacedPoints( LINESEGMENTS );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        // Add an attribute to each vertex which specifies the opacity of the line. Set this to all 0 for now
        const opacity = new Float32Array(Array(LINESEGMENTS).fill(0.2))
        geometry.setAttribute( 'opacity', new THREE.BufferAttribute( opacity, 1 ) );
        const shaderMaterial = new THREE.ShaderMaterial({vertexShader: vertexShader, fragmentShader: fragmentShader, transparent: true, blending: THREE.AdditiveBlending, depthTest: false});
        const curveObject = new THREE.Line( geometry, shaderMaterial );
        flights[key]["curveObject"] = curveObject;
        
        // Add point object (visual representation of the plane's current position)
        const dotGeometry = new THREE.BufferGeometry();
        dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([curve.getPoint(0).x, curve.getPoint(0).y, curve.getPoint(0).z]), 3));
        dotGeometry.dynamic = true;
        const dotMaterial = new THREE.PointsMaterial({ size: 3, color: 0xffffff });
        const dot = new THREE.Points(dotGeometry, dotMaterial);
        dot.frustumCulled = false;
        flights[key]["point"] = dot;

        //Add an indicator for whether the point and curve of the plane has been added to scene or not
        flights[key]["pointAdded"] = false;
        flights[key]["curveAdded"] = false;
    }

    // Update the clock again to set the current time to the start time
    clock.t = clock.start
}

// Function to get plane position at a time t
function getPosition(key, t, returnU) {
    // if plane is not in the air, it doesnt have a position yet
    if ((t < flights[key].start || t > (flights[key].stop))) {
        return(undefined);
    }

    // Else, use everpolate to get the u position along the curve.
    // x is time and y is u. To create u we need an evenly spaced vector from 0 to 1
    let linspace = Array.from({length: flights[key].time.length}, (v, i) => i/(flights[key].time.length - 1))
    const u = linear(t, flights[key].time, linspace)[0]

    if (returnU) {
        return(u);
    }

    return(flights[key].curve.getPointAt(u))
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
        animatePoint(scene, key);
    }
}

function animateLine(scene, key) {

    // Add line of the flightpath if it needs to be added
    if (flights[key].curveAdded == false && clock.t >= flights[key].start && clock.t <= (flights[key].stop + TRAILLENGTH)) {
        scene.add(flights[key].curveObject);
        flights[key].curveAdded = true;   
    }

    // Remove line
    if (flights[key].curveAdded == true && (clock.t < flights[key].start || clock.t > (flights[key].stop + TRAILLENGTH))) {
        scene.remove(flights[key].curveObject)
        flights[key].curveAdded = false;
    }
}

function animatePoint(scene, key) {

    // Add line of the flightpath if it needs to be added
    if (flights[key].pointAdded == false && clock.t >= flights[key].start && clock.t <= (flights[key].stop)) {
        scene.add(flights[key].point);
        flights[key].pointAdded = true;  
        return; 
    }

    // Remove point
    if (flights[key].pointAdded == true && (clock.t < flights[key].start || clock.t > (flights[key].stop))) {
        scene.remove(flights[key].point)
        flights[key].pointAdded = false;
        return;
    }

    // Move point
    if (clock.t >= flights[key].start && clock.t <= flights[key].stop) {
        const pos = getPosition(key, clock.t)
        flights[key].point.geometry.attributes.position.array[0] = pos.x;
        flights[key].point.geometry.attributes.position.array[1] = pos.y;
        flights[key].point.geometry.attributes.position.array[2] = pos.z;
        flights[key].point.geometry.attributes.position.needsUpdate = true;
    }
}

document.getElementById("button").addEventListener("click", () => {
    console.log(flights[Object.keys(flights)[1]])
});