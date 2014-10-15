"use strict";

var camera, scene;
var renderCanvas, renderer, vrrenderer;
var vrHMD, vrHMDSensor;

// set the scene size
    var WIDTH = 1280,
      HEIGHT = 800;

window.addEventListener("load", function() {
    if (navigator.getVRDevices) {
        navigator.getVRDevices().then(vrDeviceCallback);
    } else if (navigator.mozGetVRDevices) {
        navigator.mozGetVRDevices(vrDeviceCallback);
    }
}, false);

window.addEventListener("keypress", function(e) {
    if (e.charCode == 'f'.charCodeAt(0)) {
        if (renderCanvas.mozRequestFullScreen) {
            renderCanvas.mozRequestFullScreen({
                vrDisplay: vrHMD
            });
        } else if (renderCanvas.webkitRequestFullscreen) {
            renderCanvas.webkitRequestFullscreen({
                vrDisplay: vrHMD,
            });
        }
    }
}, false);

function vrDeviceCallback(vrdevs) {
    for (var i = 0; i < vrdevs.length; ++i) {
        if (vrdevs[i] instanceof HMDVRDevice) {
            vrHMD = vrdevs[i];
            break;
        }
    }
    for (var i = 0; i < vrdevs.length; ++i) {
        if (vrdevs[i] instanceof PositionSensorVRDevice &&
            vrdevs[i].hardwareUnitId == vrHMD.hardwareUnitId) {
            vrHMDSensor = vrdevs[i];
            break;
        }
    }
    initScene();
    initRenderer();
    render();
}

function initScene() {
    // set some camera attributes
    var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 100;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.z = 0;
    scene = new THREE.Scene();
    
    createWall(0,0,-5, scene, 0); // front
    createWall(5,0,0, scene, Math.PI/2); // right
    createWall(-5,0,0, scene, Math.PI/2); // left
    createWall(0,0,5, scene, 0); // back
    createWall(0,-5,0, scene, 0, Math.PI/2); // floor
    createWall(0,5,0, scene, 0, Math.PI/2); // ceiling

    // create a point light
    var pointLight = new THREE.PointLight(0xFFFFFF);

    pointLight.position.x = 0;
    pointLight.position.y = 2;
    pointLight.position.z = 2;

    scene.add(pointLight);
}

function createWall(x, y, z, scene, rotationY, rotationX) {
    var geometry = new THREE.BoxGeometry(10,10,1); //x,y,z
    var material = new THREE.MeshLambertMaterial({color: 0xFFFDD0});
    var wall = new THREE.Mesh(geometry, material);

    wall.position.x = x;
    wall.position.y = y;
    wall.position.z = z;

    wall.rotation.y = rotationY;
    wall.rotation.x = rotationX || 0;

    scene.add(wall);
}

function initRenderer() {
    renderCanvas = document.getElementById("render-canvas");
    renderer = new THREE.WebGLRenderer({
        canvas: renderCanvas,
    });
    renderer.setClearColor(0x555555); // background color
    renderer.setSize(WIDTH, HEIGHT, false);
    vrrenderer = new THREE.VRRenderer(renderer, vrHMD);
}

function render() {
    requestAnimationFrame(render);
    var state = vrHMDSensor.getState();
    camera.quaternion.set(state.orientation.x, state.orientation.y, state.orientation.z, state.orientation.w);
    vrrenderer.render(scene, camera);
}
