// Campsite manager for generating and managing campsites
class CampsiteManager {
    constructor() {
        this.campsites = [];
        this.campsiteNames = [
            "Eagle's Nest", "Bear Creek", "Mountain View", "Pine Ridge", 
            "Crystal Lake", "Sunset Peak", "Wildflower Meadow", "Rocky Point",
            "Hidden Valley", "Thunder Ridge", "Misty Falls", "Golden Peak",
            "Emerald Basin", "Silver Creek", "Alpine Meadow", "Cedar Grove"
        ];
    }
    
    generateCampsites(mountain) {
        const numCampsites = 6 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numCampsites; i++) {
            const campsite = this.createCampsite(i, mountain);
            this.campsites.push(campsite);
            mountain.addCampsite(campsite);
        }
    }
    
    createCampsite(index, mountain) {
        let x, y, attempts = 0;
        const maxAttempts = 100;
        
        do {
            x = 10 + Math.random() * 80;
            y = 10 + Math.random() * 80;
            attempts++;
        } while (this.isTooCloseToExisting(x, y) && attempts < maxAttempts);
        
        const height = mountain.getTerrainHeight(x, y);
        const name = this.campsiteNames[index] || `Campsite ${index + 1}`;
        
        return {
            id: index,
            name: name,
            x: x,
            y: y,
            elevation: Math.round(height * 8000 + 2000),
            capacity: 20 + Math.floor(Math.random() * 30),
            facilities: this.generateFacilities(height),
            activities: [],
            upgrades: [],
            rating: 3 + Math.random() * 2,
            popularity: 0
        };
    }
    
    isTooCloseToExisting(x, y) {
        const minDistance = 15;
        
        return this.campsites.some(campsite => {
            const distance = Math.sqrt(
                Math.pow(campsite.x - x, 2) + Math.pow(campsite.y - y, 2)
            );
            return distance < minDistance;
        });
    }
    
    generateFacilities(height) {
        const facilities = ['tent_sites', 'water_source', 'fire_rings'];
        
        if (height > 0.7) {
            facilities.push('emergency_shelter');
        } else if (height > 0.4) {
            facilities.push('picnic_tables', 'bear_lockers');
            if (Math.random() > 0.5) {
                facilities.push('outhouse');
            }
        } else {
            facilities.push('picnic_tables', 'bear_lockers', 'outhouse', 'shower_house');
            if (Math.random() > 0.3) {
                facilities.push('camp_store');
            }
        }
        
        return facilities;
    }
    
    getCampsites() {
        return this.campsites;
    }
    
    getCampsiteByName(name) {
        return this.campsites.find(c => c.name === name);
    }
    
    getCampsiteNames() {
        return this.campsites.map(c => c.name);
    }
    
    getCampsiteAtPosition(x, y) {
        const tolerance = 10; // Click tolerance
        
        return this.campsites.find(campsite => {
            const distance = Math.sqrt(
                Math.pow(campsite.x - x, 2) + Math.pow(campsite.y - y, 2)
            );
            return distance < tolerance;
        });
    }
} 