export class PhysicsEngine {
    constructor() {
        this.mass = 1.0;
        this.gravity = -9.81;
        this.inertia = { x: 0.05, y: 0.05, z: 0.1 };
        this.armLength = 0.25;
        this.thrustToTorque = 0.05;

        this.position = { x: 0, y: 0, z: 10 };
        this.velocity = { x: 0, y: 0, z: 0 };
        
        this.rotation = { x: 0, y: 0, z: 0 };
        this.angularVelocity = { x: 0, y: 0, z: 0 };

        this.netForce = { x: 0, y: 0, z: 0 };
        this.netTorque = { x: 0, y: 0, z: 0 };
    }

    applyMotorForces(m1, m2, m3, m4) {
        const totalThrust = m1 + m2 + m3 + m4;

        const tx = (m1 + m4 - m2 - m3) * this.armLength;
        const ty = (m3 + m4 - m1 - m2) * this.armLength;
        const tz = (m1 + m3 - m2 - m4) * this.thrustToTorque;

        this.netTorque.x += tx;
        this.netTorque.y += ty;
        this.netTorque.z += tz;

        const cp = Math.cos(this.rotation.y);
        const sp = Math.sin(this.rotation.y);
        const cr = Math.cos(this.rotation.x);
        const sr = Math.sin(this.rotation.x);
        const cy = Math.cos(this.rotation.z);
        const sy = Math.sin(this.rotation.z);

        this.netForce.x += totalThrust * (sr * sy + cr * cp * sp);
        this.netForce.y += totalThrust * (cr * sy * sp - cy * sr);
        this.netForce.z += totalThrust * (cr * cp);
    }

    applyDisturbance(fx, fy, fz, tx, ty, tz) {
        this.netForce.x += fx;
        this.netForce.y += fy;
        this.netForce.z += fz;
        this.netTorque.x += tx;
        this.netTorque.y += ty;
        this.netTorque.z += tz;
    }

    update(dt) {
        if (dt <= 0) return;

        this.netForce.z += (this.mass * this.gravity);

        this.velocity.x += (this.netForce.x / this.mass) * dt;
        this.velocity.y += (this.netForce.y / this.mass) * dt;
        this.velocity.z += (this.netForce.z / this.mass) * dt;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.position.z += this.velocity.z * dt;

        this.angularVelocity.x += (this.netTorque.x / this.inertia.x) * dt;
        this.angularVelocity.y += (this.netTorque.y / this.inertia.y) * dt;
        this.angularVelocity.z += (this.netTorque.z / this.inertia.z) * dt;

        this.rotation.x += this.angularVelocity.x * dt;
        this.rotation.y += this.angularVelocity.y * dt;
        this.rotation.z += this.angularVelocity.z * dt;

        if (this.position.z <= 0.2) {
            this.position.z = 0.2;
            this.velocity.x *= 0.8;
            this.velocity.y *= 0.8;
            this.velocity.z = 0;
            this.rotation.x *= 0.8;
            this.rotation.y *= 0.8;
            this.angularVelocity.x = 0;
            this.angularVelocity.y = 0;
        }

        this.netForce.x = 0;
        this.netForce.y = 0;
        this.netForce.z = 0;
        this.netTorque.x = 0;
        this.netTorque.y = 0;
        this.netTorque.z = 0;
    }
}