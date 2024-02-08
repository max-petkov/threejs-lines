import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

function Curves() {
  this.canvas = document.querySelector("canvas");
  this.scene = null;
  this.camera = null;
  this.renderer = null;
  this.renderPass = null;
  this.effectComposer = null;
  this.unrealBloomPass = null
  this.lines = [];
  this.controls = null;
  this.size = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  this.curve = null;
  this.fov = 75;
  
  this.variants = [
    {
      texture: "./textures/green-line.png",
      speed: 1.1,
      amplitude: 0.2,
      frequency: 3.,
      curve: [
        new THREE.Vector3(-10.689140896731658, 2.041518463927172, 12.38487444491875),
        new THREE.Vector3(-8.204101587228354, 2.0511835509003893, 12.38487444491875),
        new THREE.Vector3(-2.164652739907572, 2.372272723877032, 12.3004846232816),
        new THREE.Vector3(0.5651971218071963, 1.0429235386994042, 12.3004846232816),
        new THREE.Vector3(3.9282468049758754, 1.6866171202378193, 12.3004846232816),
        new THREE.Vector3(6.847043476617296, 1.5456594607522591, 11.668719552457011),
        new THREE.Vector3(7.9560219300636135, 1.7180363931560647, 11.380237294320157)
      ],
      colorOne: new THREE.Vector3(0.149,0.514,0.31),
      colorTwo: new THREE.Vector3(0.18,0.902,1.),
    },
    {
      texture: "./textures/yellow-line.png",
      speed: 1.1,
      amplitude: 0.1,
      frequency: 2.,
      curve: [
        new THREE.Vector3(-10.689140896731658, 2.041518463927172, 12.38487444491875),
        new THREE.Vector3(-8.204101587228354, 2.0511835509003893, 12.38487444491875),
        new THREE.Vector3(-2.164652739907572, 2.372272723877032, 12.3004846232816),
        new THREE.Vector3(0.5651971218071963, 1.0429235386994042, 12.3004846232816),
        new THREE.Vector3(3.9282468049758754, 1.6866171202378193, 12.3004846232816),
        new THREE.Vector3(6.847043476617296, 1.5456594607522591, 11.668719552457011),
        new THREE.Vector3(7.9560219300636135, 1.7180363931560647, 11.380237294320157)
      ],
      colorOne: new THREE.Vector3(1.,0.506,0.012),
      colorTwo: new THREE.Vector3(1.,0.867,0.059),
    },
    {
      texture: "./textures/blue-line.png",
      speed: 1.2,
      amplitude: 0.2,
      frequency: 3.,
      curve: [new THREE.Vector3(-9.586128415402765, 0.1357188984070783, 12.38487444491875),
        new THREE.Vector3(-4.748367184824435, -0.9852991285907371, 12.38487444491875),
        new THREE.Vector3(-1.0607765656493866, -2.035640867842491, 12.3004846232816),
        new THREE.Vector3(1.7587888133121097, -1.1591986293955983, 12.3004846232816),
        new THREE.Vector3(3.7535828889401506, -1.5770486610694283, 12.3004846232816),
        new THREE.Vector3(4.8680431089619915, -1.3825837990850616, 12.39433715132269),
        new THREE.Vector3(5.751821341181645, -1.0113996845107025, 12.672549171292085)],
      // curve: [
      //   new THREE.Vector3(-9.255569666329968, 3.00854450183378, 12.38487444491875),
      //   new THREE.Vector3(-4.795719544597945, -0.44112693645510337, 12.38487444491875),
      //   new THREE.Vector3(-2.045779782586448, 0.4727472514642228, 12.3004846232816),
      //   new THREE.Vector3(2.175621353994407, 0.18972439065774882, 12.3004846232816),
      //   new THREE.Vector3(4.598866185991017, -0.758162041129951, 12.178475668688959),
      //   new THREE.Vector3(5.9560219300636135, 0.7180363931560647, 12.380237294320157)
      // ],
      colorOne: new THREE.Vector3(0.169,0.235,0.557),
      colorTwo: new THREE.Vector3(0.106,0.141,1.),
    },
  ];
}

Curves.prototype.createFilter = function() {
  this.renderPass = new RenderPass(this.scene, this.camera);
  this.effectComposer = new EffectComposer(this.renderer);
  this.unrealBloomPass = new UnrealBloomPass();
  this.unrealBloomPass.resolution = new THREE.Vector2(this.size.width, this.size.height);

  // Cineon 
  // this.unrealBloomPass.threshold = 0.42;
  // this.unrealBloomPass.strength = 5;
  // this.unrealBloomPass.radius = 1.19;

  // this.renderer.toneMapping = THREE.CineonToneMapping;
  // this.renderer.toneMappingExposure = 1;

  // Reinhard
  this.unrealBloomPass.threshold = 0.45;
  this.unrealBloomPass.strength = 4.445;
  this.unrealBloomPass.radius = 1.25;

  this.renderer.toneMapping = THREE.ReinhardToneMapping;
  this.renderer.toneMappingExposure = 1;

  this.effectComposer.addPass(this.renderPass);
  this.effectComposer.addPass(this.unrealBloomPass);
}

Curves.prototype.createScene = function () {
  this.scene = new THREE.Scene();
  // this.scene.add(new THREE.GridHelper(20, 20));
};

Curves.prototype.createCamera = function () {
  this.camera = new THREE.PerspectiveCamera(
    this.fov,
    this.size.width / this.size.height
  );
  this.camera.position.z = 16;
  this.camera.position.x = 4;
};

