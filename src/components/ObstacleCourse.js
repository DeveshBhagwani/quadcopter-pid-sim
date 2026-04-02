import * as THREE from 'three';


export class ObstacleCourse {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.material = new THREE.MeshStandardMaterial({ color: 0x555555 });
        this.geometry = new THREE.BoxGeometry(1, 1, 15);
    }

    spawn() {
        while(this.group.children.length > 0) { 
            this.group.remove(this.group.children[0]); 
        }
        
        for (let i = 0; i < 15; i++) {
            const mesh = new THREE.Mesh(this.geometry, this.material);
            const x = (Math.random() - 0.5) * 35;
            const y = (Math.random() - 0.5) * 35;
            
            // Keep the center (0,0) clear so the drone doesn't spawn inside a wall
            if (Math.abs(x) < 4 && Math.abs(y) < 4) continue;
            
            mesh.position.set(x, y, 7.5);
            this.group.add(mesh);
        }
    }
}