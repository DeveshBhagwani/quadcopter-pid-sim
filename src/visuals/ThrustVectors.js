import * as THREE from 'three';

export class ThrustVectors {
    constructor(droneMesh, maxThrust) {
        this.arrows = [];
        this.maxThrust = maxThrust;
        
        const dir = new THREE.Vector3(0, 0, -1);
        const color = 0x00ff00;

        const offset = 0.6;
        const positions = [
            new THREE.Vector3(offset, offset, 0.15),
            new THREE.Vector3(-offset, offset, 0.15),
            new THREE.Vector3(offset, -offset, 0.15),
            new THREE.Vector3(-offset, -offset, 0.15)
        ];

        positions.forEach(pos => {
            const arrow = new THREE.ArrowHelper(dir, pos, 0.1, color, 0.1, 0.1);
            droneMesh.add(arrow);
            this.arrows.push(arrow);
        });
    }

    update(motorForces) {
        for (let i = 0; i < 4; i++) {
            const thrust = Math.max(0.01, motorForces[i]);
            this.arrows[i].setLength(thrust * 0.2, 0.1, 0.1);
            
            if (thrust >= this.maxThrust * 0.98) {
                this.arrows[i].setColor(0xff0000);
            } else {
                this.arrows[i].setColor(0x00ff00);
            }
        }
    }
}