"use strict";

import axios from 'axios';

// URI of json file
const PATH = "https://storage.googleapis.com/public-7758/flights.json"


// Function to get json file from internet
export function getFlightData() {
    const response = axios.get(PATH);
    return(response)
}

