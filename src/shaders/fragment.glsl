uniform float uTime;
uniform float uFresnelMultiplier;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 eyeVector;
varying vec3 vNormal;

float PI = 3.141592653589793238;

//Fresnel calculation
float Fresnel(vec3 eyeVector,vec3 worldNormal){
    return pow(1.3 + dot(eyeVector,worldNormal),uFresnelMultiplier *2.0);
}


void main(){
    
     //fresnel
    float fres = Fresnel(eyeVector,vNormal);

 

    gl_FragColor = vec4(0.5,0.0,fres, 1.0);
}