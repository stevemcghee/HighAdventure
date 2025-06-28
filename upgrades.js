// Upgrade manager for camp improvements
class UpgradeManager {
    constructor() {
        this.upgrades = [];
        this.availableUpgrades = [
            {
                id: 'better_trails',
                name: 'Better Trail Markers',
                description: 'Improve trail signage and safety',
                cost: 3000,
                happinessBonus: 5,
                visitorBonus: 2,
                category: 'trails'
            },
            {
                id: 'emergency_equipment',
                name: 'Emergency Equipment',
                description: 'Add first aid and emergency supplies',
                cost: 2000,
                happinessBonus: 3,
                visitorBonus: 1,
                category: 'safety'
            },
            {
                id: 'comfort_stations',
                name: 'Comfort Stations',
                description: 'Add clean restroom facilities',
                cost: 5000,
                happinessBonus: 8,
                visitorBonus: 3,
                category: 'facilities'
            },
            {
                id: 'wifi_hotspots',
                name: 'WiFi Hotspots',
                description: 'Add internet connectivity',
                cost: 4000,
                happinessBonus: 6,
                visitorBonus: 2,
                category: 'technology'
            },
            {
                id: 'solar_panels',
                name: 'Solar Panels',
                description: 'Add renewable energy sources',
                cost: 8000,
                happinessBonus: 10,
                visitorBonus: 4,
                category: 'sustainability'
            },
            {
                id: 'picnic_areas',
                name: 'Picnic Areas',
                description: 'Add covered picnic shelters',
                cost: 3500,
                happinessBonus: 7,
                visitorBonus: 2,
                category: 'facilities'
            },
            {
                id: 'wildlife_platforms',
                name: 'Wildlife Viewing Platforms',
                description: 'Add elevated viewing areas',
                cost: 6000,
                happinessBonus: 12,
                visitorBonus: 3,
                category: 'wildlife'
            },
            {
                id: 'campground_kitchen',
                name: 'Campground Kitchen',
                description: 'Add communal cooking facilities',
                cost: 4500,
                happinessBonus: 9,
                visitorBonus: 3,
                category: 'facilities'
            },
            {
                id: 'weather_station',
                name: 'Weather Station',
                description: 'Add weather monitoring equipment',
                cost: 2500,
                happinessBonus: 4,
                visitorBonus: 1,
                category: 'safety'
            },
            {
                id: 'interpretive_signs',
                name: 'Interpretive Signs',
                description: 'Add educational signage',
                cost: 1500,
                happinessBonus: 6,
                visitorBonus: 2,
                category: 'education'
            },
            {
                id: 'fire_pits',
                name: 'Enhanced Fire Pits',
                description: 'Add better fire pit facilities',
                cost: 2000,
                happinessBonus: 5,
                visitorBonus: 2,
                category: 'facilities'
            },
            {
                id: 'water_filters',
                name: 'Water Filtration',
                description: 'Add advanced water purification',
                cost: 3500,
                happinessBonus: 7,
                visitorBonus: 2,
                category: 'facilities'
            }
        ];
    }
    
    initializeUpgrades() {
        // Start with basic upgrades
        this.purchaseUpgrade('better_trails');
    }
    
    purchaseUpgrade(upgradeId) {
        const upgradeData = this.availableUpgrades.find(u => u.id === upgradeId);
        if (!upgradeData) return false;
        
        if (window.game.getGameState().money >= upgradeData.cost) {
            window.game.getGameState().money -= upgradeData.cost;
            
            const upgrade = {
                ...upgradeData,
                purchased: true,
                level: 1,
                effectiveness: 100
            };
            
            this.upgrades.push(upgrade);
            window.game.addMessage(`Purchased ${upgradeData.name} for $${upgradeData.cost}`);
            return true;
        } else {
            window.game.addMessage("Not enough money to purchase upgrade!");
            return false;
        }
    }
    
