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
    // camera
    var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 1000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.z = 0;

    scene = new THREE.Scene();
    
    // create walls
    var width = 100;
    createWall(0,0,-width, scene, 0); // front
    createWall(width,0,0, scene, Math.PI/2); // right
    createWall(-width,0,0, scene, Math.PI/2); // left
    createWall(0,0,width, scene, 0); // back
    createWall(0,-width,0, scene, 0, Math.PI/2); // floor
    createWall(0,width,0, scene, 0, Math.PI/2); // ceiling

    // lighting
    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 20;
    scene.add(pointLight);

    // create a canvas element
    // taken from http://stemkoski.github.io/Three.js/Texture-From-Canvas.html
    // also see http://stackoverflow.com/a/15257807/1212045
    var canvas1 = document.createElement('canvas');
    canvas1.width = width*1.8;
    canvas1.height = width*1.8;
    var context1 = canvas1.getContext('2d');

    //context1.fillRect(0,0,canvas1.width, canvas1.height);

    //context1.font = "10px Arial";
    context1.fillStyle = "rgba(0,0,0,1)";
    context1.fillText('Hello, world!', 5, 10);
    
    // canvas contents will be used for a texture
    var texture1 = new THREE.Texture(canvas1) 
    texture1.needsUpdate = true;

    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
    material1.transparent = true;

    var mesh1 = new THREE.Mesh(
        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
        material1
      );
    mesh1.position.set(0,0,-width + 0.6); // place *just* in front of wall
    scene.add( mesh1 );
}

function createWall(x, y, z, scene, rotationY, rotationX) {
    var sideLength = 200;
    var geometry = new THREE.BoxGeometry(sideLength, sideLength,1); //x,y,z
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
