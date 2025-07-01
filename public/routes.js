// Route manager for creating and managing trails between campsites
class RouteManager {
    constructor() {
        this.routes = [];
        this.routeIdCounter = 0;
        this.campsiteManager = null;
        this.usedRouteNames = new Set();
    }
    
    setCampsiteManager(campsiteManager) {
        this.campsiteManager = campsiteManager;
    }
    
    createRoute(from, to, difficulty, distance = null, mountain = null) {
        console.log(`Creating route: ${from} -> ${to} (${difficulty})`);
        
        // Check if route already exists between these campsites
        if (this.routeExists(from, to)) {
            console.log(`Route already exists between ${from} and ${to}`);
            return null; // Return null to indicate failure
        }
        
        // Calculate actual distance if not provided
        if (distance === null) {
            distance = this.calculateActualDistance(from, to, difficulty, mountain);
        }
        
        const route = {
            id: this.routeIdCounter++,
            from: from,
            to: to,
            name: this.generateRouteName(from, to, difficulty, distance),
            difficulty: difficulty,
            distance: distance,
            quality: this.calculateRouteQuality(difficulty, distance),
            maintenance: 100, // Starts at 100%
            popularity: 0,
            cost: this.calculateRouteCost(difficulty, distance),
            features: this.generateRouteFeatures(difficulty, distance)
        };
        
        this.routes.push(route);
        console.log(`Route created successfully: ${route.name} (${route.distance}mi) - Total routes: ${this.routes.length}`);
        return route;
    }
    
    calculateActualDistance(from, to, difficulty, mountain = null) {
        // Get campsite positions from the mountain
        if (!mountain) {
            if (!window.game || !window.game.getMountain) {
                console.warn('Game not available for distance calculation, using default');
                return 5; // Default fallback
            }
            mountain = window.game.getMountain();
        }
        
        const campsites = mountain.getCampsites();
        
        const fromCampsite = campsites.find(c => c.name === from);
        const toCampsite = campsites.find(c => c.name === to);
        
        if (!fromCampsite || !toCampsite) {
            console.warn('Campsites not found for distance calculation');
            return 5; // Default fallback
        }
        
        // Calculate Euclidean distance between campsites
        const dx = fromCampsite.x - toCampsite.x;
        const dy = fromCampsite.y - toCampsite.y;
        const rawDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Convert to realistic miles
        // The terrain is 200x200 units representing approximately 30 square miles
        // This means the diagonal of the terrain is about 5.5 miles (sqrt(30))
        // The diagonal of 200x200 units is sqrt(200^2 + 200^2) = 282.8 units
        // So 282.8 units = 5.5 miles, therefore 1 unit = 0.019 miles
        // Apply 3x multiplier for more substantial trail distances
        const milesPerUnit = 0.019 * 3;
        const baseDistance = rawDistance * milesPerUnit;
        
        // Add some terrain complexity factor based on difficulty
        let terrainMultiplier = 1.0;
        switch (difficulty) {
            case 'easy': terrainMultiplier = 1.2; break; // Easy routes are slightly longer due to gentle paths
            case 'moderate': terrainMultiplier = 1.4; break; // Moderate routes wind more
            case 'difficult': terrainMultiplier = 1.8; break; // Difficult routes take complex paths
            case 'expert': terrainMultiplier = 2.2; break; // Expert routes are very winding
        }
        
        const finalDistance = Math.round(baseDistance * terrainMultiplier * 10) / 10; // Round to 1 decimal place
        
        // Ensure minimum distance of 1.5 miles and maximum of 36 miles
        return Math.max(1.5, Math.min(36, finalDistance));
    }
    
