export class PIDController {
    constructor(kp, ki, kd, minOut, maxOut) {
        this.kp = kp;
        this.ki = ki;
        this.kd = kd;
        this.minOut = minOut;
        this.maxOut = maxOut;
        this.integral = 0;
        this.previousError = 0;
    }

    update(setpoint, measuredValue, dt) {
        if (dt <= 0) return 0;

        const error = setpoint - measuredValue;
        
        const proportional = this.kp * error;

        this.integral += error * dt;

        let integralTerm = this.ki * this.integral;
        
        if (integralTerm > this.maxOut) {
            this.integral = this.maxOut / this.ki;
            integralTerm = this.maxOut;
        } else if (integralTerm < this.minOut) {
            this.integral = this.minOut / this.ki;
            integralTerm = this.minOut;
        }

        const derivative = (error - this.previousError) / dt;
        const derivativeTerm = this.kd * derivative;

        this.previousError = error;

        let output = proportional + integralTerm + derivativeTerm;

        if (output > this.maxOut) {
            output = this.maxOut;
        } else if (output < this.minOut) {
            output = this.minOut;
        }

        return output;
    }
}