    upgradeExisting(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        if (!upgrade) return false;
        
        const upgradeCost = upgrade.cost * 0.7; // 70% of original cost
        
        if (window.game.getGameState().money >= upgradeCost) {
            window.game.getGameState().money -= upgradeCost;
            upgrade.level++;
            upgrade.effectiveness = Math.min(100, upgrade.effectiveness + 10);
            
            window.game.addMessage(`Upgraded ${upgrade.name} to level ${upgrade.level} for $${upgradeCost}`);
            return true;
        } else {
            window.game.addMessage("Not enough money to upgrade!");
            return false;
        }
    }
    
    getUpgrades() {
        return this.upgrades;
    }
    
    getAvailableUpgrades() {
        return this.availableUpgrades.filter(upgrade => 
            !this.upgrades.some(purchased => purchased.id === upgrade.id)
        );
    }
    
    getUpgradeById(id) {
        return this.upgrades.find(u => u.id === id);
    }
    
    getTotalUpgradeBonus() {
        return this.upgrades.reduce((total, upgrade) => {
            return total + (upgrade.happinessBonus * (upgrade.effectiveness / 100) * upgrade.level);
        }, 0);
    }
    
    getTotalVisitorBonus() {
        return this.upgrades.reduce((total, upgrade) => {
            return total + (upgrade.visitorBonus * (upgrade.effectiveness / 100) * upgrade.level);
        }, 0);
    }
    
    getUpgradesByCategory(category) {
        return this.upgrades.filter(u => u.category === category);
    }
    
    getUpgradeCategories() {
        const categories = [...new Set(this.upgrades.map(u => u.category))];
        return categories;
    }
    
    // Simulate upgrade effectiveness changes over time
    updateUpgradeEffectiveness() {
        this.upgrades.forEach(upgrade => {
            // Random effectiveness changes
            const change = (Math.random() - 0.5) * 5;
            upgrade.effectiveness = Math.max(50, Math.min(100, upgrade.effectiveness + change));
        });
    }
    
    // Get upgrade recommendations based on current state
    getUpgradeRecommendations() {
        const recommendations = [];
        const gameState = window.game.getGameState();
        
        // Recommend safety upgrades if happiness is low
        if (gameState.avgHappiness < 60) {
            recommendations.push('emergency_equipment', 'weather_station');
        }
        
        // Recommend facility upgrades if visitor count is high
        if (gameState.weeklyVisitors > 50) {
            recommendations.push('comfort_stations', 'campground_kitchen');
        }
        
        // Recommend sustainability upgrades for long-term benefits
        if (gameState.year > 2) {
            recommendations.push('solar_panels');
        }
        
        return recommendations.filter((id, index, arr) => arr.indexOf(id) === index);
    }
    
    // Calculate upgrade maintenance costs
    calculateMaintenanceCosts() {
        return this.upgrades.reduce((total, upgrade) => {
            return total + (upgrade.cost * 0.05 * upgrade.level); // 5% of original cost per level
        }, 0);
    }
    
    // Get upgrade statistics
    getUpgradeStats() {
        return {
            totalUpgrades: this.upgrades.length,
            totalHappinessBonus: this.getTotalUpgradeBonus(),
            totalVisitorBonus: this.getTotalVisitorBonus(),
            averageLevel: this.upgrades.length > 0 ? 
                this.upgrades.reduce((sum, u) => sum + u.level, 0) / this.upgrades.length : 0,
            averageEffectiveness: this.upgrades.length > 0 ? 
                this.upgrades.reduce((sum, u) => sum + u.effectiveness, 0) / this.upgrades.length : 0
        };
    }
    
    // Get upgrade cost for next level
    getUpgradeCost(upgradeId) {
        const upgrade = this.getUpgradeById(upgradeId);
        if (!upgrade) return 0;
        
        return Math.round(upgrade.cost * 0.7);
    }
    
    // Check if upgrade can be purchased
    canPurchaseUpgrade(upgradeId) {
        const upgradeData = this.availableUpgrades.find(u => u.id === upgradeId);
        if (!upgradeData) return false;
        
        return window.game.getGameState().money >= upgradeData.cost;
    }
    
    // Check if upgrade can be upgraded
    canUpgradeExisting(upgradeId) {
        const upgrade = this.getUpgradeById(upgradeId);
        if (!upgrade) return false;
        
        const upgradeCost = upgrade.cost * 0.7;
        return window.game.getGameState().money >= upgradeCost;
    }
} 