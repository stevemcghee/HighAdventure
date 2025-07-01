// Campsite manager for generating and managing campsites
class CampsiteManager {
    constructor() {
        this.campsites = [];
        this.futuristicNames = [
            "Nebula Point", "Starlight Haven", "Quantum Glade", "Aurora Ridge", 
            "Galactic Springs", "Nova Vista", "Celestial Bay", "Photon Fields",
            "Gravity Rest", "Cosmic Overlook", "Astro Meadow", "Plasma Falls",
            "Ion Valley", "Comet Crest", "Eclipse Grove", "Orbit Refuge",
            "Pulsar Peak", "Void Vista", "Neutron Nest", "Fusion Fields",
            "Meteor Mesa", "Solar Sanctuary", "Lunar Lagoon", "Venus Valley",
            "Mars Meadow", "Jupiter Junction", "Saturn Springs", "Uranus Uplands",
            "Neptune Nook", "Pluto Plateau", "Andromeda Arc", "Orion Oasis",
            "Sirius Station", "Vega Vista", "Polaris Point", "Cassiopeia Cove",
            "Lyra Lodge", "Cygnus Camp", "Aquila Aerie", "Pegasus Place",
            "Centaurus Center", "Draco Den", "Hydra Haven", "Leo Lodge",
            "Virgo Vista", "Libra Landing", "Scorpius Station", "Sagittarius Springs",
            "Capricorn Cove", "Aquarius Arc", "Pisces Point", "Aries Aerie",
            "Taurus Terrace", "Gemini Grove", "Cancer Cove", "Leo Lagoon"
        ];
        this.earthNames = [
            "Eagle's Nest", "Bear Creek", "Mountain View", "Pine Ridge", 
            "Crystal Lake", "Sunset Peak", "Wildflower Meadow", "Rocky Point",
            "Hidden Valley", "Thunder Ridge", "Misty Falls", "Golden Peak",
            "Emerald Basin", "Silver Creek", "Alpine Meadow", "Cedar Grove",
            "Aspen Heights", "Birch Brook", "Cedar Crest", "Dogwood Dell",
            "Elm Valley", "Fir Forest", "Golden Gate", "Hickory Hill",
            "Ivy Ridge", "Juniper Junction", "Kings Canyon", "Larch Lake",
            "Maple Meadows", "Oak Overlook", "Pine Valley", "Quaking Aspen",
            "Redwood Ridge", "Spruce Springs", "Tamarack Trail", "Umbrella Falls",
            "Vista Point", "Willow Way", "Yellowstone", "Zion Springs",
            "Alpine Pass", "Bear Mountain", "Cascade Falls", "Deer Valley",
            "Eagle Peak", "Forest Glen", "Granite Peak", "Highland Pass",
            "Indian Springs", "Juniper Peak", "Kings Peak", "Lone Pine",
            "Mountain Home", "North Star", "Old Faithful", "Pine Creek"
        ];
        
        this.campsiteNameIndex = 0;
    }
    
    generateCampsites(mountain) {
        // Determine which name list to use based on current game mode
        this.campsiteNames = (window.gameMode === 'earth') ? this.earthNames : this.futuristicNames;
        
        // Shuffle names for uniqueness
        for (let i = this.campsiteNames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.campsiteNames[i], this.campsiteNames[j]] = [this.campsiteNames[j], this.campsiteNames[i]];
        }
        this.campsiteNameIndex = 0;
        
        const numCampsites = 12 + Math.floor(Math.random() * 6);
        
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
            x = 20 + Math.random() * 160; // Use full 200x200 terrain (20-180 range)
            y = 20 + Math.random() * 160; // Use full 200x200 terrain (20-180 range)
            attempts++;
        } while (this.isTooCloseToExisting(x, y) && attempts < maxAttempts);
        
        const height = mountain.getTerrainHeight(x, y);
        let name;
        if (this.campsiteNameIndex < this.campsiteNames.length) {
            name = this.campsiteNames[this.campsiteNameIndex++];
        } else {
            name = `Resort ${index + 1}`;
        }
        
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