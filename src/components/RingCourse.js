import * as THREE from 'three';

export class RingCourse {
    constructor(scene) {
        this.scene = scene;
        this.rings = []; // Array of { mesh, x, y, z, radius }
        this.activeRingIndex = 0;
        
        // Torus geometry: radius, tube radius, radial segments, tubular segments
        this.geometry = new THREE.TorusGeometry(1.5, 0.1, 8, 24);
        
        this.activeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Neon Green
        this.inactiveMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x004400, 
            transparent: true, 
            opacity: 0.5 
        });
    }

    spawnCourse() {
        this.clear();
        
        // Generate a sequence of rings
        // For simplicity, a fixed fun path
        const path = [
            { x: 0, y: 5, z: 5 },
            { x: 5, y: 10, z: 7 },
            { x: 10, y: 5, z: 5 },
            { x: 5, y: 0, z: 3 },
            { x: 0, y: -5, z: 6 }
        ];

        path.forEach((pos, index) => {
            const material = index === 0 ? this.activeMaterial : this.inactiveMaterial;
            const mesh = new THREE.Mesh(this.geometry, material);
            
            mesh.position.set(pos.x, pos.y, pos.z);
            
            // Point the ring towards the next one, or leave it flat?
            // A simple lookAt the next ring makes it feel like a real track
            if (index < path.length - 1) {
                mesh.lookAt(new THREE.Vector3(path[index+1].x, path[index+1].y, path[index+1].z));
            } else {
                // Final ring points to origin
                mesh.lookAt(new THREE.Vector3(0, 0, pos.z));
            }

            this.scene.add(mesh);
            this.rings.push({
                mesh: mesh,
                x: pos.x,
                y: pos.y,
                z: pos.z,
                radius: 1.5
            });
        });

        this.activeRingIndex = 0;
    }

    clear() {
        this.rings.forEach(r => this.scene.remove(r.mesh));
        this.rings = [];
        this.activeRingIndex = 0;
    }

    updateActiveRing(index) {
        this.activeRingIndex = index;
        this.rings.forEach((ring, i) => {
            if (i === this.activeRingIndex) {
                ring.mesh.material = this.activeMaterial;
            } else if (i < this.activeRingIndex) {
                ring.mesh.material = new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.1 }); // Passed rings fade out
            } else {
                ring.mesh.material = this.inactiveMaterial;
            }
        });
    }

    getActiveRing() {
        if (this.activeRingIndex < this.rings.length) {
            return this.rings[this.activeRingIndex];
        }
        return null; // Course finished
    }
}
