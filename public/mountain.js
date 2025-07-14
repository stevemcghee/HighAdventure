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
        
        this.usedLakeNames = new Set();
        this.usedPeakNames = new Set();
    }
    
    resizeCanvas() {
        // Get the container width
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        // Calculate canvas size maintaining 3:2 aspect ratio
        const maxWidth = Math.min(1200, containerWidth);
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
            this.zoom = Math.max(this.zoom / 1.2, 1.0);
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
                
                // Calculate new offset positions
                const newOffsetX = this.offsetX + deltaX / this.zoom;
                const newOffsetY = this.offsetY + deltaY / this.zoom;
                
                // Calculate boundaries to keep terrain visible
                const terrainWidth = this.terrain ? this.terrain.length : 200;
                const terrainHeight = this.terrain ? this.terrain[0].length : 200;
                const maxOffsetX = this.width * (1 - 1/this.zoom) / 2;
                const maxOffsetY = this.height * (1 - 1/this.zoom) / 2;
                const minOffsetX = -maxOffsetX;
                const minOffsetY = -maxOffsetY;
                
                // Apply boundaries
                this.offsetX = Math.max(minOffsetX, Math.min(maxOffsetX, newOffsetX));
                this.offsetY = Math.max(minOffsetY, Math.min(maxOffsetY, newOffsetY));
                
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
        console.log('Generating mountain...');
        this.generateTerrain();
        console.log('Terrain generated, now generating lakes...');
        this.generateLakes();
        console.log('Lakes generated, now rendering...');
        this.usedLakeNames = new Set();
        this.usedPeakNames = new Set();
        this.render();
    }
    
    generateTerrain() {
        // Generate height map using multiple noise layers
        const terrainWidth = 200;
        const terrainHeight = 200;
        
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
                
                // Create mountain peak - smoother transitions
                let height = Math.max(0, 1 - normalizedDistance * 1.5); // Less steep falloff
                height = Math.pow(height, 1.5); // Less sharp peak
                
                // Add noise for realistic terrain - reduced for smoother terrain
                const noise1 = this.noise(x * 0.05, y * 0.05) * 0.15; // Reduced frequency and amplitude
                const noise2 = this.noise(x * 0.02, y * 0.02) * 0.1;  // Reduced frequency and amplitude
                const noise3 = this.noise(x * 0.01, y * 0.01) * 0.05; // Reduced frequency and amplitude
                
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
        
        console.log(`Terrain dimensions: ${terrainWidth}x${terrainHeight}`);
        console.log(`Lakes array before generation: ${this.lakes.length}`);
        
        // Generate 2-4 lakes
        const numLakes = Math.floor(Math.random() * 3) + 2;
        console.log(`Attempting to generate ${numLakes} lakes...`);
        
        // Find the minimum and maximum terrain heights for debugging
        let minHeight = 1;
        let maxHeight = 0;
        for (let x = 0; x < terrainWidth; x++) {
            for (let y = 0; y < terrainHeight; y++) {
                minHeight = Math.min(minHeight, this.terrain[x][y]);
                maxHeight = Math.max(maxHeight, this.terrain[x][y]);
            }
        }
        console.log(`Terrain height range: ${minHeight.toFixed(3)} to ${maxHeight.toFixed(3)}`);
        
        for (let i = 0; i < numLakes; i++) {
            // Find suitable lake locations (low elevation areas)
            let attempts = 0;
            let lakeX, lakeY;
            
            while (attempts < 100) {
                lakeX = Math.floor(Math.random() * terrainWidth);
                lakeY = Math.floor(Math.random() * terrainHeight);
                
                // Check if this is a low elevation area suitable for a lake
                // Use a more generous threshold based on actual terrain
                const heightThreshold = minHeight + (maxHeight - minHeight) * 0.3;
                console.log(`Checking position (${lakeX}, ${lakeY}), height: ${this.terrain[lakeX][lakeY].toFixed(3)}, threshold: ${heightThreshold.toFixed(3)}`);
                
                if (this.terrain[lakeX][lakeY] < heightThreshold) {
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
            
            if (attempts < 100) {
                // Create lake with varied size and shape
                const baseSize = Math.floor(Math.random() * 4) + 2; // 2-6 cells base size
                const lake = {
                    x: lakeX,
                    y: lakeY,
                    baseSize: baseSize,
                    shape: Math.random() > 0.5 ? 'oval' : 'irregular',
                    name: this.generateLakeName()
                };
                
                this.lakes.push(lake);
                console.log(`Created lake: ${lake.name} at (${lakeX}, ${lakeY}) with base size ${baseSize}, shape: ${lake.shape}, terrain height: ${this.terrain[lakeX][lakeY].toFixed(3)}`);
                
                // Lower the terrain around the lake to create a basin
                const maxRadius = baseSize + Math.floor(Math.random() * 3); // Vary the actual size
                for (let dx = -maxRadius; dx <= maxRadius; dx++) {
                    for (let dy = -maxRadius; dy <= maxRadius; dy++) {
                        const nx = lakeX + dx;
                        const ny = lakeY + dy;
                        
                        if (nx >= 0 && nx < terrainWidth && ny >= 0 && ny < terrainHeight) {
                            let distance;
                            
                            if (lake.shape === 'oval') {
                                // Oval shape - stretch in one direction
                                const stretchFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
                                const angle = Math.random() * Math.PI * 2;
                                const dxStretched = dx * Math.cos(angle) + dy * Math.sin(angle);
                                const dyStretched = -dx * Math.sin(angle) + dy * Math.cos(angle);
                                distance = Math.sqrt((dxStretched / stretchFactor) ** 2 + (dyStretched * stretchFactor) ** 2);
                            } else {
                                // Irregular shape - add some randomness
                                const baseDistance = Math.sqrt(dx * dx + dy * dy);
                                const irregularity = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
                                distance = baseDistance * irregularity;
                            }
                            
                            if (distance <= baseSize) {
                                // Create a basin effect
                                const basinDepth = Math.max(0, (baseSize - distance) / baseSize * 0.25);
                                this.terrain[nx][ny] = Math.max(0, this.terrain[nx][ny] - basinDepth);
                            }
                        }
                    }
                }
            } else {
                console.log(`Failed to find suitable location for lake ${i + 1} after 100 attempts`);
            }
        }
        
        console.log(`Generated ${this.lakes.length} lakes total`);
        console.log(`Lakes array after generation:`, this.lakes);
    }
    
    generateLakeName() {
        const futuristicNames = [
            "Nebula Lake", "Starlake", "Quantum Pool", "Aurora Basin", 
            "Galactic Lagoon", "Nova Reservoir", "Celestial Mere", "Photon Pond",
            "Gravity Bay", "Cosmic Tarn", "Astro Loch", "Plasma Pool",
            "Pulsar Pool", "Void Waters", "Neutron Nook", "Fusion Fjord",
            "Meteor Mere", "Solar Sea", "Lunar Lake", "Venus Vista",
            "Mars Marsh", "Jupiter Jetty", "Saturn Sound", "Uranus Bay",
            "Neptune Narrows", "Pluto Pond", "Andromeda Arm", "Orion Ocean",
            "Sirius Sea", "Vega Vista", "Polaris Pool", "Cassiopeia Cove",
            "Lyra Lagoon", "Cygnus Sound", "Aquila Arm", "Pegasus Pool",
            "Centaurus Cove", "Draco Delta", "Hydra Harbor", "Leo Lagoon",
            "Virgo Vista", "Libra Lake", "Scorpius Sound", "Sagittarius Sea",
            "Capricorn Cove", "Aquarius Arm", "Pisces Pool", "Aries Arm",
            "Taurus Tarn", "Gemini Gulf", "Cancer Cove", "Leo Lake"
        ];
        const earthNames = [
            "Crystal Lake", "Mirror Lake", "Emerald Lake", "Sapphire Lake", 
            "Alpine Lake", "Mountain Lake", "Clear Lake", "Blue Lake",
            "Hidden Lake", "Tranquil Lake", "Serene Lake", "Peaceful Lake",
            "Bear Lake", "Deer Lake", "Eagle Lake", "Fish Lake",
            "Golden Lake", "Silver Lake", "Copper Lake", "Iron Lake",
            "Jade Lake", "Onyx Lake", "Pearl Lake", "Ruby Lake",
            "Diamond Lake", "Amethyst Lake", "Topaz Lake", "Garnet Lake",
            "Opal Lake", "Turquoise Lake", "Coral Lake", "Ivory Lake",
            "Sunset Lake", "Dawn Lake", "Twilight Lake", "Midnight Lake",
            "Morning Lake", "Evening Lake", "Noon Lake", "Dusk Lake",
            "Rainbow Lake", "Thunder Lake", "Lightning Lake", "Storm Lake",
            "Calm Lake", "Rough Lake", "Deep Lake", "Shallow Lake",
            "Long Lake", "Round Lake", "Wide Lake", "Narrow Lake"
        ];
        
        const lakeNames = (window.gameMode === 'earth') ? earthNames : futuristicNames;
        const available = lakeNames.filter(n => !this.usedLakeNames.has(n));
        let name;
        if (available.length > 0) {
            name = available[Math.floor(Math.random() * available.length)];
        } else {
            name = `Lake ${this.usedLakeNames.size + 1}`;
        }
        this.usedLakeNames.add(name);
        return name;
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
        this.drawIsometricTerrain();
        
        // Draw lakes
        this.drawLakes();
        
        // Draw day hikes (before campsites so they appear behind)
        this.drawDayHikes();
        
        // Draw campsites
        this.drawCampsites();
        
        // Draw peaks
        this.drawPeaks();
        
        // Draw routes
        this.drawRoutes();
        
        this.ctx.restore();
        console.log('Mountain render completed');
    }
    
    drawIsometricTerrain() {
        const terrainWidth = this.terrain.length;
        const terrainHeight = this.terrain[0].length;

        // Clear canvas with transparent background
        this.ctx.clearRect(0, 0, this.width, this.height);

        const tileWidth = 10; // Width of a single isometric tile
        const tileHeight = tileWidth * 0.5; // Height of a single isometric tile

        // Center the map
        const centerX = this.width / 2;
        const centerY = this.height / 4;

        for (let x = 0; x < terrainWidth; x++) {
            for (let y = 0; y < terrainHeight; y++) {
                const height = this.terrain[x][y];

                // Convert grid coordinates to isometric coordinates
                const isoX = (x - y) * tileWidth / 2;
                const isoY = (x + y) * tileHeight / 2;

                // Apply centering and height offset
                const screenX = centerX + isoX;
                const screenY = centerY + isoY - height * 20; // Scale height for visibility

                // Check if this pixel is part of a lake
                let isLake = false;
                for (const lake of this.lakes) {
                    const dx = x - lake.x;
                    const dy = y - lake.y;
                    let distance;

                    if (lake.shape === 'oval') {
                        const stretchFactor = 0.7 + Math.random() * 0.6;
                        const angle = Math.random() * Math.PI * 2;
                        const dxStretched = dx * Math.cos(angle) + dy * Math.sin(angle);
                        const dyStretched = -dx * Math.sin(angle) + dy * Math.cos(angle);
                        distance = Math.sqrt((dxStretched / stretchFactor) ** 2 + (dyStretched * stretchFactor) ** 2);
                    } else {
                        const baseDistance = Math.sqrt(dx * dx + dy * dy);
                        const irregularity = Math.random() * 0.4 + 0.8;
                        distance = baseDistance * irregularity;
                    }

                    if (distance <= lake.baseSize) {
                        isLake = true;
                        break;
                    }
                }

                // Natural terrain colors based on elevation
                let color;
                if (isLake) {
                    color = `rgb(135, 206, 235)`; // Sky blue
                } else if (height > 0.9) {
                    color = `rgb(255, 255, 255)`;
                } else if (height > 0.8) {
                    color = `rgb(200, 200, 200)`;
                } else if (height > 0.7) {
                    color = `rgb(180, 160, 140)`;
                } else if (height > 0.6) {
                    color = `rgb(160, 140, 120)`;
                } else if (height > 0.5) {
                    color = `rgb(140, 120, 100)`;
                } else if (height > 0.4) {
                    color = `rgb(120, 100, 80)`;
                } else if (height > 0.3) {
                    color = `rgb(100, 80, 60)`;
                } else if (height > 0.2) {
                    color = `rgb(80, 100, 60)`;
                } else if (height > 0.1) {
                    color = `rgb(60, 120, 60)`;
                } else {
                    color = `rgb(100, 140, 100)`;
                }

                // Draw the isometric tile (a rhombus)
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, screenY);
                this.ctx.lineTo(screenX + tileWidth / 2, screenY + tileHeight / 2);
                this.ctx.lineTo(screenX, screenY + tileHeight);
                this.ctx.lineTo(screenX - tileWidth / 2, screenY + tileHeight / 2);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
    }
    
    drawLakes() {
        console.log(`Drawing ${this.lakes.length} lakes...`);
        const tileWidth = 10;
        const tileHeight = tileWidth * 0.5;
        const centerX = this.width / 2;
        const centerY = this.height / 4;

        this.lakes.forEach((lake, index) => {
            const isoX = (lake.x - lake.y) * tileWidth / 2;
            const isoY = (lake.x + lake.y) * tileHeight / 2;
            const screenX = centerX + isoX;
            const screenY = centerY + isoY;

            console.log(`Drawing lake ${index + 1}: ${lake.name} at screen position (${screenX}, ${screenY}) from terrain position (${lake.x}, ${lake.y})`);

            // Draw lake name
            this.ctx.fillStyle = '#0066cc';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(lake.name, screenX, screenY);
        });
    }

    drawCampsites() {
        const tileWidth = 10;
        const tileHeight = tileWidth * 0.5;
        const centerX = this.width / 2;
        const centerY = this.height / 4;

        this.campsites.forEach(campsite => {
            const height = this.getTerrainHeightAt(campsite.x, campsite.y);
            const isoX = (campsite.x - campsite.y) * tileWidth / 2;
            const isoY = (campsite.x + campsite.y) * tileHeight / 2;
            const screenX = centerX + isoX;
            const screenY = centerY + isoY - height * 20;

            // Draw campsite marker
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw campsite border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw campsite name
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(campsite.name, screenX, screenY + 20);
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

        const tileWidth = 10;
        const tileHeight = tileWidth * 0.5;
        const centerX = this.width / 2;
        const centerY = this.height / 4;

        routes.forEach((route, index) => {
            const fromCampsite = this.campsites.find(c => c.name === route.from);
            const toCampsite = this.campsites.find(c => c.name === route.to);

            if (fromCampsite && toCampsite) {
                console.log(`Drawing route ${index + 1}: ${route.from} -> ${route.to} (${route.difficulty})`);

                const fromHeight = this.getTerrainHeightAt(fromCampsite.x, fromCampsite.y);
                const fromIsoX = (fromCampsite.x - fromCampsite.y) * tileWidth / 2;
                const fromIsoY = (fromCampsite.x + fromCampsite.y) * tileHeight / 2;
                const fromScreenX = centerX + fromIsoX;
                const fromScreenY = centerY + fromIsoY - fromHeight * 20;

                const toHeight = this.getTerrainHeightAt(toCampsite.x, toCampsite.y);
                const toIsoX = (toCampsite.x - toCampsite.y) * tileWidth / 2;
                const toIsoY = (toCampsite.x + toCampsite.y) * tileHeight / 2;
                const toScreenX = centerX + toIsoX;
                const toScreenY = centerY + toIsoY - toHeight * 20;

                // Use A* pathfinding to avoid steep terrain
                const pathPoints = this.generateAStarPath(fromCampsite.x, fromCampsite.y, toCampsite.x, toCampsite.y);

                // Draw route path
                this.ctx.strokeStyle = this.getRouteColor(route.difficulty);
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();

                if (pathPoints.length > 0) {
                    const startHeight = this.getTerrainHeightAt(pathPoints[0].x, pathPoints[0].y);
                    const startIsoX = (pathPoints[0].x - pathPoints[0].y) * tileWidth / 2;
                    const startIsoY = (pathPoints[0].x + pathPoints[0].y) * tileHeight / 2;
                    this.ctx.moveTo(centerX + startIsoX, centerY + startIsoY - startHeight * 20);

                    for (let i = 1; i < pathPoints.length; i++) {
                        const height = this.getTerrainHeightAt(pathPoints[i].x, pathPoints[i].y);
                        const isoX = (pathPoints[i].x - pathPoints[i].y) * tileWidth / 2;
                        const isoY = (pathPoints[i].x + pathPoints[i].y) * tileHeight / 2;
                        this.ctx.lineTo(centerX + isoX, centerY + isoY - height * 20);
                    }
                } else {
                    // Fallback to straight line if path generation fails
                    this.ctx.moveTo(fromScreenX, fromScreenY);
                    this.ctx.lineTo(toScreenX, toScreenY);
                }

                this.ctx.stroke();

                // Draw route label
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.textAlign = 'center';
                const midX = (fromScreenX + toScreenX) / 2;
                const midY = (fromScreenY + toScreenY) / 2;

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
        const gridSize = 200; // Use actual terrain size
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
        // Regenerate day hikes when campsites are added
        this.generateDayHikes();
        this.render();
    }
    
    getCampsites() {
        return this.campsites;
    }
    
    getTerrainHeight(x, y) {
        // Convert screen coordinates to terrain coordinates (200x200 terrain)
        const terrainX = Math.floor(x);
        const terrainY = Math.floor(y);
        
        if (terrainX >= 0 && terrainX < this.terrain.length && 
            terrainY >= 0 && terrainY < this.terrain[0].length) {
            return this.terrain[terrainX][terrainY];
        }
        return 0;
    }
    
    generateDayHikes() {
        this.dayHikes = [];
        
        console.log(`Generating day hikes for ${this.campsites.length} campsites...`);
        
        // Find mountain peaks (high elevation areas)
        this.peaks = this.findMountainPeaks();
        console.log(`Found ${this.peaks.length} mountain peaks for day hikes`);
        
        // Generate day hikes for each campsite
        this.campsites.forEach(campsite => {
            // Find nearest lake
            const nearestLake = this.findNearestLake(campsite);
            
            // Find nearest peak
            const nearestPeak = this.findNearestPeak(campsite, this.peaks);
            
            // Create day hikes (prefer lakes over peaks if they're similar distance)
            if (nearestLake && nearestPeak) {
                const lakeDistance = this.calculateDistance(campsite, nearestLake);
                const peakDistance = this.calculateDistance(campsite, nearestPeak);
                
                // Convert to miles (using same scale as routes: 1 unit = 0.019 * 3 miles)
                const lakeDistanceMiles = lakeDistance * 0.019 * 3;
                const peakDistanceMiles = peakDistance * 0.019 * 3;
                
                // Only create hikes if they're 10 miles or less
                if (lakeDistanceMiles <= 10 && peakDistanceMiles <= 10) {
                    // Choose the closer destination, or lake if distances are similar
                    if (lakeDistance <= peakDistance * 1.2) {
                        this.dayHikes.push({
                            from: campsite,
                            to: nearestLake,
                            type: 'lake',
                            distance: lakeDistance,
                            name: `${campsite.name} to ${nearestLake.name}`
                        });
                    } else {
                        this.dayHikes.push({
                            from: campsite,
                            to: nearestPeak,
                            type: 'peak',
                            distance: peakDistance,
                            name: `${campsite.name} to ${nearestPeak.name}`
                        });
                    }
                } else if (lakeDistanceMiles <= 10) {
                    // Only lake is within 10 miles
                    this.dayHikes.push({
                        from: campsite,
                        to: nearestLake,
                        type: 'lake',
                        distance: lakeDistance,
                        name: `${campsite.name} to ${nearestLake.name}`
                    });
                } else if (peakDistanceMiles <= 10) {
                    // Only peak is within 10 miles
                    this.dayHikes.push({
                        from: campsite,
                        to: nearestPeak,
                        type: 'peak',
                        distance: peakDistance,
                        name: `${campsite.name} to ${nearestPeak.name}`
                    });
                } else {
                    console.log(`No suitable day hikes for ${campsite.name} - nearest lake: ${lakeDistanceMiles.toFixed(1)}mi, nearest peak: ${peakDistanceMiles.toFixed(1)}mi`);
                }
            } else if (nearestLake) {
                const lakeDistance = this.calculateDistance(campsite, nearestLake);
                const lakeDistanceMiles = lakeDistance * 0.019 * 3;
                
                if (lakeDistanceMiles <= 10) {
                    this.dayHikes.push({
                        from: campsite,
                        to: nearestLake,
                        type: 'lake',
                        distance: lakeDistance,
                        name: `${campsite.name} to ${nearestLake.name}`
                    });
                } else {
                    console.log(`Lake hike too long for ${campsite.name}: ${lakeDistanceMiles.toFixed(1)}mi`);
                }
            } else if (nearestPeak) {
                const peakDistance = this.calculateDistance(campsite, nearestPeak);
                const peakDistanceMiles = peakDistance * 0.019 * 3;
                
                if (peakDistanceMiles <= 10) {
                    this.dayHikes.push({
                        from: campsite,
                        to: nearestPeak,
                        type: 'peak',
                        distance: peakDistance,
                        name: `${campsite.name} to ${nearestPeak.name}`
                    });
                } else {
                    console.log(`Peak hike too long for ${campsite.name}: ${peakDistanceMiles.toFixed(1)}mi`);
                }
            }
        });
        
        console.log(`Generated ${this.dayHikes.length} day hikes`);
    }
    
    findMountainPeaks() {
        const peaks = [];
        const terrainWidth = this.terrain.length;
        const terrainHeight = this.terrain[0].length;
        
        // Find local maxima (peaks)
        for (let x = 2; x < terrainWidth - 2; x++) {
            for (let y = 2; y < terrainHeight - 2; y++) {
                const height = this.terrain[x][y];
                
                // Check if this is a local maximum (higher than surrounding cells)
                let isPeak = true;
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = -2; dy <= 2; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < terrainWidth && ny >= 0 && ny < terrainHeight) {
                            if (this.terrain[nx][ny] >= height) {
                                isPeak = false;
                                break;
                            }
                        }
                    }
                    if (!isPeak) break;
                }
                
                // Must be high enough to be considered a peak
                if (isPeak && height > 0.8) {
                    peaks.push({
                        x: x,
                        y: y,
                        height: height,
                        name: this.generatePeakName()
                    });
                }
            }
        }
        
        // Limit to top 3-5 peaks to avoid overcrowding
        peaks.sort((a, b) => b.height - a.height);
        return peaks.slice(0, Math.min(5, peaks.length));
    }
    
    generatePeakName() {
        const futuristicNames = [
            "Nebula Peak", "Starlight Spire", "Quantum Summit", "Aurora Pinnacle",
            "Galactic Crest", "Nova Point", "Celestial Apex", "Photon Ridge",
            "Gravity Bluff", "Cosmic Spire", "Astro Horn", "Plasma Heights",
            "Pulsar Peak", "Void Vista", "Neutron Needle", "Fusion Face",
            "Meteor Mesa", "Solar Summit", "Lunar Ledge", "Venus Vista",
            "Mars Mesa", "Jupiter Junction", "Saturn Spire", "Uranus Uplands",
            "Neptune Needle", "Pluto Peak", "Andromeda Apex", "Orion Overlook",
            "Sirius Spire", "Vega Vista", "Polaris Peak", "Cassiopeia Crest",
            "Lyra Ledge", "Cygnus Crest", "Aquila Apex", "Pegasus Peak",
            "Centaurus Crest", "Draco Dome", "Hydra Heights", "Leo Ledge",
            "Virgo Vista", "Libra Ledge", "Scorpius Spire", "Sagittarius Summit",
            "Capricorn Crest", "Aquarius Apex", "Pisces Peak", "Aries Apex",
            "Taurus Tower", "Gemini Gorge", "Cancer Crest", "Leo Ledge"
        ];
        const earthNames = [
            "Summit Peak", "Eagle Peak", "Thunder Peak", "Crystal Peak",
            "Alpine Peak", "Mountain Top", "High Point", "Vista Peak",
            "Rocky Peak", "Granite Peak", "Snow Peak", "Cloud Peak",
            "Bear Peak", "Deer Peak", "Elk Peak", "Moose Peak",
            "Wolf Peak", "Coyote Peak", "Fox Peak", "Lynx Peak",
            "Golden Peak", "Silver Peak", "Copper Peak", "Iron Peak",
            "Jade Peak", "Onyx Peak", "Pearl Peak", "Ruby Peak",
            "Diamond Peak", "Amethyst Peak", "Topaz Peak", "Garnet Peak",
            "Opal Peak", "Turquoise Peak", "Coral Peak", "Ivory Peak",
            "Sunset Peak", "Dawn Peak", "Twilight Peak", "Midnight Peak",
            "Morning Peak", "Evening Peak", "Noon Peak", "Dusk Peak",
            "Rainbow Peak", "Thunder Peak", "Lightning Peak", "Storm Peak",
            "Calm Peak", "Rough Peak", "Deep Peak", "Shallow Peak"
        ];
        
        const peakNames = (window.gameMode === 'earth') ? earthNames : futuristicNames;
        const available = peakNames.filter(n => !this.usedPeakNames.has(n));
        let name;
        if (available.length > 0) {
            name = available[Math.floor(Math.random() * available.length)];
        } else {
            name = `Peak ${this.usedPeakNames.size + 1}`;
        }
        this.usedPeakNames.add(name);
        return name;
    }
    
    findNearestLake(campsite) {
        if (this.lakes.length === 0) return null;
        
        let nearestLake = null;
        let minDistance = Infinity;
        
        this.lakes.forEach(lake => {
            const distance = this.calculateDistance(campsite, lake);
            if (distance < minDistance) {
                minDistance = distance;
                nearestLake = lake;
            }
        });
        
        return nearestLake;
    }
    
    findNearestPeak(campsite, peaks) {
        if (peaks.length === 0) return null;
        
        let nearestPeak = null;
        let minDistance = Infinity;
        
        peaks.forEach(peak => {
            const distance = this.calculateDistance(campsite, peak);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPeak = peak;
            }
        });
        
        return nearestPeak;
    }
    
    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    drawDayHikes() {
        if (!this.dayHikes || this.dayHikes.length === 0) {
            return;
        }

        console.log(`Drawing ${this.dayHikes.length} day hikes...`);

        const tileWidth = 10;
        const tileHeight = tileWidth * 0.5;
        const centerX = this.width / 2;
        const centerY = this.height / 4;

        this.dayHikes.forEach((hike, index) => {
            const fromHeight = this.getTerrainHeightAt(hike.from.x, hike.from.y);
            const fromIsoX = (hike.from.x - hike.from.y) * tileWidth / 2;
            const fromIsoY = (hike.from.x + hike.from.y) * tileHeight / 2;
            const fromScreenX = centerX + fromIsoX;
            const fromScreenY = centerY + fromIsoY - fromHeight * 20;

            const toHeight = this.getTerrainHeightAt(hike.to.x, hike.to.y);
            const toIsoX = (hike.to.x - hike.to.y) * tileWidth / 2;
            const toIsoY = (hike.to.x + hike.to.y) * tileHeight / 2;
            const toScreenX = centerX + toIsoX;
            const toScreenY = centerY + toIsoY - toHeight * 20;

            console.log(`Drawing day hike ${index + 1}: ${hike.name} (${hike.type})`);

            // Set up dotted line style
            this.ctx.setLineDash([5, 5]); // 5px dash, 5px gap
            this.ctx.lineCap = 'round';

            // Choose color based on hike type
            if (hike.type === 'lake') {
                this.ctx.strokeStyle = '#0066cc'; // Blue for lake hikes
            } else {
                this.ctx.strokeStyle = '#8b4513'; // Brown for peak hikes
            }

            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(fromScreenX, fromScreenY);
            this.ctx.lineTo(toScreenX, toScreenY);
            this.ctx.stroke();

            // Reset line dash
            this.ctx.setLineDash([]);

            // Draw hike label
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'italic 9px Arial';
            this.ctx.textAlign = 'center';
            const midX = (fromScreenX + toScreenX) / 2;
            const midY = (fromScreenY + toScreenY) / 2;

            // Draw hike name
            this.ctx.fillText(hike.name, midX, midY - 5);

            // Draw distance
            const distanceInMiles = Math.round(hike.distance * 0.019 * 3 * 10) / 10; // Convert to miles
            this.ctx.font = '8px Arial';
            this.ctx.fillText(`${distanceInMiles}mi`, midX, midY + 5);
        });
    }

    drawPeaks() {
        if (!this.peaks || this.peaks.length === 0) {
            return;
        }

        console.log(`Drawing ${this.peaks.length} mountain peaks...`);

        const tileWidth = 10;
        const tileHeight = tileWidth * 0.5;
        const centerX = this.width / 2;
        const centerY = this.height / 4;

        this.peaks.forEach((peak, index) => {
            const height = this.getTerrainHeightAt(peak.x, peak.y);
            const isoX = (peak.x - peak.y) * tileWidth / 2;
            const isoY = (peak.x + peak.y) * tileHeight / 2;
            const screenX = centerX + isoX;
            const screenY = centerY + isoY - height * 20;

            console.log(`Drawing peak ${index + 1}: ${peak.name} at (${screenX}, ${screenY})`);

            // Draw peak marker (triangle shape)
            this.ctx.fillStyle = '#8b4513'; // Brown color for peaks
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY - 10);
            this.ctx.lineTo(screenX - 8, screenY + 8);
            this.ctx.lineTo(screenX + 8, screenY + 8);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw peak border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw peak name
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(peak.name, screenX, screenY + 25);

            // Draw elevation
            const elevation = Math.round(peak.height * 8000 + 2000);
            this.ctx.font = '9px Arial';
            this.ctx.fillText(`${elevation}ft`, screenX, screenY + 35);
        });
    }
    
    getDayHikes() {
        return this.dayHikes || [];
    }
    
    getPeaks() {
        return this.peaks || [];
    }
} 