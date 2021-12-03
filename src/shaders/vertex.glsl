uniform float uTime;
uniform float uBigWaveElevation;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 eyeVector;
varying vec3 vNormal;

float PI = 3.141592653589793238;


void main(){

    vUv = uv;
    vPosition = position;
    vNormal = normal;

    vec4 modelPosition = modelMatrix * vec4(vPosition, 1.0);

    //For Fresnel setup
    eyeVector = normalize(modelPosition.xyz - cameraPosition);

    //Elevation
    float elevation = sin(modelPosition.x * uBigWaveElevation + uTime) *
                       sin(modelPosition.z * uBigWaveElevation + uTime) * 
                       uBigWaveElevation;


    modelPosition.y += elevation;


    gl_Position = projectionMatrix * viewMatrix * modelPosition ;

}