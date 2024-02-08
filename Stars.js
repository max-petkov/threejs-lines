import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

gsap.registerPlugin(Observer);

function Curves() {
  this.canvas = document.querySelector("canvas");
  this.scene = null;
  this.camera = null;
  this.geometry = null;
  this.material = null;
  this.lines = null;
  this.position = null;
  this.renderer = null;
  this.renderPass = null;
  this.effectComposer = null;
  this.unrealBloomPass = null
  this.controls = null;
  this.size = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  this.fov = 60;
  this.n = 8000;
  this.velocity = 0;
  this.acceleration = 0;
  this.deltaY = 1;
}

Curves.prototype.scroll = function() {
  Observer.create({
    target: window,
    type: "wheel",
    wheelSpeed: 1,
    onChangeY: (self) => {
      this.acceleration = Math.abs(self.deltaY * 0.001);
      if(Math.abs(self.deltaY) >= 100) this.deltaY = Math.abs(self.deltaY) / 100;
      else this.deltaY = Math.abs(self.deltaY);
    }
  });
}

Curves.prototype.createFilter = function() {
  this.renderPass = new RenderPass(this.scene, this.camera);
  this.effectComposer = new EffectComposer(this.renderer);
  this.unrealBloomPass = new UnrealBloomPass();
  this.unrealBloomPass.resolution = new THREE.Vector2(this.size.width, this.size.height);
  this.unrealBloomPass.threshold = 0;
  this.unrealBloomPass.strength = 0.82;
  this.unrealBloomPass.radius = 0.205;

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
  this.camera = new THREE.PerspectiveCamera(this.fov, this.size.width / this.size.height, 1, 1000);
  this.camera.position.z = Math.PI / 2;
  this.camera.position.x = Math.PI / 2;
  this.camera.position.y = Math.PI / 2;
};

Curves.prototype.createStars = function () { 
  this.geometry = new THREE.BufferGeometry();
  this.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6 * this.n), 3));
  this.geometry.setAttribute("velocity", new THREE.BufferAttribute(new Float32Array(2 * this.n), 1));
  this.geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(6 * this.n), 3));

  this.position = this.geometry.getAttribute("position");
  this.velocity = this.geometry.getAttribute("velocity");
  this.color = this.geometry.getAttribute("color");

  for (let i = 0; i < this.n; i++) {
    const x = Math.random() * 600 - 300;
    const y = Math.random() * 600 - 300;
    const z = Math.random() * 600 - 300;

    // Line Start
    this.position.array[6 * i] = x;
    this.position.array[6 * i + 1] = y;
    this.position.array[6 * i + 2] = z;

    // Line End
    this.position.array[6 * i + 3] = x + 0.1;
    this.position.array[6 * i + 4] = y + 0.1;
    this.position.array[6 * i + 5] = z + 0.1;

    // Velocity
    this.velocity.array[2 * i] = 0;

    // Color
    this.color.array[6 * i] = 0;
    this.color.array[6 * i + 1] = 0;
    this.color.array[6 * i + 2] = 0;
    this.color.array[6 * i + 3] = 1;
    this.color.array[6 * i + 4] = 1;
    this.color.array[6 * i + 5] = 1;
  }

  this.material = new THREE.LineBasicMaterial({ vertexColors: true });
  this.lines = new THREE.LineSegments(this.geometry, this.material);
  this.scene.add(this.lines);
};


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
      // this.renderer.render(this.scene, this.camera);
    }
  });
};

Curves.prototype.createControls = function () {
  this.controls = new OrbitControls(this.camera, this.canvas);
};

Curves.prototype.animate = function () {
  gsap.ticker.add((time) => {
    for (let i = 0; i < this.n; i++) {
      if(this.deltaY <= 1) {
        if(this.position.array[6 * i] < this.position.array[6 * i + 3]) {
          this.position.array[6 * i] += 2;
        } else {
          this.position.array[6 * i]  = this.position.array[6 * i + 3] + 0.1;
        }

        if(this.position.array[6 * i + 1] < this.position.array[6 * i + 4]) {
          this.position.array[6 * i + 1] += 2;
        }else {
          this.position.array[6 * i + 1]  = this.position.array[6 * i + 4]  + 0.1;
        }

        if(this.position.array[6 * i + 2] < this.position.array[6 * i + 5]) {
          this.position.array[6 * i + 2] += 2;
        }else {
          this.position.array[6 * i + 2]  = this.position.array[6 * i + 5] + 0.1;
        }
       
      } else {
        this.velocity.array[2 * i] += this.acceleration;

        if(this.position.array[6 * i + 4] > 1) {
          if(this.position.array[6 * i] < this.position.array[6 * i + 3]) {
            this.position.array[6 * i] += this.velocity.array[2*i];
          } else {         
            const x = Math.random() * 600 - 300;
            this.position.array[6 * i] = x;
            this.position.array[6 * i + 3] = x + 0.01;
            this.velocity.array[2 * i] = 0;
          }
  
          if(this.position.array[6 * i + 1] < this.position.array[6 * i + 4]) {
            this.position.array[6 * i + 1] += this.velocity.array[2*i];
          } else {
            const y = Math.random() * 600 - 300;
            this.position.array[6 * i + 1] = y;
            this.position.array[6 * i + 4] = y + 0.01;
            this.velocity.array[2 * i] = 0;
          }
  
          if(this.position.array[6 * i + 2] < this.position.array[6 * i + 5]) {
            this.position.array[6 * i + 2] += this.velocity.array[2*i];
          } else {
            const z = Math.random() * 600 - 300;
            this.position.array[6 * i + 2] = z;
            this.position.array[6 * i + 5] = z + 0.01;
            this.velocity.array[2 * i] = 0;
          }
          
        } else {
          this.position.array[6 * i + 3] += this.velocity.array[2 * i];
          this.position.array[6 * i + 4] += this.velocity.array[2 * i];
          this.position.array[6 * i + 5] += this.velocity.array[2 * i];
        }
      }

     
    }

    this.position.needsUpdate = true;
    
    this.effectComposer.render();
    // this.renderer.render(this.scene, this.camera);
    this.controls.update();
  });
};

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

Curves.prototype.lerp = function(x, y, a) {
    return x * (1 - a) + y * a;
}

Curves.prototype.init = function () {
  this.createScene();
  this.createCamera();
  this.createStars();
  this.createRenderer();
  this.createFilter();
  this.createControls();
  this.createGUI();
  this.resize();
  this.animate();
  this.scroll();
};

new Curves().init();
