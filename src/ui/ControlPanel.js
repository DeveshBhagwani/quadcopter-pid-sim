import GUI from 'lil-gui';
import { CppExporter } from '../utils/CppExporter.js';

export class ControlPanel {
    constructor(sim) {
        this.gui = new GUI({ title: 'Quadcopter Tuning' });
        this.sim = sim;
        this.build();
    }

    build() {
        const altFolder = this.gui.addFolder('Altitude PID (Z)');
        altFolder.add(this.sim.pid.alt, 'kp', 0, 50, 0.1).name('Kp').listen();
        altFolder.add(this.sim.pid.alt, 'ki', 0, 50, 0.1).name('Ki').listen();
        altFolder.add(this.sim.pid.alt, 'kd', 0, 50, 0.1).name('Kd').listen();
        
        const attFolder = this.gui.addFolder('Attitude PID (Roll/Pitch)');
        attFolder.add(this.sim.pid.roll, 'kp', 0, 10, 0.01).name('Kp (R/P)');
        attFolder.add(this.sim.pid.roll, 'ki', 0, 5, 0.01).name('Ki (R/P)');
        attFolder.add(this.sim.pid.roll, 'kd', 0, 10, 0.01).name('Kd (R/P)').onChange(v => {
            this.sim.pid.pitch.kp = this.sim.pid.roll.kp;
            this.sim.pid.pitch.ki = this.sim.pid.roll.ki;
            this.sim.pid.pitch.kd = v;
        });

        const yawFolder = this.gui.addFolder('Yaw PID');
        yawFolder.add(this.sim.pid.yaw, 'kp', 0, 20, 0.1).name('Kp');
        yawFolder.add(this.sim.pid.yaw, 'kd', 0, 20, 0.1).name('Kd');

        const flightFolder = this.gui.addFolder('Flight Targets');
        flightFolder.add(this.sim.targets, 'z', 0, 15, 0.5).name('Target Z (m)').listen();
        flightFolder.add(this.sim.targets, 'roll', -1, 1, 0.1).name('Target Roll');
        flightFolder.add(this.sim.targets, 'pitch', -1, 1, 0.1).name('Target Pitch');

        const envFolder = this.gui.addFolder('Environment & Physics');
        envFolder.add(this.sim.physics, 'mass', 0.5, 3.0, 0.1).name('Drone Mass (kg)');
        envFolder.add(this.sim, 'sensorNoise', 0, 1.0, 0.01).name('Sensor Noise Lvl');
        envFolder.add(this.sim.estimator, 'alpha', 0.01, 1.0, 0.01).name('Filter Alpha');
        
        const actions = {
            triggerGust: () => {
                const fx = (Math.random() - 0.5) * 40;
                const fy = (Math.random() - 0.5) * 40;
                const fz = (Math.random() - 0.5) * 20;
                const tx = (Math.random() - 0.5) * 5;
                const ty = (Math.random() - 0.5) * 5;
                const tz = (Math.random() - 0.5) * 2;
                this.sim.physics.applyDisturbance(fx, fy, fz, tx, ty, tz);
            },
            autoTuneZ: () => {
                this.sim.autoTuner.start();
            },
            exportCpp: () => {
                CppExporter.export(this.sim.pid);
            },
            addWaypoint: () => {
                const x = (Math.random() - 0.5) * 20;
                const y = (Math.random() - 0.5) * 20;
                const z = Math.random() * 8 + 2;
                this.sim.navigator.addWaypoint(x, y, z);
                this.sim.waypointVis.update(this.sim.navigator.waypoints);
            },
            startMission: () => {
                this.sim.navigator.start();
            },
            clearMission: () => {
                this.sim.navigator.clear();
                this.sim.waypointVis.update([]);
            },
            toggleCamera: () => {
                this.sim.cameraMode = this.sim.cameraMode === 'Orbit' ? 'FPV' : 'Orbit';
                
                if (this.sim.cameraMode === 'Orbit') {
                    this.sim.camera.position.set(
                        this.sim.physics.position.x + 5, 
                        this.sim.physics.position.y - 5, 
                        this.sim.physics.position.z + 5
                    );
                    this.sim.camera.up.set(0, 0, 1);
                }
            },
            spawnObstacles: () => {
                this.sim.obstacles.spawn();
            }
        };
        
        envFolder.add(actions, 'triggerGust').name('Apply Wind Gust');
        
        const toolsFolder = this.gui.addFolder('Engineering Tools');
        toolsFolder.add(actions, 'autoTuneZ').name('Auto-Tune Alt (Z-N)');
        toolsFolder.add(actions, 'exportCpp').name('Export C++ Header');

        const navFolder = this.gui.addFolder('Autonomous Navigation');
        navFolder.add(actions, 'addWaypoint').name('Add Random Waypoint');
        navFolder.add(actions, 'startMission').name('Start Mission');
        navFolder.add(actions, 'clearMission').name('Clear Mission');
        navFolder.add(actions, 'spawnObstacles').name('Spawn Obstacles');
        navFolder.add(this.sim.lidar, 'enabled').name('Enable LiDAR Assist');

        const visualsFolder = this.gui.addFolder('Visuals & Camera');
        visualsFolder.add(actions, 'toggleCamera').name('Toggle FPV / Orbit');
    }
}