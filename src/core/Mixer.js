export class Mixer {
    constructor(minThrust, maxThrust) {
        this.minThrust = minThrust;
        this.maxThrust = maxThrust;
    }

    mix(thrust, rollCmd, pitchCmd, yawCmd) {
        let m1 = thrust + rollCmd - pitchCmd + yawCmd;
        let m2 = thrust - rollCmd - pitchCmd - yawCmd;
        let m3 = thrust - rollCmd + pitchCmd + yawCmd;
        let m4 = thrust + rollCmd + pitchCmd - yawCmd;

        return [
            this.constrain(m1),
            this.constrain(m2),
            this.constrain(m3),
            this.constrain(m4)
        ];
    }

    constrain(val) {
        return Math.max(this.minThrust, Math.min(this.maxThrust, val));
    }
}