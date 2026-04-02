export class Navigator {
    constructor() {
        this.waypoints = [];
        this.active = false;
        this.currentIndex = 0;
        this.kpPos = 0.15; // Gain translating distance error to tilt angle
        this.maxAngle = 0.5; // Cap tilt to ~30 degrees to prevent flipping
    }

    addWaypoint(x, y, z) {
        this.waypoints.push({ x, y, z });
    }

    clear() {
        this.waypoints = [];
        this.active = false;
        this.currentIndex = 0;
    }

    start() {
        if (this.waypoints.length > 0) this.active = true;
    }

    update(currentPos, currentYaw) {
        if (!this.active || this.currentIndex >= this.waypoints.length) return null;

        const target = this.waypoints[this.currentIndex];
        const dx = target.x - currentPos.x;
        const dy = target.y - currentPos.y;
        
        const distance = Math.sqrt(dx*dx + dy*dy + Math.pow(target.z - currentPos.z, 2));

        // If within 0.5m of the waypoint, pop to the next one
        if (distance < 0.5) {
            this.currentIndex++;
            if (this.currentIndex >= this.waypoints.length) {
                this.active = false;
                return { z: target.z, roll: 0, pitch: 0 }; // Level out
            }
        }

        // Rotate world-frame errors into the drone's body-frame
        const cy = Math.cos(currentYaw);
        const sy = Math.sin(currentYaw);
        const errXBody = dx * cy + dy * sy; 
        const errYBody = -dx * sy + dy * cy;

        // Positive pitch moves +X, Negative roll moves +Y in our physics model
        let pitchCmd = errXBody * this.kpPos;
        let rollCmd = -errYBody * this.kpPos;

        pitchCmd = Math.max(-this.maxAngle, Math.min(this.maxAngle, pitchCmd));
        rollCmd = Math.max(-this.maxAngle, Math.min(this.maxAngle, rollCmd));

        return { z: target.z, roll: rollCmd, pitch: pitchCmd };
    }
}