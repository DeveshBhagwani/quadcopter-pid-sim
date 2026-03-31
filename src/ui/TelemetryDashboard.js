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
                        label: 'Estimated Z',
                        borderColor: '#42a5f5',
                        data: [],
                        pointRadius: 0,
                        borderWidth: 2
                    },
                    {
                        label: 'Target Z',
                        borderColor: '#ef5350',
                        data: [],
                        pointRadius: 0,
                        borderDash: [5, 5],
                        borderWidth: 2
                    },
                    {
                        label: 'Raw Noisy Z',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        data: [],
                        pointRadius: 0,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: { display: false },
                    y: { 
                        min: 0, max: 20,
                        grid: { color: '#333' },
                        ticks: { color: '#aaa' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#eee' } }
                }
            }
        });
    }

    update(time, estimated, target, noisy) {
        this.chart.data.labels.push(time.toFixed(2));
        this.chart.data.datasets[0].data.push(estimated);
        this.chart.data.datasets[1].data.push(target);
        this.chart.data.datasets[2].data.push(noisy);

        if (this.chart.data.labels.length > this.maxDataPoints) {
            this.chart.data.labels.shift();
            this.chart.data.datasets[0].data.shift();
            this.chart.data.datasets[1].data.shift();
            this.chart.data.datasets[2].data.shift();
        }

        this.chart.update();
    }
}