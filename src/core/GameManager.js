import { Leaderboard } from '../ui/Leaderboard.js';

export class GameManager {
    constructor(ringCourse) {
        this.ringCourse = ringCourse;
        this.leaderboard = new Leaderboard();
        
        this.state = 'idle'; // idle, racing, finished
        this.startTime = 0;
        this.elapsedTime = 0;
        
        // HUD Elements
        this.hudContainer = document.getElementById('hud-container');
        this.timerEl = document.getElementById('race-timer');
        this.ringCounterEl = document.getElementById('ring-counter');
    }

    startRace() {
        this.ringCourse.spawnCourse();
        this.state = 'racing';
        this.startTime = performance.now();
        this.elapsedTime = 0;
        
        if (this.hudContainer) {
            this.hudContainer.style.display = 'block';
        }
        this.updateHUD();
        this.leaderboard.hide();
    }

    stopRace() {
        this.state = 'idle';
        this.ringCourse.clear();
        if (this.hudContainer) {
            this.hudContainer.style.display = 'none';
        }
    }

    finishRace() {
        this.state = 'finished';
        this.leaderboard.addTime(this.elapsedTime);
        this.leaderboard.show();
        
        // Hide HUD after 3 seconds
        setTimeout(() => {
            if (this.hudContainer) this.hudContainer.style.display = 'none';
        }, 3000);
    }

    update(currentPos) {
        if (this.state !== 'racing') return;

        // Update timer
        this.elapsedTime = (performance.now() - this.startTime) / 1000;

        // Check collision with active ring
        const activeRing = this.ringCourse.getActiveRing();
        
        if (activeRing) {
            // Simple spherical collision detection
            const dx = currentPos.x - activeRing.x;
            const dy = currentPos.y - activeRing.y;
            const dz = currentPos.z - activeRing.z;
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

            // If drone is within the ring's radius
            if (distance < activeRing.radius) {
                // Passed the ring!
                const nextIndex = this.ringCourse.activeRingIndex + 1;
                if (nextIndex >= this.ringCourse.rings.length) {
                    this.finishRace();
                } else {
                    this.ringCourse.updateActiveRing(nextIndex);
                }
            }
        }
        
        this.updateHUD();
    }

    updateHUD() {
        if (!this.timerEl || !this.ringCounterEl) return;
        
        this.timerEl.innerText = this.leaderboard.formatTime(this.elapsedTime);
        this.ringCounterEl.innerText = `Ring: ${this.ringCourse.activeRingIndex} / ${this.ringCourse.rings.length}`;
    }
}
