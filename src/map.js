"use strict";

import * as maptilersdk from '@maptiler/sdk';
import * as THREE from 'three';
import {clock, initScene} from "/src/animation";
import { animateScene } from './animation';

// Yes, this key is public :(
maptilersdk.config.apiKey = 'ogwS8Hd1hP8slKpFpC1H';

// Function to create a new map instance
export function getMap(){
    const map = new maptilersdk.Map({
        container: 'map',
        style: "8edebff4-c9fc-4f7a-a53b-766aee392c21", //variant of OUTDOOR DARK
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

const timer = new THREE.Clock();

// configuration of the custom layer for a 3D model per the CustomLayerInterface
const customLayer = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
            // Create THREE renderer, camera and scene
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true,
            });
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera();
            this.map = map;

            // Initialise scene
            initScene(this.scene)
            
            this.renderer.autoClear = false;
        },
        render: function (gl, matrix) {
            const delta = timer.getDelta();
            clock.advanceClock(delta);
            animateScene(this.scene)
            this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
};