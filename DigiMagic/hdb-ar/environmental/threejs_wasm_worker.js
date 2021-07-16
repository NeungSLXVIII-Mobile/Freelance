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

var plane_bg;
var plane_1;
var plane_2;
var plane_3;
var plane_top_1;
var plane_top_2;

//gltf
var model0;
var model1;
var model2;
var model3;

//tools
var adjust_scale = 2;
var adjust_px = 380 / 10;
var adjust_py = 0;
var adjust_angle = 25;
//, side: THREE.DoubleSide
var rain_texture = THREE.ImageUtils.loadTexture('assets/sprites/rain_drop.png');
SpriteAnimator.add({ texture: rain_texture, tilesHorizontal: 4, tilesVertical: 4, fps: 10, numberOfTiles: 11 });
var rain_animate = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, map: rain_texture, side: THREE.DoubleSide }));

var cloud_texture = THREE.ImageUtils.loadTexture('assets/sprites/cloud.png');
SpriteAnimator.add({ texture: cloud_texture, tilesHorizontal: 12, tilesVertical: 12, fps: 10, numberOfTiles: 121 });
var cloud_animate = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, map: cloud_texture, side: THREE.DoubleSide }));

var main_texture_1 = THREE.ImageUtils.loadTexture('assets/sprites/animation_1.png');
SpriteAnimator.add({ texture: main_texture_1, tilesHorizontal: 4, tilesVertical: 4, fps: 8, numberOfTiles: 12 });
var main_animate_1 = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, map: main_texture_1, side: THREE.DoubleSide }));

var main_texture_2 = THREE.ImageUtils.loadTexture('assets/sprites/animation_2.png');
SpriteAnimator.add({ texture: main_texture_2, tilesHorizontal: 6, tilesVertical: 6, fps: 8, numberOfTiles: 24 });
var main_animate_2 = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ transparent: true, map: main_texture_2 }));

var main_texture_3 = THREE.ImageUtils.loadTexture('assets/sprites/animation_3.png');
SpriteAnimator.add({ texture: main_texture_3, tilesHorizontal: 4, tilesVertical: 4, fps: 8, numberOfTiles: 12 });
var main_animate_3 = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ transparent: true, map: main_texture_3 }));

var sun_shade_texture = THREE.ImageUtils.loadTexture('assets/sprites/sun_shade.png');
SpriteAnimator.add({ texture: sun_shade_texture, tilesHorizontal: 16, tilesVertical: 16, fps: 24, numberOfTiles: 251 });
var sun_shade_animate = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ transparent: true, depthTest: true, map: sun_shade_texture, side: THREE.DoubleSide }));

var solar_irradiance_texture = THREE.ImageUtils.loadTexture('assets/sprites/solar_irradiance.png');
SpriteAnimator.add({ texture: solar_irradiance_texture, tilesHorizontal: 16, tilesVertical: 16, fps: 24, numberOfTiles: 251 });
var solar_irradiance_animate = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ transparent: true, depthTest: true, map: solar_irradiance_texture, side: THREE.DoubleSide }));

