"use strict";

var camera, scene, mesh;
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
      FAR = 10000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.z = 300;
    scene = new THREE.Scene();
    //var geometry = new THREE.IcosahedronGeometry(0, 2);
    var radius = 50;
    var segments = 16;
    var rings = 16;
    var geometry = new THREE.SphereGeometry(radius, segments, rings);
    //var material = new THREE.MeshNormalMaterial();
    var material = new THREE.MeshLambertMaterial({color: 0xCC0000});
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);
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
    mesh.rotation.y += 0.01;
    var state = vrHMDSensor.getState();
    camera.quaternion.set(state.orientation.x, state.orientation.y, state.orientation.z, state.orientation.w);
    vrrenderer.render(scene, camera);
}
