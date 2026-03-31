import Chart from 'chart.js/auto';

export class TelemetryDashboard {
    constructor() {
        const ctx = document.getElementById('telemetry-chart').getContext('2d');
        this.maxDataPoints = 150;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Actual Z (m)',
                        borderColor: '#42a5f5',
                        backgroundColor: 'rgba(66, 165, 245, 0.1)',
                        data: [],
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Target Z (m)',
                        borderColor: '#ef5350',
                        data: [],
                        pointRadius: 0,
                        borderDash: [5, 5],
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: {
                        display: false
                    },
                    y: { 
                        min: 0, 
                        max: 20,
                        grid: { color: '#333' },
                        ticks: { color: '#aaa' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#eee' }
                    }
                }
            }
        });
    }

    update(time, actual, target) {
        this.chart.data.labels.push(time.toFixed(2));
        this.chart.data.datasets[0].data.push(actual);
        this.chart.data.datasets[1].data.push(target);

        if (this.chart.data.labels.length > this.maxDataPoints) {
            this.chart.data.labels.shift();
            this.chart.data.datasets[0].data.shift();
            this.chart.data.datasets[1].data.shift();
        }

        this.chart.update();
    }
}