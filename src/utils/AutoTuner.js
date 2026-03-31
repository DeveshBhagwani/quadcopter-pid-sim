export class AutoTuner {
    constructor(sim) {
        this.sim = sim;
        this.active = false;
        this.phase = 0;
        this.ku = 0;
        this.tu = 0.85; 
        this.timer = 0;
    }

    start() {
        this.active = true;
        this.phase = 0;
        this.timer = 0;
        
        this.sim.pid.alt.kp = 5.0;
        this.sim.pid.alt.ki = 0.0;
        this.sim.pid.alt.kd = 0.0;
        
        this.sim.targets.z = 8.0;
        this.sim.physics.position.z = 0.2;
        this.sim.physics.velocity.z = 0;
    }

    update(dt) {
        if (!this.active) return;
        
        this.timer += dt;

        if (this.phase === 0) {
            if (this.timer > 1.5) {
                this.sim.pid.alt.kp += 6.0;
                this.timer = 0;
                
                if (this.sim.pid.alt.kp >= 35.0) {
                    this.ku = this.sim.pid.alt.kp;
                    this.phase = 1;
                }
            }
        } else if (this.phase === 1) {
            this.sim.pid.alt.kp = 0.6 * this.ku;
            this.sim.pid.alt.ki = (1.2 * this.ku) / this.tu;
            this.sim.pid.alt.kd = (0.075 * this.ku) * this.tu;
            this.active = false;
        }
    }
}