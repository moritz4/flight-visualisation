"use strict";

import axios from 'axios';

const PATH = "https://storage.googleapis.com/public-7758/flights.json"

export async function getData() {
    try {
        const response = await axios.get(PATH);
        console.log(response);
    } catch(e) {
        console.log(e);
    }
}

