export class StateEstimator {
    constructor(alpha = 0.2) {
        this.alpha = alpha;
        this.state = { z: 0, roll: 0, pitch: 0, yaw: 0 };
        this.initialized = false;
    }

    update(noisyZ, noisyRoll, noisyPitch, noisyYaw) {
        if (!this.initialized) {
            this.state.z = noisyZ;
            this.state.roll = noisyRoll;
            this.state.pitch = noisyPitch;
            this.state.yaw = noisyYaw;
            this.initialized = true;
            return this.state;
        }

        this.state.z = this.alpha * noisyZ + (1 - this.alpha) * this.state.z;
        this.state.roll = this.alpha * noisyRoll + (1 - this.alpha) * this.state.roll;
        this.state.pitch = this.alpha * noisyPitch + (1 - this.alpha) * this.state.pitch;
        this.state.yaw = this.alpha * noisyYaw + (1 - this.alpha) * this.state.yaw;

        return this.state;
    }
}