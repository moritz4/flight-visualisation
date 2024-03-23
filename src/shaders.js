export const vertexShader = `
// vertex shader must set gl_Position, a 4D float vector, which is the final position of the vertex on screen

// switch on high precision floats
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

attribute float opacity;
varying float opacity2;

void main()
{
    opacity2 = opacity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`

export const fragmentShader = `
// fragment shader must set or discard the gl_FragColor variable, another 4D float vector, which the final colour of our fragment

#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

varying float opacity2;

void main() {
        gl_FragColor = vec4(1.0,  // R
        0.0,  // G
        0.5,  // B
        opacity2); // A
}
`