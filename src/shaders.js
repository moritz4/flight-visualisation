export const vertexShader = `
// vertex shader must set gl_Position, a 4D float vector, which is the final position of the vertex on screen

// switch on high precision floats
#ifdef GL_ES
precision highp float;
#endif
	
attribute float opacity;
varying float opacity_vary;

void main()
{
    opacity_vary = opacity;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`

export const fragmentShader = `
// fragement shader must set or discard the gl_FragColor variable, another 4D float vector, which the final colour of our fragment

varying float opacity_vary;

void main() {
    gl_FragColor = vec4(1.0,  // R
                        0.0,  // G
                        1.0,  // B
                        opacity_vary); // A
  }
`