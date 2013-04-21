precision mediump float;

// Built-ins
uniform mat4 projectionMatrix; // The projection matrix.
uniform mat4 modelViewMatrix;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}