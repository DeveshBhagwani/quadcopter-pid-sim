import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PhysicsEngine } from './core/PhysicsEngine.js';
import { StateEstimator } from './core/StateEstimator.js';
import { Drone } from './components/Drone.js';
import { PIDController } from './core/PIDController.js';
import { Mixer } from './core/Mixer.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { TelemetryDashboard } from './ui/TelemetryDashboard.js';
import { GhostDrone } from './visuals/GhostDrone.js';
import { ThrustVectors } from './visuals/ThrustVectors.js';
import { AutoTuner } from './utils/AutoTuner.js';
import { Navigator } from './core/Navigator.js';
import { WaypointVisualizer } from './visuals/WaypointVisualizer.js';
import { TrailRenderer } from './visuals/TrailRenderer.js';

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

class Simulator {
    constructor() {
        this.container = document.getElementById('app');
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x202020);
        this.scene.fog = new THREE.FogExp2(0x202020, 0.02);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(5, -5, 5);
        this.camera.up.set(0, 0, 1);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.setupEnvironment();

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.physics = new PhysicsEngine();
        this.estimator = new StateEstimator(0.2);
        this.sensorNoise = 0.0;
        
        this.drone = new Drone();
        this.scene.add(this.drone.mesh);

        this.ghostDrone = new GhostDrone();
        this.scene.add(this.ghostDrone.mesh);

        this.mixer = new Mixer(0, 10);
        this.thrustVectors = new ThrustVectors(this.drone.mesh, this.mixer.maxThrust);

        this.navigator = new Navigator();
        this.waypointVis = new WaypointVisualizer(this.scene);

        this.trailRenderer = new TrailRenderer(this.scene);
        this.cameraMode = 'Orbit';

        this.targets = { z: 5.0, roll: 0, pitch: 0, yaw: 0 };
        
        this.pid = {
            alt: new PIDController(15.0, 2.0, 10.0, 0, 30),
            roll: new PIDController(2.0, 0.0, 1.5, -5, 5),
            pitch: new PIDController(2.0, 0.0, 1.5, -5, 5),
            yaw: new PIDController(4.0, 0.0, 2.0, -5, 5)
        };

        this.autoTuner = new AutoTuner(this);
        this.controlPanel = new ControlPanel(this);
        this.telemetry = new TelemetryDashboard();

        this.clock = new THREE.Clock();
        this.elapsedTime = 0;
        this.telemetryTimer = 0;

        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.animate();
    }

    setupEnvironment() {
        const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
        gridHelper.rotation.x = Math.PI / 2;
        this.scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(2);
        this.scene.add(axesHelper);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 20);
        this.scene.add(directionalLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const dt = Math.min(this.clock.getDelta(), 0.1);
        this.elapsedTime += dt;

        this.autoTuner.update(dt);
        this.physics.update(dt);

        const rawSensors = this.physics.readSensors(this.sensorNoise);
        const estimatedState = this.estimator.update(rawSensors.z, rawSensors.roll, rawSensors.pitch, rawSensors.yaw);

        const navCmd = this.navigator.update(this.physics.position, estimatedState?.yaw || this.physics.rotation.z);
        if (navCmd) {
            this.targets.z = navCmd.z;
            this.targets.roll = navCmd.roll;
            this.targets.pitch = navCmd.pitch;
        }

        const thrustCmd = this.pid.alt.update(this.targets.z, estimatedState.z, dt);
        const rollCmd = this.pid.roll.update(this.targets.roll, estimatedState.roll, dt);
        const pitchCmd = this.pid.pitch.update(this.targets.pitch, estimatedState.pitch, dt);
        const yawCmd = this.pid.yaw.update(this.targets.yaw, estimatedState.yaw, dt);
        
        const motorForces = this.mixer.mix(thrustCmd / 4, rollCmd, pitchCmd, yawCmd);

        this.physics.applyMotorForces(motorForces[0], motorForces[1], motorForces[2], motorForces[3]);
        
        this.drone.updateState(this.physics.position, this.physics.rotation);
        this.drone.animatePropellers(motorForces, dt);

        this.ghostDrone.update(this.targets.z, this.targets.roll, this.targets.pitch, this.targets.yaw);
        this.thrustVectors.update(motorForces);

        this.trailRenderer.update(this.physics.position);

        // --- Camera Logic ---
        if (this.cameraMode === 'FPV') {
            this.controls.enabled = false;
            
            // Snap camera to drone chassis
            this.camera.position.copy(this.drone.mesh.position);
            this.camera.quaternion.copy(this.drone.mesh.quaternion);
            
            // Offset slightly forward (+X) and upward (+Z) in local space
            this.camera.translateZ(-0.2); // Move "forward" in Three.js native camera space
            this.camera.translateY(0.2);  // Move "up"
            
            // Reorient camera to look forward along the drone's heading
            this.camera.rotateX(Math.PI / 2);
            this.camera.rotateY(-Math.PI / 2);
        } else {
            this.controls.enabled = true;
            this.controls.target.copy(this.physics.position);
        }

        this.telemetryTimer += dt;
        if (this.telemetryTimer > 0.05) {
            this.telemetry.update(this.elapsedTime, estimatedState.z, this.targets.z, rawSensors.z);
            this.telemetryTimer = 0;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

const sim = new Simulator();