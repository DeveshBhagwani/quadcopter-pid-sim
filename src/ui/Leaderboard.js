export class Leaderboard {
    constructor() {
        this.storageKey = 'quadcopter_leaderboard';
        this.scores = this.loadScores();
        
        // UI Elements
        this.modal = document.getElementById('leaderboard-modal');
        this.listEl = document.getElementById('leaderboard-list');
        this.closeBtn = document.getElementById('close-leaderboard');
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }
    }

    loadScores() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch(e) {
            console.error("Failed to load leaderboard", e);
        }
        return [];
    }

    saveScores() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    }

    addTime(timeInSeconds) {
        this.scores.push({
            time: timeInSeconds,
            date: new Date().toLocaleDateString()
        });
        
        // Sort ascending (lowest time is best)
        this.scores.sort((a, b) => a.time - b.time);
        
        // Keep top 5
        if (this.scores.length > 5) {
            this.scores = this.scores.slice(0, 5);
        }
        
        this.saveScores();
    }

    formatTime(timeSecs) {
        const mins = Math.floor(timeSecs / 60);
        const secs = Math.floor(timeSecs % 60);
        const millis = Math.floor((timeSecs % 1) * 100);
        
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
    }

    show() {
        if (!this.modal) return;
        
        this.listEl.innerHTML = '';
        
        if (this.scores.length === 0) {
            this.listEl.innerHTML = '<li>No times recorded yet.</li>';
        } else {
            this.scores.forEach((score, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>#${index + 1}</span> <span>${this.formatTime(score.time)}</span> <span style="font-size:12px; color:#aaa;">${score.date}</span>`;
                this.listEl.appendChild(li);
            });
        }
        
        this.modal.style.display = 'block';
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}
