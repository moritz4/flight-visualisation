"use strict";

import {getFlightData} from "/src/data" 
import {animate} from "/src/graphics"

const flights = getFlightData();
animate();

// Once flights resolves, remove loading screen
flights.then((v) => {
    document.getElementById("loading").classList.add("hidden");
  });

// Remove loading screen
