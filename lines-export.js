import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

function Lines() {
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
    width: this.canvas.getBoundingClientRect().width,
    height: this.canvas.getBoundingClientRect().height,
  };
  this.curve = null;
  this.fov = 75;
  this.variants = [];
  this.animating = false;
}

Lines.prototype.createFilter = function() {
  this.renderPass = new RenderPass(this.scene, this.camera);
  this.effectComposer = new EffectComposer(this.renderer);
  this.unrealBloomPass = new UnrealBloomPass();
  this.unrealBloomPass.resolution = new THREE.Vector2(this.size.width, this.size.height);

  this.unrealBloomPass.threshold = 0.45;
  this.unrealBloomPass.strength = 4.445;
  this.unrealBloomPass.radius = 1.25;

  this.renderer.toneMapping = THREE.ReinhardToneMapping;
  this.renderer.toneMappingExposure = 1;

  this.effectComposer.addPass(this.renderPass);
  this.effectComposer.addPass(this.unrealBloomPass);
}

Lines.prototype.createScene = function () {
  this.scene = new THREE.Scene();
};

Lines.prototype.createCamera = function () {
  this.camera = new THREE.PerspectiveCamera(
    this.fov,
    this.size.width / this.size.height
  );
  this.camera.position.z = 16;
};

Lines.prototype.createLines = function () { 
  const tubularSegments = 100;
  const radius  = 0.01;
  const radialSegments = 3;

  for (let i = 0; i < this.variants.length; i++) {
    
    const curve = new THREE.CatmullRomCurve3(this.variants[i].curve);
    let geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
    geometry = new THREE.BufferGeometry().fromGeometry(geometry);
    //geometry.setDrawRange(0, 0);

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
    });

    const line = new THREE.Mesh(geometry, material);

    this.lines.push(line);
    this.scene.add(line);
  }
};

Lines.prototype.vertex = function() {
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
    vY = y;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.); 
  }
  `;
}

Lines.prototype.fragment = function() {
  return `
  uniform sampler2D uTexture;

  varying float vY;
  varying vec2 vUv;
  
  void main() {
    vec4 texture = texture2D(uTexture, vUv);
    
    gl_FragColor = texture;
  }
  `;
}

Lines.prototype.createRenderer = function () {
  this.renderer = new THREE.WebGLRenderer({
    canvas: this.canvas,
    antialias: true,
    alpha: false,
  });
  this.renderer.setSize(this.size.width, this.size.height);
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  this.renderer.render(this.scene, this.camera);
};

Lines.prototype.resize = function () {
  let ww = window.innerWidth;

  window.addEventListener("resize", () => {
    if (ww !== window.innerWidth) {
      ww = window.innerWidth;

      this.size.width = this.canvas.getBoundingClientRect().width;
      this.size.height = this.canvas.getBoundingClientRect().height;
      this.renderer.setSize(this.size.width, this.size.height);
      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    }
  });
};

Lines.prototype.createControls = function () {
  this.controls = new OrbitControls(this.camera, this.canvas);
};

Lines.prototype.animate = function (cb) {
  cb();
  /*
  gsap.ticker.add((time) => {
    if(!this.animating) return;
    
    for (let i = 0; i < this.lines.length; i++) {
      const material = this.lines[i].material;
      material.uniforms.uTime.value = time;      
    }

    this.effectComposer.render();
  });
*/
};

/*
Lines.prototype.showLines = function() {
  this.draw = {value: 0};

  gsap.to(this.draw, {
    value: this.lines[0].geometry.getAttribute("position").count,
    duration: 3,
    ease: Power1.easeInOut,
    onUpdate: () => this.drawLine(),
  })
}

Lines.prototype.drawLine = function() {
  for (let i = 0; i < this.lines.length; i++) {
    const geometry = this.lines[i].geometry;
    const position = geometry.getAttribute("position");
    const ease = this.draw.value;

    if(ease < position.count) geometry.setDrawRange(0, ease);
    else geometry.setDrawRange(0, position.count);

    position.needsUpdate = true;
  }
}

*/

Lines.prototype.createGUI = function() {
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


Lines.prototype.init = function () {
  if(!this.variants.length) return;

  this.createScene();
  this.createCamera();
  this.createLines();
  this.createRenderer();
  this.createFilter();
  this.createGUI();
  this.resize();
  //this.animate();
  //this.showLines();
};

export {Lines, THREE};