// https://copyprogramming.com/howto/incrementally-display-three-js-tubegeometry
Curves.prototype.createLines = function () { 
  const tubularSegments = 100;
  const radius  = 0.01;
  const radialSegments = 3;

  for (let i = 0; i < this.variants.length; i++) {
    
    const curve = new THREE.CatmullRomCurve3(this.variants[i].curve);
    let geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
    geometry = new THREE.BufferGeometry().fromGeometry(geometry);
    geometry.setDrawRange(0, 0);

    const material = new THREE.ShaderMaterial({ 
      uniforms:{
        uTime: {value: 0},
        uTexture: {value: new THREE.TextureLoader().load(this.variants[i].texture)},
        uSpeed: {value: this.variants[i].speed},
        uAmplitude: {value: this.variants[i].amplitude},
        uFrequency: {value: this.variants[i].frequency},
        uColorOne: {value: this.variants[i].colorOne},
        uColorTwo: {value: this.variants[i].colorTwo},
      },
      vertexShader: this.vertex(),
      fragmentShader: this.fragment(),

      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst:THREE.OneFactor ,
      depthTest: false
      // wireframe: true,
    });

    const line = new THREE.Mesh(geometry, material);


    if(!i || i === 1) {
      line.position.y = -1.5;
      line.position.x = -0.5;
    }

    if(i === 2) {
      line.position.y = 1.5;
    }

    this.lines.push(line);
    this.scene.add(line);
  }
};

Curves.prototype.vertex = function() {
  return `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uAmplitude;
  uniform float uFrequency;

  varying float vY;
  varying vec2 vUv;
  
  void main() {
    vec3 newPosition = position;
    float PI = 3.141592653589793238462643383279502884197;
    float y = uAmplitude * sin((newPosition.x - uTime/uSpeed) * PI / uFrequency);

    newPosition.xy += y;
    // newPosition.yxz += y;
    vY = y;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.); 
  }
  `;
}

Curves.prototype.fragment = function() {
  return `
  uniform sampler2D uTexture;
  uniform vec3 uColorOne;
  uniform vec3 uColorTwo;

  varying float vY;
  varying vec2 vUv;
  
  void main() {
    vec3 colorMix = mix(uColorOne, uColorTwo, smoothstep(0., 0.35, vY));
    vec4 texture = texture2D(uTexture, vUv);
    
    gl_FragColor = texture;
  }
  `;
}

Curves.prototype.createRenderer = function () {
  this.renderer = new THREE.WebGLRenderer({
    canvas: this.canvas,
    antialias: true,
    alpha: false,
  });
  this.renderer.setSize(this.size.width, this.size.height);
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  this.renderer.render(this.scene, this.camera);
};

Curves.prototype.resize = function () {
  let ww = window.innerWidth;

  window.addEventListener("resize", () => {
    if (ww !== window.innerWidth) {
      ww = window.innerWidth;

      this.size.width = window.innerWidth;
      this.size.height = window.innerHeight;
      this.renderer.setSize(this.size.width, this.size.height);
      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
      // this.effectComposer.render();
      this.renderer.render(this.scene, this.camera);
    }
  });
};

Curves.prototype.createControls = function () {
  this.controls = new OrbitControls(this.camera, this.canvas);
};

Curves.prototype.animate = function () {

  gsap.ticker.add((time) => {
    for (let i = 0; i < this.lines.length; i++) {
      const material = this.lines[i].material;
      material.uniforms.uTime.value = time;      
    }

    this.effectComposer.render();
    // this.renderer.render(this.scene, this.camera);
    this.controls.update();
  });
};

Curves.prototype.showLines = function() {
  this.draw = {value: 0};

  gsap.to(this.draw, {
    value: this.lines[0].geometry.getAttribute("position").count,
    duration: 3,
    ease: Power1.easeInOut,
    onUpdate: () => this.drawLine(),
  })
}

Curves.prototype.drawLine = function() {
  for (let i = 0; i < this.lines.length; i++) {
    const geometry = this.lines[i].geometry;
    const position = geometry.getAttribute("position");
    const ease = this.draw.value;

    if(ease < position.count) geometry.setDrawRange(0, ease);
    else geometry.setDrawRange(0, position.count);

    position.needsUpdate = true;
  }
}

Curves.prototype.createGUI = function() {
  const gui = new GUI();
	const bloomFolder = gui.addFolder( 'Bloom' );
  const toneMappingFolder = gui.addFolder( 'Tone Mapping' );

  bloomFolder
  .add( this.unrealBloomPass, 'threshold', 0.0, 5 )
  .onChange( ( value ) => this.unrealBloomPass.threshold = Number( value ));

  bloomFolder
  .add( this.unrealBloomPass, 'strength', 0.0, 5 )
  .onChange( ( value ) => this.unrealBloomPass.strength = Number( value ));

  bloomFolder
  .add( this.unrealBloomPass, 'radius', 0.0, 5 )
  .onChange( ( value ) => this.unrealBloomPass.radius = Number( value ));

  toneMappingFolder
  .add( this.renderer, 'toneMappingExposure', 0.0, 5 )
  .onChange( ( value ) => this.renderer.radius = Number( value ));
}


Curves.prototype.init = function () {
  this.createScene();
  this.createCamera();
  this.createLines();
  this.createRenderer();
  this.createFilter();
  this.createControls();
  this.createGUI();
  this.resize();
  this.animate();
  this.showLines();
};

new Curves().init();
