// Mountain generator using procedural terrain
class MountainGenerator {
    constructor() {
        this.canvas = document.getElementById('mountainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.terrain = [];
        this.campsites = [];
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.setupEventListeners();
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
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Apply transformations
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.width / 2 + this.offsetX, -this.height / 2 + this.offsetY);
        
        // Draw terrain
        this.drawTerrain();
        
        // Draw campsites
        this.drawCampsites();
        
        // Draw routes
        this.drawRoutes();
        
        this.ctx.restore();
    }
    
    drawTerrain() {
        const terrainWidth = this.terrain.length;
        const terrainHeight = this.terrain[0].length;
        const cellWidth = this.width / terrainWidth;
        const cellHeight = this.height / terrainHeight;
        
        for (let x = 0; x < terrainWidth; x++) {
            for (let y = 0; y < terrainHeight; y++) {
                const height = this.terrain[x][y];
                const screenX = x * cellWidth;
                const screenY = y * cellHeight;
                
                // Color based on height
                let color;
                if (height > 0.8) {
                    // Snow peaks
                    color = `rgb(255, 255, 255)`;
                } else if (height > 0.6) {
                    // Rocky peaks
                    color = `rgb(139, 137, 137)`;
                } else if (height > 0.4) {
                    // Forest
                    color = `rgb(34, 139, 34)`;
                } else if (height > 0.2) {
                    // Meadows
                    color = `rgb(144, 238, 144)`;
                } else {
                    // Base
                    color = `rgb(160, 82, 45)`;
                }
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(screenX, screenY, cellWidth, cellHeight);
            }
        }
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
        if (!window.game) return;
        
        const routes = window.game.getRouteManager().getRoutes();
        routes.forEach(route => {
            const fromCampsite = this.campsites.find(c => c.name === route.from);
            const toCampsite = this.campsites.find(c => c.name === route.to);
            
            if (fromCampsite && toCampsite) {
                const fromX = fromCampsite.x * (this.width / 100);
                const fromY = fromCampsite.y * (this.height / 100);
                const toX = toCampsite.x * (this.width / 100);
                const toY = toCampsite.y * (this.height / 100);
                
                // Draw route line
                this.ctx.strokeStyle = this.getRouteColor(route.difficulty);
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(toX, toY);
                this.ctx.stroke();
                
                // Draw route label
                this.ctx.fillStyle = '#333';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                const midX = (fromX + toX) / 2;
                const midY = (fromY + toY) / 2;
                this.ctx.fillText(`${route.distance}mi`, midX, midY - 5);
            }
        });
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