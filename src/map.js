"use strict";

import * as maptilersdk from '@maptiler/sdk';
import * as THREE from 'three';
import {flights} from "/src/main";

// Yes, this key is public :(
maptilersdk.config.apiKey = 'ogwS8Hd1hP8slKpFpC1H';

export function getMap(){
    const map = new maptilersdk.Map({
        container: 'map',
        style: maptilersdk.MapStyle.STREETS,
        zoom: 9,
        center: [-0.1829, 51.5057],
        pitch: 60,
        antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });

    map.on('style.load', () => {
        map.addLayer(customLayer);
    });

    return(map)
}

function addLines(scene) {
    
    for (var key of Object.keys(flights)) {
        const points = [];

        for (let i = 0; i < flights[key].time.length; i++) {
            const model = maptilersdk.MercatorCoordinate.fromLngLat([flights[key].lon[i], flights[key].lat[i]], flights[key].alt[i] * 0.3048);
            points.push( new THREE.Vector3( model.x, model.y, model.z ) );

            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            const material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 1 } );
            const line = new THREE.Line( geometry, material );

            scene.add(line);
        }
    }
}

// configuration of the custom layer for a 3D model per the CustomLayerInterface
const customLayer = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true,
            });
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera();
            this.map = map;

            // Add lines
            addLines(this.scene)
            

            this.renderer.autoClear = false;
        },
        render: function (gl, matrix) {
            this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
};

