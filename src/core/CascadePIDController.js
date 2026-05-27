import { PIDController } from './PIDController.js';

export class CascadePIDController {
    constructor(outerKp, outerKi, outerKd, outerMin, outerMax, innerKp, innerKi, innerKd, innerMin, innerMax) {
        this.outerPID = new PIDController(outerKp, outerKi, outerKd, outerMin, outerMax);
        this.innerPID = new PIDController(innerKp, innerKi, innerKd, innerMin, innerMax);
    }

    update(targetPosition, measuredPosition, measuredRate, dt) {
        // Outer loop gives us the target rate (e.g. target velocity or angular velocity)
        const targetRate = this.outerPID.update(targetPosition, measuredPosition, dt);
        
        // Inner loop gives us the final output (e.g. thrust or motor torque)
        const output = this.innerPID.update(targetRate, measuredRate, dt);
        
        return output;
    }
}
