"use strict";

import {getMap} from "/src/map"
import axios from 'axios';

// URI of json file
const PATH = "https://storage.googleapis.com/public-7758/flights.json"

export let flights

// Get JSON data
axios.get(PATH)
.then(response => {
  flights = response.data;
  const map = getMap();
  
  // Remove loading screens. Make sure the delay in ms is the same as the hidden class in styles.css
  document.getElementById("loading").classList.add("hidden");
  setTimeout(() => {document.getElementById("loading").remove();}, 1);
  document.getElementById("error-div").remove();

})

.catch(error => {
  // If error print the error
  document.getElementById("error-message").innerHTML = error;
  document.getElementById("error-div").classList.remove("invisible");
})
