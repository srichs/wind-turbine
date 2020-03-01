/**
 * Filename: WindTurbine.js
 * Date: 20 Feb 2020 <p>
 *
 * Purpose: This javascript file creates a 3D graphics scene using the Three.js
 *     library. This scene is used to create a wind turbine generator.
 *
 * @author sr
 * @version 0.1.1
 */

"use strict";

var scene, camera, renderer; // Three.js rendering basics.
var canvas; // The canvas on which the image is rendered.
var controls; // The controls for the trackball

var aboveLight;
var ambientLight;
var viewpointLight;
var redLight;

var model;
var rotatingComponents;
var animating = true;
var rotateSpeed = 0.050;

/*  Create the scene graph.  This function is called once, as soon as the page loads.
 *  The renderer has already been created before this function is called.
 */
function createScene() {
    renderer.setClearColor(0x444444);
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 100);
    camera.position.set(-25, 20, 50);

    aboveLight = new THREE.DirectionalLight(0xffffff, 0.6);
    scene.add(aboveLight);
    viewpointLight = new THREE.DirectionalLight(0xffffff, 0.8);
    viewpointLight.position.set(0, 0, 1);
    scene.add(viewpointLight);
    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    redLight = new THREE.DirectionalLight("red", 0.8);
    redLight.position.set(0, 0, 1);
    scene.add(redLight);

    model = new THREE.Object3D();
    var white = new THREE.MeshLambertMaterial({color: "white"});

    var ground = new THREE.Mesh(
        new THREE.BoxGeometry(10, 1, 10),
        new THREE.MeshLambertMaterial({
            color: 0x00CC55
        })
    )
    ground.position.y = -11;

    var transformer = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 3),
        new THREE.MeshLambertMaterial({
            color: "lightslategray"
        })
    );
    transformer.position.set(-3, -9, -3);

    var base = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 1, 32, 3), white
    );
    base.position.y = -10;

    var pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.5, 20, 32, 1), white
    );

    var turbineHousing = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 2), white
    );
    turbineHousing.position.set(0, 10, -0.7);

    rotatingComponents = new THREE.Object3D();

    var turbineShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 2, 32, 1), white
    );

    var endCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 32, 32), white
    );
    endCap.position.y = 1;

    var triangle = new THREE.Shape(); // Create a triangular prism to form into a blade for the wind mill
    triangle.moveTo(-0.35, -0.35);
    triangle.lineTo(0, 6);
    triangle.lineTo(0.35, -0.35);
    triangle.lineTo(-0.35, -0.35);
    var extrudedGeometry = new THREE.ExtrudeGeometry(triangle, {amount: 0.1, bevelEnabled: false});
    var tPrism = new THREE.Mesh(extrudedGeometry, white);
    tPrism.rotation.x = Math.PI/2;
    tPrism.position.y = 1;
    tPrism.position.z = 4;
    var tPrism2 = tPrism.clone();
    tPrism2.rotation.z = Math.PI
    tPrism2.position.z = 3.45;
    tPrism2.scale.y = 0.63;

    var blade = new THREE.Object3D();
    blade.add(tPrism);
    blade.add(tPrism2);

    var blade2 = blade.clone();
    blade2.rotation.y = Math.PI/3 * 2;

    var blade3 = blade.clone();
    blade3.rotation.y = Math.PI/3 * 4;

    rotatingComponents.add(turbineShaft);
    rotatingComponents.add(endCap);
    rotatingComponents.add(blade);
    rotatingComponents.add(blade2);
    rotatingComponents.add(blade3);
    rotatingComponents.position.set(0, 10, 0.5);
    rotatingComponents.rotation.x = Math.PI/2;

    model.add(ground);
    model.add(transformer);
    model.add(base);
    model.add(pole);
    model.add(turbineHousing);
    model.add(rotatingComponents);

    scene.add(model);
}

//---------------------------------- animation ----------------------------------------

/*  Render the scene.  This is called for each frame of the animation.  */
function render() {
    renderer.render(scene, camera);
}

/*  When an animation is in progress, this function is called just before rendering each
 *  frame of the animation, to make any changes necessary in the scene graph to prepare
 *  for that frame.
 */
