export class StateEstimator {
    constructor(alpha = 0.98) {
        this.alpha = alpha;
        this.state = { z: 0, vz: 0, roll: 0, pitch: 0, yaw: 0, p: 0, q: 0, r: 0 };
        this.initialized = false;
    }

    update(dt, noisyZ, noisyVz, noisyRoll, noisyPitch, noisyYaw, noisyP, noisyQ, noisyR) {
        if (!this.initialized || dt <= 0) {
            this.state.z = noisyZ;
            this.state.vz = noisyVz;
            this.state.roll = noisyRoll;
            this.state.pitch = noisyPitch;
            this.state.yaw = noisyYaw;
            this.state.p = noisyP;
            this.state.q = noisyQ;
            this.state.r = noisyR;
            this.initialized = true;
            return this.state;
        }

        // Complementary Filter: Fuse Gyro (integration) with Accelerometer/Magnetometer (absolute)
        this.state.roll = this.alpha * (this.state.roll + noisyP * dt) + (1 - this.alpha) * noisyRoll;
        this.state.pitch = this.alpha * (this.state.pitch + noisyQ * dt) + (1 - this.alpha) * noisyPitch;
        this.state.yaw = this.alpha * (this.state.yaw + noisyR * dt) + (1 - this.alpha) * noisyYaw;

        // Complementary Filter for Altitude (Z)
        this.state.z = this.alpha * (this.state.z + this.state.vz * dt) + (1 - this.alpha) * noisyZ;

        // Simple EMA for velocities (since we don't have secondary sensors for them here)
        const rateAlpha = 0.8;
        this.state.vz = rateAlpha * this.state.vz + (1 - rateAlpha) * noisyVz;
        this.state.p = rateAlpha * this.state.p + (1 - rateAlpha) * noisyP;
        this.state.q = rateAlpha * this.state.q + (1 - rateAlpha) * noisyQ;
        this.state.r = rateAlpha * this.state.r + (1 - rateAlpha) * noisyR;

        return this.state;
    }
}