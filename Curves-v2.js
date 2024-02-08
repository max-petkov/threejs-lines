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
  this.meshes = [];
  this.controls = null;
  this.size = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  this.curve = null;
  this.fov = 75;
  
  this.variants = [
    {
      texture: "./img/grad-green.jpg",
      speed: 1.1,
      amplitude: 0.2,
      frequency: 3.,
      points: [
        new THREE.Vector3(-10.689140896731658, 2.041518463927172, 12.38487444491875),
        new THREE.Vector3(-8.204101587228354, 2.0511835509003893, 12.38487444491875),
        new THREE.Vector3(-2.164652739907572, 2.372272723877032, 12.3004846232816),
        new THREE.Vector3(0.5651971218071963, 1.0429235386994042, 12.3004846232816),
        new THREE.Vector3(3.9282468049758754, 1.6866171202378193, 12.3004846232816),
        new THREE.Vector3(6.847043476617296, 1.5456594607522591, 11.668719552457011),
        new THREE.Vector3(7.9560219300636135, 1.7180363931560647, 11.380237294320157)
      ],
    },
    {
      texture: "./img/grad-yellow.jpg",
      speed: 1.1,
      amplitude: 0.1,
      frequency: 2.,
      points: [
        new THREE.Vector3(-10.689140896731658, 2.041518463927172, 12.38487444491875),
        new THREE.Vector3(-8.204101587228354, 2.0511835509003893, 12.38487444491875),
        new THREE.Vector3(-2.164652739907572, 2.372272723877032, 12.3004846232816),
        new THREE.Vector3(0.5651971218071963, 1.0429235386994042, 12.3004846232816),
        new THREE.Vector3(3.9282468049758754, 1.6866171202378193, 12.3004846232816),
        new THREE.Vector3(6.847043476617296, 1.5456594607522591, 11.668719552457011),
        new THREE.Vector3(7.9560219300636135, 1.7180363931560647, 11.380237294320157)
      ],
    },
    {
      texture: "./img/grad-blue.jpg",
      speed: 1.2,
      amplitude: 0.2,
      frequency: 3.,
      points: [
        new THREE.Vector3(-9.255569666329968, 3.00854450183378, 12.38487444491875),
        new THREE.Vector3(-4.795719544597945, -0.44112693645510337, 12.38487444491875),
        new THREE.Vector3(-2.045779782586448, 0.4727472514642228, 12.3004846232816),
        new THREE.Vector3(2.175621353994407, 0.18972439065774882, 12.3004846232816),
        new THREE.Vector3(4.598866185991017, -0.758162041129951, 12.178475668688959)
      ],
    },
  ];

  this.mouse = {
    x: 1,
    y: 1,
    prevX: 1,
    prevY: 1,
    velocityX: 1,
    velocityY: 1
  }
}

Curves.prototype.mouseMove = function() {
  this.canvas.addEventListener("mousemove", (e) => {
    const {left, top, width, height } = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - left) / width);
    this.mouse.y = ((e.clientY - top) / height);
    
    this.mouse.velocityX = this.mouse.x - this.mouse.prevX;
    this.mouse.velocityY = this.mouse.y - this.mouse.prevY;
    
    this.mouse.prevX = this.mouse.x;
    this.mouse.prevY = this.mouse.y;

  });
}

Curves.prototype.createFilter = function() {
  this.renderPass = new RenderPass(this.scene, this.camera);
  this.effectComposer = new EffectComposer(this.renderer);
  this.unrealBloomPass = new UnrealBloomPass();
  this.unrealBloomPass.resolution = new THREE.Vector2(this.size.width, this.size.height);
  this.unrealBloomPass.strength = 1.8;
  this.unrealBloomPass.radius = 1.2;
  this.unrealBloomPass.threshold = 0.3;

  this.effectComposer.addPass(this.renderPass);
  this.effectComposer.addPass(this.unrealBloomPass);

  this.renderer.toneMapping = THREE.CineonToneMapping;
  this.renderer.toneMappingExposure = 1;
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
  this.camera.position.z = 17;
};

Curves.prototype.createLines = function () {
  for (let i = 0; i < this.variants.length; i++) {
    const curve = new THREE.CatmullRomCurve3( this.variants[i].points);
    const geometry = new THREE.TubeGeometry(curve, 100, 0.01, 4, false);
    const material = new THREE.ShaderMaterial({ 
      uniforms:{
        uTime: {value: 0},
        uTexture: {value: new THREE.TextureLoader().load(this.variants[i].texture)},
        uSpeed: {value: this.variants[i].speed},
        uAmplitude: {value: this.variants[i].amplitude},
        uFrequency: {value: this.variants[i].frequency},
        uMouse: {value: 1}
      },
      vertexShader: this.vertex(),
      fragmentShader: this.fragment(),
      // wireframe: true,
     });
    const mesh = new THREE.Mesh(geometry, material);
     if(!i) {
      mesh.position.y = -1.5;
      mesh.position.x = -0.5;
    } else if(i === 1) {
      mesh.position.y = -1.7;
    } else {
       mesh.position.y = 0.5;
       mesh.position.x = -2.5;
     }

    this.meshes.push(mesh);
    this.scene.add(mesh);
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

    newPosition.yxz += y;
    vY = y;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.); 
  }
  `;
}

Curves.prototype.fragment = function() {
  return `
  uniform sampler2D uTexture;

  varying float vY;
  varying vec2 vUv;
  
  void main() {
    vec4 texture = texture2D(uTexture, vUv);
    
    gl_FragColor = texture + smoothstep(0., 0.7, vY);
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
      this.effectComposer.render();
    }
  });
};

Curves.prototype.createControls = function () {
  this.controls = new OrbitControls(this.camera, this.canvas);
};

Curves.prototype.animate = function () {
  gsap.ticker.add((time) => {
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].material.uniforms.uTime.value = time;
    }

    this.effectComposer.render();
    this.controls.update();
  });
};

Curves.prototype.createGUI = function() {
  const gui = new GUI();
	const bloomFolder = gui.addFolder( 'Bloom' );
  const toneMappingFolder = gui.addFolder( 'Tone Mapping' );

  bloomFolder
  .add( this.unrealBloomPass, 'threshold', 0.0, 10 )
  .onChange( ( value ) => this.unrealBloomPass.threshold = Number( value ));

  bloomFolder
  .add( this.unrealBloomPass, 'strength', 0.0, 10 )
  .onChange( ( value ) => this.unrealBloomPass.strength = Number( value ));

  bloomFolder
  .add( this.unrealBloomPass, 'radius', 0.0, 10 )
  .onChange( ( value ) => this.unrealBloomPass.radius = Number( value ));

  toneMappingFolder
  .add( this.renderer, 'toneMappingExposure', 0.0, 10 )
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
  this.mouseMove();
  this.animate();
};

new Curves().init();