function updateForFrame() {
    rotatingComponents.rotation.y += rotateSpeed;
}

/* This function runs the animation by calling updateForFrame() then calling render().
 * Finally, it arranges for itself to be called again to do the next frame.  When the
 * value of animating is set to false, this function does not schedule the next frame,
 * so the animation stops.
 */
function doFrame() {
    if(animating) {
        updateForFrame();
        controls.update();
        render();
        requestAnimationFrame(doFrame);
    }
}

/* This function is used to handle the animation when the play button is pressed. */
function doPlayControl() {
    if (!animating) {
        animating = true;
        controls.enabled = true;
        if (animating) {
            doFrame();
        }
    }
}

/* This function is used to handle the animation when the stop button is pressed. */
function doStopControl() {
    if (animating) {
        animating = false;
        controls.enabled = false;
    }
}

//------------------------------- keyboard  --------------------------------------

/*  Responds to user's key press.  Here, it is used to rotate the model */
function doKey(event) {
    var code = event.keyCode;
    var rotated = true;
    switch (code) {
        case 37:
            model.rotation.y -= 0.03;
            break; // left arrow
        case 39:
            model.rotation.y += 0.03;
            break; // right arrow
        case 38:
            model.rotation.x -= 0.03;
            break; // up arrow
        case 40:
            model.rotation.x += 0.03;
            break; // down arrow
        case 33:
            model.rotation.z -= 0.03;
            break; // page up
        case 34:
            model.rotation.z += 0.03;
            break; // page down
        case 36:
            model.rotation.set(0.2, 0, 0);
            break; // home
        default:
            rotated = false;
    }
    if (rotated) {
        event.preventDefault(); // Prevent keys from scrolling the page.
        if (!animating) { // (if an animation is running, no need for an extra render)
            render();
        }
    }
}

//--------------------- handle the lighting checkboxes -----------------------------

/* This function handles the changing of the aboveLight */
function doChangeAboveLight() {
    if (document.getElementById("light1").checked) {
        scene.add(aboveLight);
    } else {
        scene.remove(aboveLight);
    }
    if (!animating) {
        render();
    }
}

/* This function handles the changing of the viewpointLight */
function doChangeViewLight() {
    if (document.getElementById("light2").checked) {
        scene.add(viewpointLight);
    } else {
        scene.remove(viewpointLight);
    }
    if (!animating) {
        render();
    }
}

/* This function handles the changing of the ambientLight */
function doChangeAmbientLight() {
    if (document.getElementById("light3").checked) {
        scene.add(ambientLight);
    } else {
        scene.remove(ambientLight);
    }
    if (!animating) {
        render();
    }
}

/* This function handles the changing of the redLight */
function doChangeRedLight() {
    if (document.getElementById("light4").checked) {
        scene.add(redLight);
    } else {
        scene.remove(redLight);
    }
    if (!animating) {
        render();
    }
}

//--------------------------- slider control -------------------------------------------

function doSlideChange() {
    rotateSpeed = document.getElementById("range1").value * 0.001;
}

//---------------------------------------------------------------------------------------

/* This init() function is called when by the onload event when the document has loaded. */
function init() {
    console.log("hello");
    try {
        canvas = document.getElementById("glcanvas");
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<h3><b>Sorry, WebGL is required but is not available.</b><h3>";
        return;
    }
    document.addEventListener("keydown", doKey, false);
    document.getElementById("anim1").addEventListener("click", doPlayControl);
    document.getElementById("anim2").addEventListener("click", doStopControl);

    document.getElementById("light1").checked = true;
    document.getElementById("light1").onchange = doChangeAboveLight;
    document.getElementById("light2").checked = true;
    document.getElementById("light2").onchange = doChangeViewLight;
    document.getElementById("light3").checked = false;
    document.getElementById("light3").onchange = doChangeAmbientLight;
    document.getElementById("light4").checked = false;
    document.getElementById("light4").onchange = doChangeRedLight;

    document.getElementById("range1").oninput = doSlideChange;

    createScene();
    controls = new THREE.TrackballControls(camera, canvas);
    controls.noPan = true;
    render();
    doFrame();

    doChangeAmbientLight();
    doChangeRedLight();
}
