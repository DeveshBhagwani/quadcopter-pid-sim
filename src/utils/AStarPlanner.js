export class AStarPlanner {
    constructor(gridResolution = 0.5) {
        this.res = gridResolution;
        this.maxNodes = 2000; // Prevent infinite loops or freezing the browser
    }

    plan(start, end, slamMap) {
        const startX = Math.round(start.x / this.res);
        const startY = Math.round(start.y / this.res);
        const endX = Math.round(end.x / this.res);
        const endY = Math.round(end.y / this.res);

        const openSet = new Set([`${startX},${startY}`]);
        const cameFrom = new Map();
        
        const gScore = new Map();
        gScore.set(`${startX},${startY}`, 0);
        
        const fScore = new Map();
        fScore.set(`${startX},${startY}`, this.heuristic(startX, startY, endX, endY));

        let nodesEvaluated = 0;

        while (openSet.size > 0) {
            nodesEvaluated++;
            if (nodesEvaluated > this.maxNodes) break;

            // Find node in openSet with lowest fScore
            let current = null;
            let lowestF = Infinity;
            for (const node of openSet) {
                const score = fScore.get(node) || Infinity;
                if (score < lowestF) {
                    lowestF = score;
                    current = node;
                }
            }

            if (!current) break;

            const [cx, cy] = current.split(',').map(Number);

            // Reached destination
            if (cx === endX && cy === endY) {
                const path = this.reconstructPath(cameFrom, current, end.z);
                // Ensure the exact final coordinate is added at the end
                path.push({ x: end.x, y: end.y, z: end.z });
                return path;
            }

            openSet.delete(current);

            // 8-way movement
            const neighbors = [
                [0, 1], [1, 0], [0, -1], [-1, 0],
                [1, 1], [1, -1], [-1, 1], [-1, -1]
            ];

            for (const [dx, dy] of neighbors) {
                const nx = cx + dx;
                const ny = cy + dy;
                const neighbor = `${nx},${ny}`;

                // Check collision with safety margin
                if (this.isBlocked(nx, ny, slamMap)) continue;

                const tentativeGScore = gScore.get(current) + (dx === 0 || dy === 0 ? 1 : 1.414);

                if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this.heuristic(nx, ny, endX, endY));
                    openSet.add(neighbor);
                }
            }
        }

        return []; // No path found (or max nodes exceeded)
    }

    isBlocked(gx, gy, slamMap) {
        // Drone is ~0.5m wide, so we check the cell itself and all 8 neighbors to enforce a safety margin
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const realX = (gx + dx) * this.res;
                const realY = (gy + dy) * this.res;
                if (slamMap.isObstacle(realX, realY)) {
                    return true;
                }
            }
        }
        return false;
    }

    heuristic(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    reconstructPath(cameFrom, current, zTarget) {
        const path = [];
        let curr = current;
        while (cameFrom.has(curr)) {
            const [x, y] = curr.split(',').map(Number);
            path.unshift({ x: x * this.res, y: y * this.res, z: zTarget });
            curr = cameFrom.get(curr);
        }
        return path;
    }
}
