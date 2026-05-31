export class SlamMap {
    constructor() {
        this.canvas = document.getElementById('slam-map');
        this.ctx = this.canvas.getContext('2d');
        
        // Setup resolution
        this.canvas.width = 250;
        this.canvas.height = 250;
        
        // Map settings
        this.mapScale = 10; // pixels per meter
        
        // Simple point cloud
        this.pointCloud = [];
        this.maxPoints = 3000;
        
        // Occupancy Grid (Spatial Hash)
        this.gridResolution = 0.5; // 0.5m cells
        this.occupancyGrid = new Set();
    }

    update(dronePos, droneYaw, lidarHits) {
        if (!lidarHits) return;

        // Add new hits to point cloud
        lidarHits.forEach(hit => {
            if (hit.distance < 6.0) {
                // Calculate absolute world coordinates of the hit
                const hitX = dronePos.x + Math.cos(hit.angle) * hit.distance;
                const hitY = dronePos.y + Math.sin(hit.angle) * hit.distance;
                
                this.pointCloud.push({ x: hitX, y: hitY });
            }
        });

        // Cap point cloud size to prevent performance issues
        if (this.pointCloud.length > this.maxPoints) {
            this.pointCloud.splice(0, this.pointCloud.length - this.maxPoints);
        }

        // Rebuild occupancy grid for A* lookups
        this.occupancyGrid.clear();
        this.pointCloud.forEach(p => {
            const gx = Math.round(p.x / this.gridResolution);
            const gy = Math.round(p.y / this.gridResolution);
            this.occupancyGrid.add(`${gx},${gy}`);
        });

        this.draw(dronePos, droneYaw);
    }

    isObstacle(x, y) {
        const gx = Math.round(x / this.gridResolution);
        const gy = Math.round(y / this.gridResolution);
        // Add a small safety margin by also checking adjacent cells?
        // Let's stick to strict cell checking for now.
        return this.occupancyGrid.has(`${gx},${gy}`);
    }

    draw(dronePos, droneYaw) {
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw point cloud (obstacles)
        ctx.fillStyle = '#fff';
        this.pointCloud.forEach(p => {
            // Map world coordinates to local drone-centric view
            // Y is inverted because Canvas Y grows downwards
            const mapX = cx + (p.x - dronePos.x) * this.mapScale;
            const mapY = cy - (p.y - dronePos.y) * this.mapScale;

            ctx.fillRect(mapX, mapY, 2, 2);
        });

        // Draw drone (represented as a green triangle)
        ctx.save();
        ctx.translate(cx, cy);
        
        // Rotate context to match drone yaw. 
        // Note: Canvas rotation is clockwise, standard math is counter-clockwise.
        // Additionally, we invert Y, so rotation is negated twice? Actually just invert it.
        ctx.rotate(-droneYaw); 
        
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.moveTo(8, 0); // Nose facing positive X (0 angle)
        ctx.lineTo(-6, 5);
        ctx.lineTo(-6, -5);
        ctx.closePath();
        ctx.fill();
        
        // Draw sensor cone lines (visual aid for LiDAR spread)
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(60 * Math.cos(0.52), -60 * Math.sin(0.52)); // Left ray (y inverted)
        ctx.moveTo(0, 0);
        ctx.lineTo(60, 0); // Center ray
        ctx.moveTo(0, 0);
        ctx.lineTo(60 * Math.cos(-0.52), -60 * Math.sin(-0.52)); // Right ray (y inverted)
        ctx.stroke();

        ctx.restore();
    }
}
