uniform float uTime;
varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.141592653589793238;


void main(){

    vUv = uv;
    vPosition = position;

    vec2 displacement = vec2(1.0,1.0);
    vPosition.y = vPosition.y +  sin(uTime * 3.0);
    vPosition.x = vPosition.x +  cos(uTime * 3.0);
    
    //float theta = vPosition.x * 2.0 * PI;
    //vec2 dir = vec2(sin(theta),cos(theta));

    //displacement.xy = displacement.yx +  0.1*sin(dir   * uTime);

    vPosition = vPosition + vec3(displacement,1.0);

    

    //modelPosition = modelPosition * displacement;





    vec4 modelPosition = modelMatrix * vec4(vPosition, 1.0);

  

    gl_Position = projectionMatrix * viewMatrix * modelPosition ;

}