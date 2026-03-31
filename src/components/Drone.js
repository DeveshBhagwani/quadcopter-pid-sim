import * as THREE from 'three';

export class Drone {
    constructor() {
        this.mesh = new THREE.Group();
        this.buildChassis();
        this.buildPropellers();
    }

    buildChassis() {
        const geometry = new THREE.BoxGeometry(1, 1, 0.2);
        const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const chassis = new THREE.Mesh(geometry, material);
        this.mesh.add(chassis);
    }

    buildPropellers() {
        const propGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
        propGeom.rotateX(Math.PI / 2);
        const propMat = new THREE.MeshStandardMaterial({ color: 0xaa0000 });
        
        const offset = 0.6;
        const positions = [
            [offset, offset, 0.15],
            [-offset, offset, 0.15],
            [offset, -offset, 0.15],
            [-offset, -offset, 0.15]
        ];

        this.props = [];
        positions.forEach(pos => {
            const prop = new THREE.Mesh(propGeom, propMat);
            prop.position.set(pos[0], pos[1], pos[2]);
            this.mesh.add(prop);
            this.props.push(prop);
        });
    }

    updateState(pos, rot) {
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.rotation.set(rot.x, rot.y, rot.z, 'ZYX');
    }

    animatePropellers(motorSpeeds, dt) {
        for (let i = 0; i < 4; i++) {
            const speed = motorSpeeds[i] * 10; 
            this.props[i].rotation.z += speed * dt;
        }
    }
}