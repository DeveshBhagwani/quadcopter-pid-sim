import * as THREE from 'three';

export class WaypointVisualizer {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        this.geometry = new THREE.SphereGeometry(0.3, 8, 8);
        this.meshes = [];
    }

    update(waypoints) {
        this.meshes.forEach(m => this.group.remove(m));
        this.meshes = [];

        waypoints.forEach((wp) => {
            const mesh = new THREE.Mesh(this.geometry, this.material);
            mesh.position.set(wp.x, wp.y, wp.z);
            this.group.add(mesh);
            this.meshes.push(mesh);
        });
    }
}