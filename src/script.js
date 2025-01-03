import * as THREE from "three";
import GUI from "lil-gui";

const mandelBrot = /*glsl*/ `
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
`;

const burningShip = /*glsl*/ `
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;

vec3 gradient(float t) {
    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 blue = vec3(0.0, 0.0, 1.0);
    
    return mix(blue, red, t*t);
}

void main() {
    vec2 c = (gl_FragCoord.xy - u_resolution / 2.0) / u_zoom + u_center;

    vec2 z = vec2(0.0);
    int iterations = 0;
    for(int i = 0; i < 1000; i++) {
        if (i == u_maxIterations) break;
        if (dot(z, z) > 4.0) break;

        float xTemp = pow(z.x, 2.0) - pow(z.y, 2.0)  + c.x;
        z.y = -abs(2.0 * z.x * z.y) + c.y;
        z.x = xTemp;


        // float xTemp = pow(z.x, 2.0) - pow(z.y, 2.0)  + c.x;
        // z.y = 2.0 * z.x * z.y + c.y;
        // z.x = xTemp;

        iterations += 1;
    }

    
    if (iterations >= u_maxIterations) {
        gl_FragColor = vec4(vec3(0.0),1.0);
    } else {
        float colorValue = float(iterations) / float(u_maxIterations);
        gl_FragColor = vec4(gradient(1.0 - colorValue), 1.0);
    }

}
`;

const mandelBrotMat = new THREE.ShaderMaterial( {
    uniforms: {
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_center: { value: new THREE.Vector2(0.0, 0.0) },
        u_zoom: { value: 300},
        u_maxIterations: { value: 100 },
        u_startZ: {value: new THREE.Vector2(0.0, 0.0)},
        u_startC: {value: new THREE.Vector2(0.0, 0.0)},
        u_zFocus: {value: true},
    },
    fragmentShader: mandelBrot,
})

const burningShipMat = new THREE.ShaderMaterial( {
    uniforms: {
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_center: { value: new THREE.Vector2(0.0, 0.0) },
        u_zoom: { value: 300},
        u_maxIterations: { value: 100 },
    },
    fragmentShader: burningShip,
})


const ri = {
    isPanning: false,
    mousePrevious: new THREE.Vector2(0, 0),
};

const minZoom = 300;
const maxZoom = 300000000;
const zoomFactor = 1.1;

export function main() {
    window.addEventListener("resize", onWindowResize, false);

    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    ri.renderer = new THREE.WebGLRenderer({canvas: canvas});
    ri.renderer.setSize(window.innerWidth, window.innerHeight);

    canvas.addEventListener("wheel", (event) => {


        if (Math.sign(event.wheelDelta) < 0) {
            ri.material.uniforms.u_zoom.value /= zoomFactor;
        } else {
            ri.material.uniforms.u_zoom.value *= zoomFactor;
        }
        ri.material.uniforms.u_zoom.value = Math.max(minZoom, Math.min(maxZoom, ri.material.uniforms.u_zoom.value))

        event.preventDefault();
    });

    canvas.addEventListener("mousedown", (e) => {
        ri.isPanning = true
        ri.mousePrevious.set(e.offsetX, e.offsetY);
    });
    canvas.addEventListener("mousemove", (e) => {
        if (ri.isPanning) {
            let mouse = new THREE.Vector2(e.offsetX, e.offsetY);
            let delta =  new THREE.Vector2();
            
            delta.x = ri.mousePrevious.x - mouse.x
            delta.y = mouse.y - ri.mousePrevious.y

            const basePanSpeed = delta.length();

            delta.normalize()


            const normalizedZoom = (ri.material.uniforms.u_zoom.value - minZoom) / (maxZoom - minZoom); 
            
            const panSpeed = basePanSpeed * (1 - (normalizedZoom));
            delta.multiplyScalar(panSpeed / ri.material.uniforms.u_zoom.value);

            ri.material.uniforms.u_center.value.add(delta);
            ri.mousePrevious.set(mouse.x, mouse.y);
        }
    });
    canvas.addEventListener("mouseup", () =>  ri.isPanning = false);


    ri.material = mandelBrotMat;

    const gPlane = new THREE.PlaneGeometry(200, 200);
    ri.plane = new THREE.Mesh(gPlane, ri.material);

    ri.scene = new THREE.Scene();
    ri.scene.background = new THREE.Color( 0xdddddd );
    ri.scene.add(ri.plane);

    ri.gui = new GUI();
    ri.gui.add(ri.material.uniforms.u_zFocus, "value").name("Z/C");

    const zFolder = ri.gui.addFolder("Z")
    const zControlX = zFolder.add(ri.material.uniforms.u_startZ.value, "x").min(-1).max(1).step(0.01).name("X");
    const zControlY = zFolder.add(ri.material.uniforms.u_startZ.value, "y").min(-1).max(1).step(0.01).name("Y");
    zFolder.add({func: () => {
        ri.material.uniforms.u_startZ.value.set(0.0, 0.0)
        zControlY.updateDisplay();
        zControlX.updateDisplay();
    }}, "func").name("Reset");
    
    const cFolder = ri.gui.addFolder("C")
    const cControlX = cFolder.add(ri.material.uniforms.u_startC.value, "x").min(-1).max(1).step(0.01).name("X");
    const cControlY = cFolder.add(ri.material.uniforms.u_startC.value, "y").min(-1).max(1).step(0.01).name("Y");
    cFolder.add({func: () => {
        ri.material.uniforms.u_startC.value.set(0.0, 0.0)
        cControlY.updateDisplay();
        cControlX.updateDisplay();
    }}, "func").name("Reset");

    ri.camera = new THREE.Camera();
   
    ri.renderer.render(ri.scene, ri.camera);


    animate(0)
}

export function setFractal(e) {
    if (e.target.value == "mandelbrot") {
        ri.material = mandelBrotMat
        ri.plane.material = mandelBrotMat
    } else if (e.target.value == "burningship") {
        ri.material = burningShipMat
        ri.plane.material = burningShipMat
    }
}

function animate(currentTime) {
    window.requestAnimationFrame((currentTime) => {
        animate(currentTime);
    });
    renderScene();
}

function renderScene() {
    ri.renderer.render(ri.scene, ri.camera);
}

function onWindowResize() {
	ri.renderer.setSize(window.innerWidth, window.innerHeight);
	ri.material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight)
	renderScene();
}