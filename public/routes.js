// Route manager for creating and managing trails between campsites
class RouteManager {
    constructor() {
        this.routes = [];
        this.routeIdCounter = 0;
        this.campsiteManager = null;
    }
    
    setCampsiteManager(campsiteManager) {
        this.campsiteManager = campsiteManager;
    }
    
    createRoute(from, to, difficulty, distance) {
        // Check if route already exists between these campsites
        if (this.routeExists(from, to)) {
            console.log(`Route already exists between ${from} and ${to}`);
            return null; // Return null to indicate failure
        }
        
        const route = {
            id: this.routeIdCounter++,
            from: from,
            to: to,
            difficulty: difficulty,
            distance: distance,
            quality: this.calculateRouteQuality(difficulty, distance),
            maintenance: 100, // Starts at 100%
            popularity: 0,
            cost: this.calculateRouteCost(difficulty, distance)
        };
        
        this.routes.push(route);
        return route;
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
        let baseCost = distance * 100; // $100 per mile base
        
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
            
            window.game.addMessage(`Upgraded route from ${route.from} to ${route.to} for $${upgradeCost}`);
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
            
            window.game.addMessage(`Maintained route from ${route.from} to ${route.to} for $${maintenanceCost}`);
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