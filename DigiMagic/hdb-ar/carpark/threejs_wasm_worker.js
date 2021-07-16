function isMobile() {
    return /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);
}

var interpolationFactor = 24;

var clock = new THREE.Clock();

var trackedMatrix = {
    // for interpolation
    delta: [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ],
    interpolated: [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ]
}

var markers = {
    "pinball": {
        width: 1637,
        height: 2048,
        dpi: 250,
        url: "DataNFT/pinball",
    },
};

var setMatrix = function (matrix, value) {
    var array = [];
    for (var key in value) {
        array[key] = value[key];
    }
    if (typeof matrix.elements.set === "function") {
        matrix.elements.set(array);
    } else {
        matrix.elements = [].slice.call(array);
    }
};

var pipe_bg;
var airInvent_bg;
var plane_1;
var plane_2;
var plane_3;
var plane_4;

var model;//gltf

//tools
var adjust_scale = 0.17;
var adjust_px = 0;
var adjust_py = 0;
var adjust_angle = 53;

var carpark_texture = THREE.ImageUtils.loadTexture('assets/sprites/carpark.png');
SpriteAnimator.add({ texture: carpark_texture, tilesHorizontal: 10, tilesVertical: 10, fps: 10, numberOfTiles: 75 });
var carpark_animate = new THREE.Mesh(new THREE.PlaneGeometry(145, 145), new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, map: carpark_texture }));

var blue_light_texture = THREE.ImageUtils.loadTexture('assets/sprites/blue_light.png');
SpriteAnimator.add({ texture: blue_light_texture, tilesHorizontal: 6, tilesVertical: 6, fps: 8, numberOfTiles: 31 });
var blueLight_animate = new THREE.Mesh(new THREE.PlaneGeometry(145, 145), new THREE.MeshBasicMaterial({ transparent: true, map: blue_light_texture }));

var red_light_texture = THREE.ImageUtils.loadTexture('assets/sprites/red_light.png');
SpriteAnimator.add({ texture: red_light_texture, tilesHorizontal: 6, tilesVertical: 6, fps: 8, numberOfTiles: 31 });
var redLight_animate = new THREE.Mesh(new THREE.PlaneGeometry(145, 145), new THREE.MeshBasicMaterial({ transparent: true, map: red_light_texture }));

var sensor_light_texture = THREE.ImageUtils.loadTexture('assets/sprites/sensor.png');
SpriteAnimator.add({ texture: sensor_light_texture, tilesHorizontal: 6, tilesVertical: 6, fps: 8, numberOfTiles: 20 });
var sensorLight_animate = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, map: sensor_light_texture }));

var airflow_texture = THREE.ImageUtils.loadTexture('assets/sprites/airflow.png');
SpriteAnimator.add({ texture: airflow_texture, tilesHorizontal: 6, tilesVertical: 6, fps: 8, numberOfTiles: 23 });
var airflow_animate = new THREE.Mesh(new THREE.PlaneGeometry(145, 145), new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, map: airflow_texture }));

var stop_airflow_texture = THREE.ImageUtils.loadTexture('assets/sprites/stop_air_flow.png');
SpriteAnimator.add({ texture: stop_airflow_texture, tilesHorizontal: 6, tilesVertical: 6, fps: 8, numberOfTiles: 20 });
var stop_airflow_animate = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, map: stop_airflow_texture }));

//var worker;
function start(container, marker, video, input_width, input_height, canvas_draw, render_update, track_update) {
    worker = new Worker('wasm_worker/artoolkit.wasm_worker.js');
    worker.onmessage = function (ev) {
        start2(container, marker, video, input_width, input_height, canvas_draw, render_update, track_update);
    }
}

