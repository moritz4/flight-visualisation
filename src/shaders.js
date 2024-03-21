export const vertexShader = `
// vertex shader must set gl_Position, a 4D float vector, which is the final position of the vertex on screen

// switch on high precision floats
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif
	
//attribute float opacity;
varying float pointTimes;
varying float pointTimes_vary;

void main()
{
    pointTimes_vary = pointTimes;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`

export const fragmentShader = `
// fragement shader must set or discard the gl_FragColor variable, another 4D float vector, which the final colour of our fragment

#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

varying float pointTimes_vary;
uniform float time;

void main() {
    if (time > pointTimes_vary)
    {
        gl_FragColor = vec4(1.0,  // R
                        0.0,  // G
                        0.0,  // B
                        1.0); // A
    }    
  }
`