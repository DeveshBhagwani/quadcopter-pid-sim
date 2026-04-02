import * as THREE from 'three';

export class TrailRenderer {
    constructor(scene, maxPoints = 300) {
        this.maxPoints = maxPoints;
        this.positions = [];
        this.geometry = new THREE.BufferGeometry();
        
        const material = new THREE.LineBasicMaterial({ 
            color: 0xffaa00, 
            linewidth: 2,
            transparent: true,
            opacity: 0.6
        });
        
        this.line = new THREE.Line(this.geometry, material);
        scene.add(this.line);
    }

    update(currentPos) {
        // Only record a point if the drone has moved a bit to save memory
        const lastPos = this.positions[this.positions.length - 1];
        if (!lastPos || lastPos.distanceTo(currentPos) > 0.1) {
            this.positions.push(new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z));
            
            if (this.positions.length > this.maxPoints) {
                this.positions.shift();
            }
            
            this.geometry.setFromPoints(this.positions);
        }
    }
}