var wind_flow_texture = THREE.ImageUtils.loadTexture('assets/sprites/wind_flow.png');
SpriteAnimator.add({ texture: wind_flow_texture, tilesHorizontal: 12, tilesVertical: 11, fps: 24, numberOfTiles: 126 });
var wind_flow_animate = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ transparent: true, depthTest: true, map: wind_flow_texture, side: THREE.DoubleSide }));

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

    var renderer = new THREE.WebGLRenderer({ canvas: canvas_draw, alpha: true, antialias: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    var scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 350);
    scene.add(camera);
    //var camera = new THREE.Camera();
    //camera.matrixAutoUpdate = false;


    var light = new THREE.AmbientLight(0xffffff, 0.30);
    scene.add(light);

    var direct_light = new THREE.DirectionalLight(0xffffff, 1);
    direct_light.position.set(1, 1, 2);
    scene.add(direct_light);

    ///
    var step = 1;

    var root = new THREE.Object3D();
    scene.add(root);
    root.visible = false;

    //add sprite animator
    rain_animate.position.x = 0;
    rain_animate.position.y = 55;
    rain_animate.position.z = 50;
    rain_animate.scale.x = rain_animate.scale.y = rain_animate.scale.z = 1;
    //rain_animate.rotation.x = adjust_angle * 0.0174532925;
    //root.add(rain_animate);
    //rain_animate.visible = false;

    cloud_animate.position.x = 0;
    cloud_animate.position.y = 55;
    cloud_animate.position.z = 51;
    cloud_animate.scale.x = cloud_animate.scale.y = cloud_animate.scale.z = 1;
    //cloud_animate.rotation.x = adjust_angle * 0.0174532925;
    //root.add(cloud_animate);
    //cloud_animate.visible = false;

    main_animate_1.position.x = 0;
    main_animate_1.position.y = 14;
    main_animate_1.position.z = 52;
    main_animate_1.scale.x = main_animate_1.scale.y = main_animate_1.scale.z = 1.2;
    //main_animate_1.rotation.x = adjust_angle * 0.0174532925;
    //root.add(main_animate_1);
    //main_animate_1.visible = false;

    main_animate_2.position.x = 0;
    main_animate_2.position.y = 14;
    main_animate_2.position.z = 52;
    main_animate_2.scale.x = main_animate_2.scale.y = main_animate_2.scale.z = 1.2;
    //main_animate_2.rotation.x = adjust_angle * 0.0174532925;
    //root.add(main_animate_2);
    main_animate_2.visible = false;

    main_animate_3.position.x = 0;
    main_animate_3.position.y = 14;
    main_animate_3.position.z = 52;
    main_animate_3.scale.x = main_animate_3.scale.y = main_animate_3.scale.z = 1.2;
    //main_animate_3.rotation.x = adjust_angle * 0.0174532925;
    //root.add(main_animate_3);
    main_animate_3.visible = false;

    //var loader = new THREE.TextureLoader();
    //var texture = loader.load( 'https://i.imgur.com/RoNmD7W.png' );

    const material_bg = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/background_building.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    plane_bg = new THREE.Mesh(new THREE.PlaneGeometry(150, 150, 10, 10), material_bg);
    plane_bg.position.x = 0;
    plane_bg.position.y = 70;
    plane_bg.position.z = -45;
    plane_bg.scale.x = plane_bg.scale.y = plane_bg.scale.z = 1;
    //plane_bg.rotation.x = adjust_angle * 0.0174532925;
    //plane_bg.visible = false;

    //const geometry = new THREE.PlaneGeometry(50, 50, 10);
    const material_1 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/description_1.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    plane_1 = new THREE.Mesh(new THREE.PlaneGeometry(130, 35, 10, 10), material_1);
    plane_1.position.x = 0;
    plane_1.position.y = -45;
    plane_1.position.z = 55;
    plane_1.scale.x = plane_1.scale.y = plane_1.scale.z = 1.2;
    //plane_1.rotation.x = 20 * 0.0174532925;
    // plane_1.visible = false;

    const material_2 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/description_2.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    plane_2 = new THREE.Mesh(new THREE.PlaneGeometry(130, 35, 10, 10), material_2);
    plane_2.position.x = 0;
    plane_2.position.y = -45;
    plane_2.position.z = 55;
    plane_2.scale.x = plane_2.scale.y = plane_2.scale.z = 1.2;
    //plane_2.rotation.x = 20 * 0.0174532925;
    plane_2.visible = false;

    const material_3 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/description_3.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    plane_3 = new THREE.Mesh(new THREE.PlaneGeometry(130, 35, 10, 10), material_3);
    plane_3.position.x = 0;
    plane_3.position.y = -45;
    plane_3.position.z = 55;
    plane_3.scale.x = plane_3.scale.y = plane_3.scale.z = 1.2;
    // plane_3.rotation.x = 20 * 0.0174532925;
    plane_3.visible = false;

    const material_top_1 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/animate_top_1.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    plane_top_1 = new THREE.Mesh(new THREE.PlaneGeometry(95, 95, 10, 10), material_top_1);
    plane_top_1.position.x = 0;
    plane_top_1.position.y = 12;
    plane_top_1.position.z = 0;
    plane_top_1.scale.x = plane_top_1.scale.y = plane_top_1.scale.z = 1.05;
    //plane_top_1.rotation.x = (adjust_angle - 90) * 0.0174532925;
    plane_top_1.rotation.x = -(90) * 0.0174532925;
    // plane_top_1.visible = false;

    const material_top_2 = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('Data/textures/animate_top_2.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
    plane_top_2 = new THREE.Mesh(new THREE.PlaneGeometry(95, 95, 10, 10), material_top_2);
    plane_top_2.position.x = 0;
    plane_top_2.position.y = 12;
    plane_top_2.position.z = 0;
    plane_top_2.scale.x = plane_top_2.scale.y = plane_top_2.scale.z = 1.05;
    //plane_top_2.rotation.x = (adjust_angle - 90) * 0.0174532925;
    plane_top_2.rotation.x = - 90 * 0.0174532925;
    plane_top_2.visible = false;

    // root.matrixAutoUpdate = false;
    // root.add(plane_bg);

    // root.matrixAutoUpdate = false;
    // root.add(plane_1);

    // root.matrixAutoUpdate = false;
    // root.add(plane_2);

    // root.matrixAutoUpdate = false;
    // root.add(plane_3);

    // root.matrixAutoUpdate = false;
    // root.add(plane_top_1);

    // root.matrixAutoUpdate = false;
    // root.add(plane_top_2);

    /* Load Model */
    var threeGLTFLoader0 = new THREE.GLTFLoader();
    threeGLTFLoader0.load("Data/models/environmental1.gltf", function (gltf) {
        model0 = gltf.scene;

        model0.position.x = 0;
        model0.position.y = 0;
        model0.position.z = 0;

        model0.scale.x = model0.scale.y = model0.scale.z = 0.1;
        model0.rotation.x = adjust_angle * 0.0174532925;

        model0.visible = true;

        console.log("model0");

        var building0;
        var building_floor0;

        for (count = 0; count < model0.children.length; count++) {
            console.log(model0.children[count]);
            // Building.
            if (model0.children[count].name == "Building") {
                console.log("Building LV1");
                building0 = model0.children[count];
            }

            // Floor.
            if (model0.children[count].name == "Cube") {
                console.log("Cube LV1");
                building_floor0 = model0.children[count];
            }

            // Plane.
            if (model0.children[count].name == "Plane") {
                console.log("Plane LV1");
                model0.children[count].visible = false;
            }

            for (count2 = 0; count2 < model0.children[count].children.length; count2++) {
                console.log(model0.children[count].children[count2]);

                // Building.
                if (model0.children[count].children[count2].name == "Building") {
                    console.log("Building LV2");
                    building0 = model0.children[count].children[count2];
                }

                // Floor.
                if (model0.children[count].children[count2].name == "Cube") {
                    console.log("Cube LV2");
                    building_floor0 = model0.children[count].children[count2];
                }

                // Plane.
                if (model0.children[count].name == "Plane") {
                    console.log("Plane LV2");
                    model0.children[count].children[count2].visible = false;
                }
            }
        }

        if (building0 != undefined) {
            building0.material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('Data/textures/building0.png'), opacity: 1, side: THREE.DoubleSide });
            building0.material.needsUpdate = true;
        }

        if (building_floor0 != undefined) {
            building_floor0.material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('Data/textures/building_floor0.png'), opacity: 1, transparent: true, side: THREE.DoubleSide });
            building_floor0.material.needsUpdate = true;
        }

        root.add(model0);
    });
    var threeGLTFLoader1 = new THREE.GLTFLoader();
    threeGLTFLoader1.load("Data/models/environmental1.gltf", function (gltf) {
        model1 = gltf.scene;

        model1.position.x = 0;
        model1.position.y = 0;
        model1.position.z = 0;

        model1.scale.x = model1.scale.y = model1.scale.z = 0.1;
        model1.rotation.x = adjust_angle * 0.0174532925;

        model1.visible = false;

        console.log("model1");

        var building1;
        var building_floor1;
        var building_plane1;

        for (count = 0; count < model1.children.length; count++) {
            console.log(model1.children[count]);
            // Building.
            if (model1.children[count].name == "Building") {
                console.log("Building LV1");
                building1 = model1.children[count];
            }

            // Floor.
            if (model1.children[count].name == "Cube") {
                console.log("Cube LV1");
                building_floor1 = model1.children[count];
            }

            // Plane.
            if (model1.children[count].name == "Plane") {
                console.log("Plane LV1");
                building_plane1 = model1.children[count];
            }

            for (count2 = 0; count2 < model1.children[count].children.length; count2++) {
                console.log(model1.children[count].children[count2]);

                // Building.
                if (model1.children[count].children[count2].name == "Building") {
                    console.log("Building LV2");
                    building1 = model1.children[count].children[count2];
                }

                // Floor.
                if (model1.children[count].children[count2].name == "Cube") {
                    console.log("Cube LV2");
                    building_floor1 = model1.children[count].children[count2];
                }

                // Plane.
                if (model1.children[count].name == "Plane") {
                    console.log("Plane LV2");
                    building_plane1 = model1.children[count].children[count2];
                }
            }
        }

        if (building1 != undefined) {
            building1.material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('Data/textures/building1.png'), opacity: 1, side: THREE.DoubleSide });
            building1.material.needsUpdate = true;
        }

        if (building_floor1 != undefined) {
            building_floor1.material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('Data/textures/building_floor1.png'), opacity: 1, side: THREE.DoubleSide });
            building_floor1.material.needsUpdate = true;
        }

        if (building_plane1 != undefined) {
            building_plane1.material = new THREE.MeshBasicMaterial({ transparent: true, depthTest: true, map: sun_shade_texture, side: THREE.DoubleSide });
            building_plane1.material.needsUpdate = true;
            building_plane1.rotation.x = -180 * 0.0174532925;
        }

        root.add(model1);
    });
    var threeGLTFLoader2 = new THREE.GLTFLoader();
    threeGLTFLoader2.load("Data/models/environmental2.gltf", function (gltf) {
        model2 = gltf.scene;

        model2.position.x = 0;
        model2.position.y = 0;
        model2.position.z = 0;

        model2.scale.x = model2.scale.y = model2.scale.z = 0.1;
        model2.rotation.x = adjust_angle * 0.0174532925;

        model2.visible = false;

        console.log("model2");

        var building2;
        var building_floor2;
        var building_plane2;

        for (count = 0; count < model2.children.length; count++) {
            console.log(model2.children[count]);
            // Building.
            if (model2.children[count].name == "Building") {
                console.log("Building LV1");
                building2 = model2.children[count];
            }

            // Floor.
            if (model2.children[count].name == "Cube") {
                console.log("Cube LV1");
                building_floor2 = model2.children[count];
            }

            // Plane.
            if (model2.children[count].name == "Plane") {
                console.log("Plane LV1");
                building_plane2 = model2.children[count];
            }

            for (count2 = 0; count2 < model2.children[count].children.length; count2++) {
                console.log(model2.children[count].children[count2]);

                // Building.
                if (model2.children[count].children[count2].name == "Building") {
                    console.log("Building LV2");
                    building2 = model2.children[count].children[count2];
                }

                // Floor.
                if (model2.children[count].children[count2].name == "Cube") {
                    console.log("Cube LV2");
                    building_floor2 = model2.children[count].children[count2];
                }

                // Plane.
                if (model2.children[count].name == "Plane") {
                    console.log("Plane LV2");
                    building_plane2 = model2.children[count].children[count2];
                }
            }
        }

        if (building2 != undefined) {
            building2.material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('Data/textures/building2.png'), opacity: 1, side: THREE.DoubleSide });
            building2.material.needsUpdate = true;
        }

        if (building_floor2 != undefined) {
            building_floor2.material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('Data/textures/building_floor2.png'), opacity: 1, side: THREE.DoubleSide });
            building_floor2.material.needsUpdate = true;
        }

        if (building_plane2 != undefined) {
            building_plane2.material = new THREE.MeshBasicMaterial({ transparent: true, depthTest: true, map: solar_irradiance_texture, side: THREE.DoubleSide });
            building_plane2.material.needsUpdate = true;
            building_plane2.rotation.x = -180 * 0.0174532925;
        }

        root.add(model2);
    });
    var threeGLTFLoader3 = new THREE.GLTFLoader();
    threeGLTFLoader3.load("Data/models/environmental3.gltf", function (gltf) {
        model3 = gltf.scene;

        model3.position.x = 0;
        model3.position.y = 0;
        model3.position.z = 0;

        model3.scale.x = model3.scale.y = model3.scale.z = 0.1;
        model3.rotation.x = adjust_angle * 0.0174532925;

        model3.visible = false;

        console.log("model3");

        var building3;
        var building_floor3;
        var building_plane3;

        for (count = 0; count < model3.children.length; count++) {
            console.log(model3.children[count]);
            // Building.
            if (model3.children[count].name == "Building") {
                console.log("Building LV1");
                building3 = model3.children[count];
            }

            // Floor.
            if (model3.children[count].name == "Cube") {
                console.log("Cube LV1");
                building_floor3 = model3.children[count];
            }

            // Plane.
            if (model3.children[count].name == "Plane1") {
                console.log("Plane1 LV1");
                building_plane3 = model3.children[count];
            }

            for (count2 = 0; count2 < model3.children[count].children.length; count2++) {
                console.log(model3.children[count].children[count2]);

                // Building.
                if (model3.children[count].children[count2].name == "Building") {
                    console.log("Building LV2");
                    building3 = model3.children[count].children[count2];
                }

                // Floor.
                if (model3.children[count].children[count2].name == "Cube") {
                    console.log("Cube LV2");
                    building_floor3 = model3.children[count].children[count2];
                }

                // Plane.
                if (model3.children[count].name == "Plane1") {
                    console.log("Plane1 LV2");
                    building_plane3 = model3.children[count].children[count2];
                }
            }
        }

        if (building3 != undefined) {
            building3.material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('Data/textures/building3.png'), opacity: 1, side: THREE.DoubleSide });
            building3.material.needsUpdate = true;
        }

        if (building_floor3 != undefined) {
            building_floor3.material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('Data/textures/building_floor3.png'), opacity: 1, side: THREE.DoubleSide });
            building_floor3.material.needsUpdate = true;
        }

        if (building_plane3 != undefined) {
            building_plane3.material = new THREE.MeshBasicMaterial({ transparent: true, depthTest: true, map: wind_flow_texture, side: THREE.DoubleSide });
            building_plane3.material.needsUpdate = true;
            building_plane3.rotation.x = -180 * 0.0174532925;
        }

        root.add(model3);
    });

    // // Sun Shade.
    // sun_shade_animate.position.x = 0;
    // sun_shade_animate.position.y = 10.5;
    // sun_shade_animate.position.z = 0;
    // sun_shade_animate.scale.x = 1.6;
    // sun_shade_animate.scale.y = 1.1;
    // sun_shade_animate.scale.z = 1;
    // sun_shade_animate.rotation.x = -90 * 0.0174532925;
    // sun_shade_animate.visible = false;

    // // Soloar Irradiance.
    // solar_irradiance_animate.position.x = 0;
    // solar_irradiance_animate.position.y = 10.5;
    // solar_irradiance_animate.position.z = 0;
    // solar_irradiance_animate.scale.x = 1.6;
    // solar_irradiance_animate.scale.y = 1.1;
    // solar_irradiance_animate.scale.z = 1;
    // solar_irradiance_animate.rotation.x = -90 * 0.0174532925;
    // solar_irradiance_animate.visible = false;

    // // Wind Flow.
    // wind_flow_animate.position.x = 0;
    // wind_flow_animate.position.y = 30;
    // wind_flow_animate.position.z = 0;
    // wind_flow_animate.scale.x = 1.6;
    // wind_flow_animate.scale.y = 1.1;
    // wind_flow_animate.scale.z = 1;
    // wind_flow_animate.rotation.x = -90 * 0.0174532925;
    // wind_flow_animate.visible = false;

    // root.matrixAutoUpdate = false;
    // root.add(sun_shade_animate);

    // root.matrixAutoUpdate = false;
    // root.add(solar_irradiance_animate);

    // root.matrixAutoUpdate = false;
    // root.add(wind_flow_animate);

    var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshNormalMaterial()
    );
    //root.add(sphere);
    // scene.add(sphere);

    /* sphere.material.flatShading;
      sphere.position.z = 0;
      sphere.position.x = 100;
      sphere.position.y = 100;
      sphere.scale.set(200, 200, 200);
  
      root.matrixAutoUpdate = false;
      root.add(sphere);*/

    //rotate model

    var three = THREE;
    var isDragging = false;
    var previousMousePosition = {
        x: 0,
        y: 0
    };
    //desktop
    document.addEventListener('mousedown', downScreen, false);
    document.addEventListener('mousemove', moveScreen, false);
    document.addEventListener('mouseup', upScreen, false);
    //
    document.addEventListener('touchstart', downScreen, false);
    document.addEventListener('touchmove', moveScreen2, false);
    document.addEventListener('touchend', upScreen, false);

    function downScreen(e) {
        console.log("downscreen");
        isDragging = true;
    }

    function moveScreen(e) {
        console.log("movescreen");

        //console.log(e);
        var deltaMove = {
            x: e.offsetX - previousMousePosition.x,
            y: e.offsetY - previousMousePosition.y
        };
        //toRadians(deltaMove.y * 1)
        if (isDragging) {

            var deltaRotationQuaternion = new three.Quaternion()
                .setFromEuler(new three.Euler(
                    0,
                    toRadians(deltaMove.x * 1),
                    0,
                    'XYZ'
                ));

            model.quaternion.multiplyQuaternions(deltaRotationQuaternion, model.quaternion);
        }
        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    }
    function moveScreen2(e) {
        console.log("movescreen");

        //console.log(e);
        var deltaMove = {
            x: e.touches[0].offsetX - previousMousePosition.x,
            y: e.touches[0].offsetY - previousMousePosition.y
        };
        //toRadians(deltaMove.y * 1)
        if (isDragging) {

            var deltaRotationQuaternion = new three.Quaternion()
                .setFromEuler(new three.Euler(
                    0,
                    toRadians(deltaMove.x * 1),
                    0,
                    'XYZ'
                ));

            model.quaternion.multiplyQuaternions(deltaRotationQuaternion, model.quaternion);
        }
        previousMousePosition = {
            x: e.touches[0].offsetX,
            y: e.touches[0].offsetY
        };
    }
    function upScreen(e) {
        console.log("upscreen");
        isDragging = false;
    }

    var load = function () {
        vw = input_width;
        vh = input_height;

        pscale = 320 / Math.max(vw, vh / 3 * 4);
        //pscale = 1;
        //sscale = isMobile() ? window.outerWidth / input_width : 1;
        sscale = window.outerWidth / input_width;
        console.log("pscale: " + pscale);
        console.log("sscale: " + sscale);

        sw = vw * sscale;
        sh = vh * sscale;
        //sw = 1080;
        // sh = 1920;

        console.log("sw: " + sw);
        console.log(" sh: " + sh);

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

        /* //adjust model
         if (model != undefined || model != null) {
             model.scale.x = model.scale.y = model.scale.z = adjust_scale;
             //console.log("adjust px: "+adjust_px);
             model.position.x = 50 + adjust_px;
             model.position.y = 30 + adjust_py;
 
             model.rotation.x = adjust_angle*0.0174532925;
         }*/

        if (!world) {
            //sphere.visible = false;
            //root.visible = false;
            //console.log("not found");
        } else {
            console.log("found");
            /*  root.visible = true;
              //sphere.visible = true;
              // interpolate matrix
             for (var i = 0; i < 16; i++) {
                  trackedMatrix.delta[i] = world[i] - trackedMatrix.interpolated[i];
                  trackedMatrix.interpolated[i] =
                      trackedMatrix.interpolated[i] +
                      trackedMatrix.delta[i] / interpolationFactor;
              }
  
              // set matrix of 'root' by detected 'world' matrix
              setMatrix(root.matrix, trackedMatrix.interpolated);*/

            root.visible = true;
        }

        if (model0 !== undefined) {
            // console.log("modelX:" + model1.position.x);
            // console.log("modelY:" + model1.position.y);
            // console.log("modelZ:" + model1.position.z);
            // model1.rotation.y = 45 * 0.0174532925;
        }
        if (model1 !== undefined) {

            /* console.log("modelX:" + model.position.x);
             console.log("modelY:" + model.position.y);
             console.log("modelZ:" + model.position.z);*/
            //model.rotation.y = 45 * 0.0174532925;

        }
        if (model2 !== undefined) {
            //
        }
        if (model3 !== undefined) {
            //
        }

        root.visible = true;

        renderer.render(scene, camera);
        SpriteAnimator.update(clock.getDelta());



    };

    function process() {
        /* console.log("process...");
         console.log("vw: "+vw);
         console.log("vh: "+vh);
         console.log("ox: "+ox);
         console.log("oy: "+oy);
         console.log("w: "+w);
         console.log("h: "+h);
         console.log("pw: "+pw);
         console.log("ph: "+ph);*/

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

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    function toDegrees(angle) {
        return angle * (180 / Math.PI);
    }
}

function choice1_worker() {
    model0.visible = false;
    model1.visible = true;
    model2.visible = false;
    model3.visible = false;

    // sun_shade_animate.visible = true;
    // solar_irradiance_animate.visible = false;
    // wind_flow_animate.visible = false;
}

function choice2_worker() {
    model0.visible = false;
    model1.visible = false;
    model2.visible = true;
    model3.visible = false;

    // sun_shade_animate.visible = false;
    // solar_irradiance_animate.visible = true;
    // wind_flow_animate.visible = false;
}

function choice3_worker() {
    model0.visible = false;
    model1.visible = false;
    model2.visible = false;
    model3.visible = true;

    // sun_shade_animate.visible = false;
    // solar_irradiance_animate.visible = false;
    // wind_flow_animate.visible = true;
}