function start2(container, marker, video, input_width, input_height, canvas_draw, render_update, track_update) {
    var vw, vh;
    var sw, sh;
    var pscale, sscale;
    var w, h;
    var pw, ph;
    var ox, oy;
    var camera_para = './../Data/camera_para-iPhone 5 rear 640x480 1.0m.dat';

    var canvas_process = document.createElement('canvas');
    var context_process = canvas_process.getContext('2d');
    //THREE.WebGLRendererTarget()
    var renderer = new THREE.WebGLRenderer({ canvas: canvas_draw, alpha: true, antialias: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    var scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    //var camera = new THREE.Camera();
    //camera.matrixAutoUpdate = false;
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 330);
    scene.add(camera);

    var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    var step = 1;

    var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshNormalMaterial()
    );

    var root = new THREE.Object3D();
    scene.add(root);
    root.visible = false;

    carpark_animate.position.x = -5;
    carpark_animate.position.y = -11;//38
    carpark_animate.position.z = -24;
    carpark_animate.rotation.x = -37 * 0.0174532925;
    carpark_animate.scale.x = carpark_animate.scale.y = carpark_animate.scale.z = 1.15;
    root.add(carpark_animate);

    blueLight_animate.position.x = -5;
    blueLight_animate.position.y = -10;
    blueLight_animate.position.z = -20;
    blueLight_animate.rotation.x = -37 * 0.0174532925;
    blueLight_animate.scale.x = blueLight_animate.scale.y = blueLight_animate.scale.z = 1.4;
    root.add(blueLight_animate);
    //blueLight_animate.visible = false;

    redLight_animate.position.x = -5;
    redLight_animate.position.y = -10;
    redLight_animate.position.z = -20;
    redLight_animate.rotation.x = -37 * 0.0174532925;
    redLight_animate.scale.x = redLight_animate.scale.y = redLight_animate.scale.z = 1.4;
    root.add(redLight_animate);
    redLight_animate.visible = false;

    sensorLight_animate.position.x = -5;
    sensorLight_animate.position.y = -10;
    sensorLight_animate.position.z = -17;
    sensorLight_animate.rotation.x = -37 * 0.0174532925;
    sensorLight_animate.scale.x = sensorLight_animate.scale.y = sensorLight_animate.scale.z = 1;
    root.add(sensorLight_animate);
    sensorLight_animate.visible = false;

    airflow_animate.position.x = -5;
    airflow_animate.position.y = -10;
    airflow_animate.position.z = -14;
    airflow_animate.rotation.x = -37 * 0.0174532925;
    airflow_animate.scale.x = airflow_animate.scale.y = airflow_animate.scale.z = 1;
    root.add(airflow_animate);
    airflow_animate.visible = false;

    stop_airflow_animate.position.x = -5;
    stop_airflow_animate.position.y = -10;
    stop_airflow_animate.position.z = -14;
    stop_airflow_animate.rotation.x = -37 * 0.0174532925;
    stop_airflow_animate.scale.x = stop_airflow_animate.scale.y = stop_airflow_animate.scale.z = 1;
    root.add(stop_airflow_animate);
    stop_airflow_animate.visible = false;

    //main_animate_1.visible = false;

    //var loader = new THREE.TextureLoader();
    //var texture = loader.load( 'https://i.imgur.com/RoNmD7W.png' );

    const pipe_material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/pipe.png'), opacity: 1, transparent: true });
    pipe_bg = new THREE.Mesh(new THREE.PlaneGeometry(150, 150, 10, 10), pipe_material);
    pipe_bg.position.x = -5;
    pipe_bg.position.y = -10;
    pipe_bg.position.z = -19;
    pipe_bg.rotation.x = -37 * 0.0174532925;
    pipe_bg.scale.x = pipe_bg.scale.y = pipe_bg.scale.z = 1.40;
    // pipe_bg.visible = false;

    const airInvent_material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/airvent.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    airInvent_bg = new THREE.Mesh(new THREE.PlaneGeometry(150, 150, 10, 10), airInvent_material);
    airInvent_bg.position.x = -5;
    airInvent_bg.position.y = -10;
    airInvent_bg.position.z = -18;
    airInvent_bg.rotation.x = -37 * 0.0174532925;
    airInvent_bg.scale.x = airInvent_bg.scale.y = airInvent_bg.scale.z = 1.4;
    airInvent_bg.visible = false;

    //const geometry = new THREE.PlaneGeometry(50, 50, 10);
    const material_1 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/description_1.png'), opacity: 1, transparent: true, depthTest: false, side: THREE.DoubleSide });
    plane_1 = new THREE.Mesh(new THREE.PlaneGeometry(100, 20, 10, 10), material_1);
    plane_1.position.x = -8;
    plane_1.position.y = 40;
    plane_1.position.z = -20
    plane_1.rotation.x = 10 * 0.0174532925;
    plane_1.scale.x = plane_1.scale.y = plane_1.scale.z = 1.40;
    //plane_1.visible = false;

    const material_2 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/description_2.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    plane_2 = new THREE.Mesh(new THREE.PlaneGeometry(100, 20, 10, 10), material_2);
    plane_2.position.x = -8;
    plane_2.position.y = 40;
    plane_2.position.z = -20;
    plane_2.rotation.x = 10 * 0.0174532925;
    plane_2.scale.x = plane_2.scale.y = plane_2.scale.z = 1.40;
    plane_2.visible = false;

    const material_3 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/description_3.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    plane_3 = new THREE.Mesh(new THREE.PlaneGeometry(100, 25, 10, 10), material_3);
    plane_3.position.x = -8;
    plane_3.position.y = 40;
    plane_3.position.z = -20;
    plane_3.rotation.x = 10 * 0.0174532925;
    plane_3.scale.x = plane_3.scale.y = plane_3.scale.z = 1.40;
    plane_3.visible = false;

    const material_4 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/description_4.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    plane_4 = new THREE.Mesh(new THREE.PlaneGeometry(100, 20, 10, 10), material_4);
    plane_4.position.x = -8;
    plane_4.position.y = 40;
    plane_4.position.z = -20;
    plane_4.rotation.x = 10 * 0.0174532925;
    plane_4.scale.x = plane_4.scale.y = plane_4.scale.z = 1.40;
    plane_4.visible = false;

    root.matrixAutoUpdate = false;
    root.add(plane_1);

    root.matrixAutoUpdate = false;
    root.add(plane_2);

    root.matrixAutoUpdate = false;
    root.add(plane_3);

    root.matrixAutoUpdate = false;
    root.add(plane_4);

    root.matrixAutoUpdate = false;
    root.add(pipe_bg);

    root.matrixAutoUpdate = false;
    root.add(airInvent_bg);

    /* Load Model */
    var threeGLTFLoader = new THREE.GLTFLoader();
    threeGLTFLoader.load("Data/models/carpark.glb", function (gltf) {
        //model = gltf.scene.children[0];
        model = gltf.scene;
        model.position.x = -5;
        model.position.y = -20;//default 30
        model.position.z = -33;
        // model.scale.x = model.scale.y = model.scale.z = 0.12;
        // model.rotation.x = 90 * 0.0174532925;

        model.scale.x = model.scale.y = model.scale.z = adjust_scale;
        model.rotation.x = adjust_angle * 0.0174532925;

        /*var animation = gltf.animations[0];
        var mixer = new THREE.AnimationMixer(model);
        mixers.push(mixer);
        var action = mixer.clipAction(animation);
        action.play();*/

        root.matrixAutoUpdate = false;
        root.add(model);
    });

    /* sphere.material.flatShading;
      sphere.position.z = 0;
      sphere.position.x = 100;
      sphere.position.y = 100;
      sphere.scale.set(200, 200, 200);
  
      root.matrixAutoUpdate = false;
      root.add(sphere);*/

    var load = function () {
        vw = input_width;
        vh = input_height;

        pscale = 320 / Math.max(vw, vh / 3 * 4);
        //sscale = isMobile() ? window.outerWidth / input_width : 1;
        sscale = window.outerWidth / input_width;

        sw = vw * sscale;
        sh = vh * sscale;

        //ake config for full screen on mobile
        //video.style.width = sw + "px";
        //video.style.height = sh + "px";
        //container.style.width = sw + "px";
        //container.style.height = sh + "px";
        //canvas_draw.style.clientWidth = sw + "px";
        //canvas_draw.style.clientHeight = sh + "px";
        canvas_draw.width = sw;
        canvas_draw.height = sh;
        w = vw * pscale;
        h = vh * pscale;
        pw = Math.max(w, h / 3 * 4);
        ph = Math.max(h, w / 4 * 3);
        ox = (pw - w) / 2;
        oy = (ph - h) / 2;
        canvas_process.style.clientWidth = pw + "px";
        canvas_process.style.clientHeight = ph + "px";
        canvas_process.width = pw;
        canvas_process.height = ph;

        renderer.setSize(sw, sh);

        console.log("marker url" + marker.url);

        worker.postMessage({ type: "load", pw: pw, ph: ph, camera_para: camera_para, marker: '../' + marker.url });

        worker.onmessage = function (ev) {
            var msg = ev.data;
            switch (msg.type) {
                case "loaded": {
                    var proj = JSON.parse(msg.proj);
                    var ratioW = pw / w;
                    var ratioH = ph / h;
                    proj[0] *= ratioW;
                    proj[4] *= ratioW;
                    proj[8] *= ratioW;
                    proj[12] *= ratioW;
                    proj[1] *= ratioH;
                    proj[5] *= ratioH;
                    proj[9] *= ratioH;
                    proj[13] *= ratioH;
                    setMatrix(camera.projectionMatrix, proj);
                    break;
                }

                case "endLoading": {
                    if (msg.end == true)
                        // removing loader page if present
                        document.body.classList.remove("loading");
                    document.getElementById("loading").remove();
                    break;
                }

                case "found": {
                    found(msg);
                    break;
                }

                case "not found": {
                    found(null);
                    break;
                }
            }

            track_update();
            process();
        };
    };

    var world;

    var found = function (msg) {
        if (!msg) {
            world = null;
        } else {
            world = JSON.parse(msg.matrixGL_RH);
        }
    };

    var lasttime = Date.now();
    var time = 0;

    var draw = function () {
        render_update();
        var now = Date.now();
        var dt = now - lasttime;
        time += dt;
        lasttime = now;

        //adjust model
        /*  if (model != undefined || model != null) {
              model.scale.x = model.scale.y = model.scale.z = adjust_scale;
              console.log("adjust px: "+adjust_px);
              model.position.x = 30 + adjust_px;
              model.position.y = 30 + adjust_py;
              model.rotation.x = adjust_angle*0.0174532925;
          }*/

        if (!world) {
            //sphere.visible = false;
            // root.visible = false;
        } else {
            console.log("found");
            //root.visible = true;
            //sphere.visible = true;
            // interpolate matrix
            /* for (var i = 0; i < 16; i++) {
                 trackedMatrix.delta[i] = world[i] - trackedMatrix.interpolated[i];
                 trackedMatrix.interpolated[i] =
                     trackedMatrix.interpolated[i] +
                     trackedMatrix.delta[i] / interpolationFactor;
             }*/

            // set matrix of 'root' by detected 'world' matrix
            // setMatrix(root.matrix, trackedMatrix.interpolated);
            root.visible = true;
        }

        renderer.render(scene, camera);
        SpriteAnimator.update(clock.getDelta());


    };

    function process() {
        context_process.fillStyle = "black";
        context_process.fillRect(0, 0, pw, ph);
        context_process.drawImage(video, 0, 0, vw, vh, ox, oy, w, h);

        var imageData = context_process.getImageData(0, 0, pw, ph);
        worker.postMessage({ type: "process", imagedata: imageData }, [
            imageData.data.buffer
        ]);
    }
    var tick = function () {
        draw();
        requestAnimationFrame(tick);
    };

    load();
    tick();
    process();
}
