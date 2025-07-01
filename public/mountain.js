// Mountain generator using procedural terrain
class MountainGenerator {
    constructor() {
        this.canvas = document.getElementById('mountainCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set initial canvas size
        this.resizeCanvas();
        
        this.terrain = [];
        this.lakes = [];
        this.campsites = [];
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.setupEventListeners();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.render();
        });
    }
    
    resizeCanvas() {
        // Get the container width
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        // Calculate canvas size maintaining 3:2 aspect ratio
        const maxWidth = Math.min(600, containerWidth);
        const width = maxWidth;
        const height = (width * 2) / 3; // 3:2 aspect ratio
        
        // Set canvas display size
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Set canvas internal resolution (for crisp rendering)
        const devicePixelRatio = window.devicePixelRatio || 1;
        this.canvas.width = width * devicePixelRatio;
        this.canvas.height = height * devicePixelRatio;
        
        // Reset context and scale for device pixel ratio
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // Update internal dimensions
        this.width = width;
        this.height = height;
    }
    
    setupEventListeners() {
        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoom = Math.min(this.zoom * 1.2, 3);
            this.render();
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoom = Math.max(this.zoom / 1.2, 0.5);
            this.render();
        });
        
        document.getElementById('resetView').addEventListener('click', () => {
            this.zoom = 1;
            this.offsetX = 0;
            this.offsetY = 0;
            this.render();
        });
        
        // Mouse controls for panning
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                this.offsetX += deltaX / this.zoom;
                this.offsetY += deltaY / this.zoom;
                lastX = e.clientX;
                lastY = e.clientY;
                this.render();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }
    
    generateMountain() {
        this.generateTerrain();
        this.generateLakes();
        this.render();
    }
    
    generateTerrain() {
        // Generate height map using multiple noise layers
        const terrainWidth = 100;
        const terrainHeight = 100;
        
        this.terrain = [];
        for (let x = 0; x < terrainWidth; x++) {
            this.terrain[x] = [];
            for (let y = 0; y < terrainHeight; y++) {
                // Base mountain shape
                const distanceFromCenter = Math.sqrt(
                    Math.pow(x - terrainWidth / 2, 2) + 
                    Math.pow(y - terrainHeight / 2, 2)
                );
                const maxDistance = Math.sqrt(Math.pow(terrainWidth / 2, 2) + Math.pow(terrainHeight / 2, 2));
                const normalizedDistance = distanceFromCenter / maxDistance;
                
                // Create mountain peak
                let height = Math.max(0, 1 - normalizedDistance * 2);
                height = Math.pow(height, 2); // Sharper peak
                
                // Add noise for realistic terrain
                const noise1 = this.noise(x * 0.1, y * 0.1) * 0.3;
                const noise2 = this.noise(x * 0.05, y * 0.05) * 0.2;
                const noise3 = this.noise(x * 0.02, y * 0.02) * 0.1;
                
                height += noise1 + noise2 + noise3;
                height = Math.max(0, Math.min(1, height));
                
                this.terrain[x][y] = height;
            }
        }
    }
    
    generateLakes() {
        this.lakes = [];
        const terrainWidth = this.terrain.length;
        const terrainHeight = this.terrain[0].length;
        
        // Generate 2-4 lakes
        const numLakes = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < numLakes; i++) {
            // Find suitable lake locations (low elevation areas)
            let attempts = 0;
            let lakeX, lakeY;
            
            while (attempts < 50) {
                lakeX = Math.floor(Math.random() * terrainWidth);
                lakeY = Math.floor(Math.random() * terrainHeight);
                
                // Check if this is a low elevation area suitable for a lake
                if (this.terrain[lakeX][lakeY] < 0.3) {
                    // Check if it's not too close to existing lakes
                    let tooClose = false;
                    for (const lake of this.lakes) {
                        const distance = Math.sqrt(
                            Math.pow(lake.x - lakeX, 2) + 
                            Math.pow(lake.y - lakeY, 2)
                        );
                        if (distance < 15) {
                            tooClose = true;
                            break;
                        }
                    }
                    
                    if (!tooClose) {
                        break;
                    }
                }
                attempts++;
            }
            
            if (attempts < 50) {
                // Create lake with random size
                const lakeSize = Math.floor(Math.random() * 8) + 4; // 4-12 cells radius
                const lake = {
                    x: lakeX,
                    y: lakeY,
                    radius: lakeSize,
                    name: this.generateLakeName()
                };
                
                this.lakes.push(lake);
                
                // Lower the terrain around the lake to create a basin
                for (let dx = -lakeSize; dx <= lakeSize; dx++) {
                    for (let dy = -lakeSize; dy <= lakeSize; dy++) {
                        const nx = lakeX + dx;
                        const ny = lakeY + dy;
                        
                        if (nx >= 0 && nx < terrainWidth && ny >= 0 && ny < terrainHeight) {
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance <= lakeSize) {
                                // Create a basin effect
                                const basinDepth = Math.max(0, (lakeSize - distance) / lakeSize * 0.4);
                                this.terrain[nx][ny] = Math.max(0, this.terrain[nx][ny] - basinDepth);
                            }
                        }
                    }
                }
            }
        }
    }
    
    generateLakeName() {
        const lakeNames = [
            "Crystal Lake", "Mirror Lake", "Emerald Lake", "Sapphire Lake", 
            "Alpine Lake", "Mountain Lake", "Clear Lake", "Blue Lake",
            "Hidden Lake", "Tranquil Lake", "Serene Lake", "Peaceful Lake"
        ];
        return lakeNames[Math.floor(Math.random() * lakeNames.length)];
    }
    
    // Simple noise function (simplified Perlin noise)
    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const A = this.p[X] + Y;
        const AA = this.p[A];
        const AB = this.p[A + 1];
        const B = this.p[X + 1] + Y;
        const BA = this.p[B];
        const BB = this.p[B + 1];
        
        return this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y), this.grad(this.p[BA], x - 1, y)),
                           this.lerp(u, this.grad(this.p[AB], x, y - 1), this.grad(this.p[BB], x - 1, y - 1)));
    }
    
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y) {
        const h = hash & 15;
        const grad_x = 1 + (h & 7);
        const grad_y = grad_x & 1 ? grad_x : -grad_x;
        return (grad_x * x + grad_y * y) * 0.5;
    }
    
    // Permutation table for noise
    get p() {
        if (!this._p) {
            this._p = [];
            for (let i = 0; i < 256; i++) {
                this._p[i] = Math.floor(Math.random() * 256);
            }
            // Duplicate the array
            for (let i = 0; i < 256; i++) {
                this._p[256 + i] = this._p[i];
            }
        }
        return this._p;
    }
    
    render() {
        console.log('Mountain render called');
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Apply transformations
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.width / 2 + this.offsetX, -this.height / 2 + this.offsetY);
        
        // Draw terrain
        this.drawTerrain();
        
        // Draw lakes
        this.drawLakes();
        
        // Draw campsites
        this.drawCampsites();
        
        // Draw routes
        this.drawRoutes();
        
        this.ctx.restore();
        console.log('Mountain render completed');
    }
    
    drawTerrain() {
        const terrainWidth = this.terrain.length;
        const terrainHeight = this.terrain[0].length;
        
        // Clear canvas with transparent background
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw terrain using square pixels with exact boundaries
        const cellWidth = this.width / terrainWidth;
        const cellHeight = this.height / terrainHeight;
        
        // Disable anti-aliasing for crisp pixels
        this.ctx.imageSmoothingEnabled = false;
        
        for (let x = 0; x < terrainWidth; x++) {
            for (let y = 0; y < terrainHeight; y++) {
                const height = this.terrain[x][y];
                const screenX = Math.floor(x * cellWidth);
                const screenY = Math.floor(y * cellHeight);
                const pixelWidth = Math.ceil(cellWidth);
                const pixelHeight = Math.ceil(cellHeight);
                
                // Check if this pixel is part of a lake
                let isLake = false;
                for (const lake of this.lakes) {
                    const distance = Math.sqrt(
                        Math.pow(x - lake.x, 2) + 
                        Math.pow(y - lake.y, 2)
                    );
                    if (distance <= lake.radius) {
                        isLake = true;
                        break;
                    }
                }
                
                // Natural terrain colors based on elevation
                let color;
                
                if (isLake) {
                    // Lake - various shades of blue
                    const blueIntensity = Math.floor(100 + Math.random() * 100);
                    const greenIntensity = Math.floor(50 + Math.random() * 50);
                    const redIntensity = Math.floor(20 + Math.random() * 30);
                    color = `rgb(${redIntensity}, ${greenIntensity}, ${blueIntensity})`;
                } else if (height > 0.85) {
                    // Snow peaks - white with slight blue tint
                    const snowIntensity = Math.floor(200 + height * 55);
                    color = `rgb(${snowIntensity}, ${snowIntensity}, ${snowIntensity + 20})`;
                } else if (height > 0.7) {
                    // Rocky peaks - gray to brown
                    const rockIntensity = Math.floor(100 + height * 80);
                    color = `rgb(${rockIntensity}, ${rockIntensity - 20}, ${rockIntensity - 40})`;
                } else if (height > 0.55) {
                    // Alpine meadows - light green to yellow
                    const green = Math.floor(120 + height * 80);
                    const red = Math.floor(100 + height * 60);
                    const blue = Math.floor(40 + height * 40);
                    color = `rgb(${red}, ${green}, ${blue})`;
                } else if (height > 0.35) {
                    // Forest - various shades of green
                    const green = Math.floor(60 + height * 120);
                    const red = Math.floor(20 + height * 40);
                    const blue = Math.floor(10 + height * 30);
                    color = `rgb(${red}, ${green}, ${blue})`;
                } else if (height > 0.2) {
                    // Foothills - brown to green transition
                    const brown = Math.floor(80 + height * 60);
                    const green = Math.floor(40 + height * 80);
                    const red = Math.floor(60 + height * 40);
                    color = `rgb(${red}, ${green}, ${brown})`;
                } else {
                    // Base/lowlands - basic grass green
                    color = `rgb(34, 139, 34)`;
                }
                
                // Draw square pixel with exact boundaries
                this.ctx.fillStyle = color;
                this.ctx.fillRect(screenX, screenY, pixelWidth, pixelHeight);
            }
        }
    }
    
    drawLakes() {
        this.lakes.forEach(lake => {
            const x = lake.x * (this.width / 100);
            const y = lake.y * (this.height / 100);
            
            // Draw lake name
            this.ctx.fillStyle = '#0066cc';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(lake.name, x, y);
        });
    }
    
    drawCampsites() {
        this.campsites.forEach(campsite => {
            const x = campsite.x * (this.width / 100);
            const y = campsite.y * (this.height / 100);
            
            // Draw campsite marker
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw campsite border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw campsite name
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(campsite.name, x, y + 20);
        });
    }
    
    drawRoutes() {
        if (!window.game) {
            console.warn('Game not available for route drawing');
            return;
        }
        
        const routes = window.game.getRouteManager().getRoutes();
        console.log(`Drawing ${routes.length} routes on mountain`);
        
        if (routes.length === 0) {
            console.log('No routes to draw');
            return;
        }
        
        routes.forEach((route, index) => {
            const fromCampsite = this.campsites.find(c => c.name === route.from);
            const toCampsite = this.campsites.find(c => c.name === route.to);
            
            if (fromCampsite && toCampsite) {
                console.log(`Drawing route ${index + 1}: ${route.from} -> ${route.to} (${route.difficulty})`);
                
                const fromX = fromCampsite.x * (this.width / 100);
                const fromY = fromCampsite.y * (this.height / 100);
                const toX = toCampsite.x * (this.width / 100);
                const toY = toCampsite.y * (this.height / 100);
                
                // Use A* pathfinding to avoid steep terrain
                const pathPoints = this.generateAStarPath(fromX, fromY, toX, toY);
                
                // Draw route path
                this.ctx.strokeStyle = this.getRouteColor(route.difficulty);
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                
                if (pathPoints.length > 0) {
                    this.ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
                    for (let i = 1; i < pathPoints.length; i++) {
                        this.ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
                    }
                } else {
                    // Fallback to straight line if path generation fails
                    this.ctx.moveTo(fromX, fromY);
                    this.ctx.lineTo(toX, toY);
                }
                
                this.ctx.stroke();
                
                // Draw route label
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.textAlign = 'center';
                const midX = (fromX + toX) / 2;
                const midY = (fromY + toY) / 2;
                
                // Draw route name
                if (route.name) {
                    this.ctx.fillText(route.name, midX, midY - 15);
                }
                
                // Draw distance
                this.ctx.font = '9px Arial';
                this.ctx.fillText(`${route.distance}mi`, midX, midY - 2);
            } else {
                console.warn(`Campsites not found for route: ${route.from} -> ${route.to}`);
                console.log('Available campsites:', this.campsites.map(c => c.name));
            }
        });
    }
    
    // A* pathfinding on the terrain grid to avoid steep elevation changes
    generateAStarPath(fromX, fromY, toX, toY) {
        const gridSize = 100;
        const start = {
            x: Math.round(fromX * gridSize / this.width),
            y: Math.round(fromY * gridSize / this.height)
        };
        const end = {
            x: Math.round(toX * gridSize / this.width),
            y: Math.round(toY * gridSize / this.height)
        };
        
        // Node structure: {x, y, g, h, f, parent}
        const openSet = [];
        const closedSet = new Set();
        const nodeMap = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
        
        function heuristic(a, b) {
            // Euclidean distance
            return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        }
        
        function nodeKey(x, y) {
            return `${x},${y}`;
        }
        
        // Cost function: penalize steep elevation changes
        const getCost = (x1, y1, x2, y2) => {
            const h1 = this.getTerrainHeightAt(x1, y1);
            const h2 = this.getTerrainHeightAt(x2, y2);
            const base = 1;
            const elevationDiff = Math.abs(h2 - h1);
            // Heavily penalize steep slopes
            return base + elevationDiff * 30 + (elevationDiff > 0.15 ? 100 : 0);
        };
        
        // Initialize start node
        const startNode = {
            x: start.x,
            y: start.y,
            g: 0,
            h: heuristic(start, end),
            f: 0 + heuristic(start, end),
            parent: null
        };
        openSet.push(startNode);
        nodeMap[start.x][start.y] = startNode;
        
        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        
        let found = false;
        let endNode = null;
        while (openSet.length > 0) {
            // Get node with lowest f
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            if (current.x === end.x && current.y === end.y) {
                found = true;
                endNode = current;
                break;
            }
            closedSet.add(nodeKey(current.x, current.y));
            
            for (const [dx, dy] of directions) {
                const nx = current.x + dx;
                const ny = current.y + dy;
                if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) continue;
                if (closedSet.has(nodeKey(nx, ny))) continue;
                
                const cost = getCost.call(this, current.x, current.y, nx, ny);
                if (cost > 50) continue; // Impassable if too steep
                
                const g = current.g + cost;
                const h = heuristic({ x: nx, y: ny }, end);
                const f = g + h;
                
                let neighbor = nodeMap[nx][ny];
                if (!neighbor || g < neighbor.g) {
                    neighbor = {
                        x: nx,
                        y: ny,
                        g,
                        h,
                        f,
                        parent: current
                    };
                    nodeMap[nx][ny] = neighbor;
                    openSet.push(neighbor);
                }
            }
        }
        
        // Reconstruct path
        const path = [];
        if (found && endNode) {
            let node = endNode;
            while (node) {
                // Convert grid coords to screen coords
                path.unshift({
                    x: node.x * this.width / gridSize,
                    y: node.y * this.height / gridSize
                });
                node = node.parent;
            }
        }
        return path;
    }
    
    getTerrainHeightAt(x, y) {
        const terrainX = Math.floor(x);
        const terrainY = Math.floor(y);
        
        if (terrainX >= 0 && terrainX < this.terrain.length && 
            terrainY >= 0 && terrainY < this.terrain[0].length) {
            return this.terrain[terrainX][terrainY];
        }
        return 0;
    }
    
    getTerrainGradientX(x, y) {
        const terrainX = Math.floor(x);
        const terrainY = Math.floor(y);
        
        if (terrainX <= 0 || terrainX >= this.terrain.length - 1) return 0;
        
        const left = this.getTerrainHeightAt(terrainX - 1, terrainY);
        const right = this.getTerrainHeightAt(terrainX + 1, terrainY);
        return right - left;
    }
    
    getTerrainGradientY(x, y) {
        const terrainX = Math.floor(x);
        const terrainY = Math.floor(y);
        
        if (terrainY <= 0 || terrainY >= this.terrain[0].length - 1) return 0;
        
        const top = this.getTerrainHeightAt(terrainX, terrainY - 1);
        const bottom = this.getTerrainHeightAt(terrainX, terrainY + 1);
        return bottom - top;
    }
    
    getRouteColor(difficulty) {
        switch (difficulty) {
            case 'easy': return '#4ade80';
            case 'moderate': return '#fbbf24';
            case 'difficult': return '#f97316';
            case 'expert': return '#dc2626';
            default: return '#6b7280';
        }
    }
    
    addCampsite(campsite) {
        this.campsites.push(campsite);
        this.render();
    }
    
    getCampsites() {
        return this.campsites;
    }
    
    getTerrainHeight(x, y) {
        const terrainX = Math.floor(x * 100 / this.width);
        const terrainY = Math.floor(y * 100 / this.height);
        
        if (terrainX >= 0 && terrainX < this.terrain.length && 
            terrainY >= 0 && terrainY < this.terrain[0].length) {
            return this.terrain[terrainX][terrainY];
        }
        return 0;
    }
} 