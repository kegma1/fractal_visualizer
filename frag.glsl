precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;

uniform vec2 u_startZ;
uniform vec2 u_startC;

uniform bool u_zFocus;

vec3 gradient(float t) {
    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 blue = vec3(0.0, 0.0, 1.0);
    
    return mix(blue, red, t*t);
}

void main() {
    int iterations = 0;
    if (u_zFocus) {
        vec2 c = (gl_FragCoord.xy - u_resolution / 2.0) / u_zoom + u_center;
    
        vec2 z = u_startZ;
        for(int i = 0; i < 1000; i++) {
            if (i == u_maxIterations) break;
            if (dot(z, z) > 4.0) break;
    
         
            float xTemp = pow(z.x, 2.0) - pow(z.y, 2.0)  + c.x;
            z.y = 2.0 * z.x * z.y + c.y;
            z.x = xTemp;
    
            iterations += 1;
        }
    } else {
        vec2 z = (gl_FragCoord.xy - u_resolution / 2.0) / u_zoom + u_center;
    
        vec2 c = u_startC;
        for(int i = 0; i < 1000; i++) {
            if (i == u_maxIterations) break;
            if (dot(z, z) > 4.0) break;
    
         
            float xTemp = pow(z.x, 2.0) - pow(z.y, 2.0)  + c.x;
            z.y = 2.0 * z.x * z.y + c.y;
            z.x = xTemp;
    
            iterations += 1;
        }
    }

    
    if (iterations >= u_maxIterations) {
        gl_FragColor = vec4(vec3(0.0),1.0);
    } else {
        float colorValue = float(iterations) / float(u_maxIterations);
        gl_FragColor = vec4(gradient(1.0 - colorValue), 1.0);
    }

}