import * as THREE from 'three';

export class GhostDrone {
    constructor() {
        this.mesh = new THREE.Group();
        this.buildChassis();
        this.buildPropellers();
    }

    buildChassis() {
        const geometry = new THREE.BoxGeometry(1, 1, 0.2);
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.3
        });
        const chassis = new THREE.Mesh(geometry, material);
        this.mesh.add(chassis);
    }

    buildPropellers() {
        const propGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
        propGeom.rotateX(Math.PI / 2);
        const propMat = new THREE.MeshStandardMaterial({
            color: 0x880000,
            transparent: true,
            opacity: 0.3
        });

        const offset = 0.6;
        const positions = [
            [offset, offset, 0.15],
            [-offset, offset, 0.15],
            [offset, -offset, 0.15],
            [-offset, -offset, 0.15]
        ];

        positions.forEach(pos => {
            const prop = new THREE.Mesh(propGeom, propMat);
            prop.position.set(pos[0], pos[1], pos[2]);
            this.mesh.add(prop);
        });
    }

    update(targetZ, targetRoll, targetPitch, targetYaw) {
        this.mesh.position.set(0, 0, targetZ);
        this.mesh.rotation.set(targetRoll, targetPitch, targetYaw, 'ZYX');
    }
}