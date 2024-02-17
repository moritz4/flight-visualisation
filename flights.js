"use strict";

import axios from 'axios';

axios.get("https://data-cloud.flightradar24.com/zones/fcgi/feed.js?to=LHR")
.then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .finally(function () {
    // always executed
  });