    generateRouteName(from, to, difficulty, distance) {
        const futuristicNames = [
            'Eagle Ridge Trail', 'Bear Creek Path', 'Mountain Vista Way', 'Pine Ridge Route',
            'Crystal Lake Trail', 'Thunder Peak Path', 'Wildflower Ridge', 'Sunset Summit Trail',
            'Raven\'s Roost Route', 'Misty Valley Trail', 'Golden Eagle Path', 'Starlight Ridge',
            'Cascade Falls Trail', 'Alpine Meadow Path', 'Whispering Pines Route', 'Eagle\'s Nest Trail',
            'Crystal Peak Path', 'Mountain Stream Trail', 'Highland Ridge Route', 'Valley Vista Trail',
            'Thunder Ridge Path', 'Bear Mountain Trail', 'Pine Valley Route', 'Summit Ridge Trail',
            'Wilderness Way', 'Alpine Pass Trail', 'Mountain View Path', 'Crystal Ridge Route',
            'Eagle Peak Trail', 'Thunder Valley Path', 'Pine Summit Route', 'Bear Ridge Trail'
        ];
        const earthNames = [
            'Appalachian Trail', 'Pacific Crest Trail', 'Continental Divide Trail', 'John Muir Trail',
            'Wonderland Trail', 'Tahoe Rim Trail', 'Long Trail', 'Ice Age Trail',
            'Florida Trail', 'Arizona Trail', 'Benton MacKaye Trail', 'Foothills Trail',
            'Bartram Trail', 'Pinhoti Trail', 'Benton MacKaye Trail', 'Foothills Trail',
            'Mountains to Sea Trail', 'Art Loeb Trail', 'Foothills Trail', 'Bartram Trail',
            'Pinhoti Trail', 'Benton MacKaye Trail', 'Foothills Trail', 'Mountains to Sea Trail',
            'Art Loeb Trail', 'Foothills Trail', 'Bartram Trail', 'Pinhoti Trail',
            'Benton MacKaye Trail', 'Foothills Trail', 'Mountains to Sea Trail', 'Art Loeb Trail'
        ];
        
        const trailNames = (window.gameMode === 'earth') ? earthNames : futuristicNames;
        const available = trailNames.filter(n => !this.usedRouteNames.has(n));
        let name;
        if (available.length > 0) {
            name = available[Math.floor(Math.random() * available.length)];
        } else {
            name = `Trail ${this.usedRouteNames.size + 1}`;
        }
        this.usedRouteNames.add(name);
        return name;
    }
    
    generateRouteFeatures(difficulty, distance) {
        const features = [];
        
        // Distance-based features
        if (distance >= 8) {
            features.push('Scenic Overlooks');
            features.push('Rest Areas');
        } else if (distance >= 5) {
            features.push('View Points');
        }
        
        // Difficulty-based features
        switch (difficulty) {
            case 'easy':
                features.push('Family Friendly');
                features.push('Wide Path');
                break;
            case 'moderate':
                features.push('Rocky Sections');
                features.push('Steep Climbs');
                break;
            case 'difficult':
                features.push('Technical Terrain');
                features.push('Exposed Sections');
                features.push('Rope Assists');
                break;
            case 'expert':
                features.push('Extreme Terrain');
                features.push('Climbing Sections');
                features.push('Narrow Ledges');
                features.push('Weather Dependent');
                break;
        }
        
        // Add some random features
        const randomFeatures = [
            'Wildlife Viewing', 'Historical Sites', 'Water Crossings', 'Cave Systems',
            'Mountain Lakes', 'Alpine Meadows', 'Old Growth Forest', 'Rock Formations',
            'Waterfalls', 'Mountain Streams', 'Wildflower Fields', 'Boulder Fields'
        ];
        
        const numRandom = Math.floor(Math.random() * 2) + 1; // 1-2 random features
        for (let i = 0; i < numRandom; i++) {
            const randomIndex = Math.floor(Math.random() * randomFeatures.length);
            if (!features.includes(randomFeatures[randomIndex])) {
                features.push(randomFeatures[randomIndex]);
            }
        }
        
        return features;
    }
    
    calculateRouteQuality(difficulty, distance) {
        let quality = 50; // Base quality
        
        // Difficulty affects quality (harder routes are more appealing)
        switch (difficulty) {
            case 'easy': quality += 10; break;
            case 'moderate': quality += 20; break;
            case 'difficult': quality += 30; break;
            case 'expert': quality += 40; break;
        }
        
        // Distance affects quality (longer routes are more appealing)
        if (distance > 10) quality += 20;
        else if (distance > 5) quality += 10;
        
        return Math.min(100, quality);
    }
    
