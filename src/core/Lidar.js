import * as THREE from 'three';

export class Lidar {
    constructor(scene, droneMesh, obstacleGroup) {
        this.scene = scene;
        this.droneMesh = droneMesh;
        this.obstacleGroup = obstacleGroup;
        this.enabled = false;
        this.raycaster = new THREE.Raycaster();
        
        // Visual aids for the 3 rays (Center, Left, Right)
        this.arrows = [];
        const color = 0xff00ff; // Purple lasers
        for(let i = 0; i < 3; i++) {
            const arrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 0, color, 0.2, 0.2);
            this.scene.add(arrow);
            this.arrows.push(arrow);
        }
    }

    update(yaw) {
        if (!this.enabled) {
            this.arrows.forEach(a => a.setLength(0)); // Hide lasers if disabled
            return false;
        }

        const pos = this.droneMesh.position;
        // Angles: Straight ahead, +30 degrees Left, -30 degrees Right
        const angles = [yaw, yaw + 0.52, yaw - 0.52]; 
        let collisionImminent = false;

        angles.forEach((angle, index) => {
            // Convert yaw angle to a 3D direction vector
            const dir = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize();
            this.raycaster.set(pos, dir);
            
            const intersects = this.raycaster.intersectObject(this.obstacleGroup, true);
            
            if (intersects.length > 0 && intersects[0].distance < 6.0) {
                // Obstacle detected within 6 meters
                this.arrows[index].setLength(intersects[0].distance, 0.2, 0.2);
                this.arrows[index].setColor(0xff0000); // Turn red
                
                if (intersects[0].distance < 1.5) {
                    collisionImminent = true; // khatraa
                }
            } 
            else {
                // Path clear
                this.arrows[index].setLength(6.0, 0.2, 0.2);
                this.arrows[index].setColor(0xff00ff); // Stay purple
            }
            
            this.arrows[index].position.copy(pos);
            this.arrows[index].setDirection(dir);
        });

        return collisionImminent;
    }
}