    calculateRouteCost(difficulty, distance) {
        let baseCost = distance * 500; // Increased from $100 to $500 per mile base
        
        // Difficulty multiplier
        switch (difficulty) {
            case 'easy': baseCost *= 1.0; break;
            case 'moderate': baseCost *= 1.2; break;
            case 'difficult': baseCost *= 1.5; break;
            case 'expert': baseCost *= 2.0; break;
        }
        
        return Math.round(baseCost);
    }
    
    getRoutes() {
        return this.routes;
    }
    
    getRouteById(id) {
        return this.routes.find(r => r.id === id);
    }
    
    getRoutesFromCampsite(campsiteName) {
        return this.routes.filter(r => r.from === campsiteName || r.to === campsiteName);
    }
    
    getTotalRoutes() {
        return this.routes.length;
    }
    
    getAverageRouteQuality() {
        if (this.routes.length === 0) return 0;
        
        const totalQuality = this.routes.reduce((sum, route) => sum + route.quality, 0);
        return totalQuality / this.routes.length;
    }
    
    getAverageRoutePrice() {
        if (this.routes.length === 0) return 0;
        
        const totalPrice = this.routes.reduce((sum, route) => sum + route.cost, 0);
        return Math.round(totalPrice / this.routes.length);
    }
    
    upgradeRoute(routeId) {
        const route = this.getRouteById(routeId);
        if (!route) return false;
        
        const upgradeCost = route.cost * 0.5; // 50% of original cost
        
        // Check if game is available
        if (!window.game || !window.game.getGameState) {
            console.error('Game not available for route upgrade');
            return false;
        }
        
        if (window.game.getGameState().money >= upgradeCost) {
            window.game.getGameState().money -= upgradeCost;
            route.quality = Math.min(100, route.quality + 20);
            route.maintenance = 100;
            route.cost = Math.round(route.cost * 1.2); // 20% price increase
            
            window.game.addMessage(`Upgraded ${route.name} for $${upgradeCost}`);
            return true;
        } else {
            window.game.addMessage("Not enough money to upgrade route!");
            return false;
        }
    }
    
    maintainRoute(routeId) {
        const route = this.getRouteById(routeId);
        if (!route) return false;
        
        const maintenanceCost = route.cost * 0.1; // 10% of original cost
        
        // Check if game is available
        if (!window.game || !window.game.getGameState) {
            console.error('Game not available for route maintenance');
            return false;
        }
        
        if (window.game.getGameState().money >= maintenanceCost) {
            window.game.getGameState().money -= maintenanceCost;
            route.maintenance = 100;
            
            window.game.addMessage(`Maintained ${route.name} for $${maintenanceCost}`);
            return true;
        } else {
            window.game.addMessage("Not enough money for maintenance!");
            return false;
        }
    }
    
    // Simulate route degradation over time
    degradeRoutes() {
        this.routes.forEach(route => {
            if (route.maintenance > 0) {
                route.maintenance = Math.max(0, route.maintenance - 5); // 5% degradation per week
            }
        });
    }
    
    // Calculate route popularity based on quality and maintenance
    updateRoutePopularity() {
        this.routes.forEach(route => {
            const basePopularity = route.quality * 0.5;
            const maintenanceBonus = route.maintenance * 0.3;
            route.popularity = Math.round(basePopularity + maintenanceBonus);
        });
    }
    
    getRouteDetails(routeId) {
        const route = this.getRouteById(routeId);
        if (!route) return null;
        
        return {
            from: route.from,
            to: route.to,
            difficulty: route.difficulty,
            distance: route.distance,
            quality: route.quality,
            maintenance: route.maintenance,
            popularity: route.popularity,
            cost: route.cost
        };
    }
    
    // Get all unique campsite connections
    getCampsiteConnections() {
        const connections = new Set();
        
        this.routes.forEach(route => {
            const connection = [route.from, route.to].sort().join(' - ');
            connections.add(connection);
        });
        
        return Array.from(connections);
    }
    
    // Check if route exists between two campsites
    routeExists(from, to) {
        return this.routes.some(route => 
            (route.from === from && route.to === to) ||
            (route.from === to && route.to === from)
        );
    }
    
    // Get route between two campsites
    getRouteBetween(from, to) {
        return this.routes.find(route => 
            (route.from === from && route.to === to) ||
            (route.from === to && route.to === from)
        );
    }
} 