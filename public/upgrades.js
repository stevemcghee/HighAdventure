// Upgrade manager for camp improvements
class UpgradeManager {
    constructor() {
        this.gameState = null;
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
    
    setGameState(gameState) {
        this.gameState = gameState;
    }
    
    initializeUpgrades(campsite) {
        // Start with basic upgrades for the campsite
        const upgradeData = this.availableUpgrades.find(u => u.id === 'better_trails');
        if (upgradeData) {
            const upgrade = {
                ...upgradeData,
                purchased: true,
                level: 1,
                effectiveness: 100
            };
            if (!campsite.upgrades) {
                campsite.upgrades = [];
            }
            campsite.upgrades.push(upgrade);
        }
    }
    
    purchaseUpgradeForCampsite(campsite, upgradeId) {
        const upgradeData = this.availableUpgrades.find(u => u.id === upgradeId);
        if (!upgradeData) return false;
        
        // Check if game is available
        if (!window.game || !window.game.getGameState) {
            console.error('Game not available for purchase');
            return false;
        }
        
        if (window.game.getGameState().money >= upgradeData.cost) {
            window.game.getGameState().money -= upgradeData.cost;
            
            const upgrade = {
                ...upgradeData,
                purchased: true,
                level: 1,
                effectiveness: 100
            };
            
            if (!campsite.upgrades) {
                campsite.upgrades = [];
            }
            campsite.upgrades.push(upgrade);
            window.game.addMessage(`Purchased ${upgradeData.name} for ${campsite.name} for $${upgradeData.cost}`);
            return true;
        } else {
            window.game.addMessage("Not enough money to purchase upgrade!");
            return false;
        }
    }
    
    upgradeExistingForCampsite(campsite, upgradeId) {
        const upgrade = this.getUpgradeById(campsite, upgradeId);
        if (!upgrade) return false;
        
        const upgradeCost = upgrade.cost * 0.7; // 70% of original cost
        
        // Check if game is available
        if (!window.game || !window.game.getGameState) {
            console.error('Game not available for upgrade');
            return false;
        }
        
        if (window.game.getGameState().money >= upgradeCost) {
            window.game.getGameState().money -= upgradeCost;
            upgrade.level++;
            upgrade.effectiveness = Math.min(100, upgrade.effectiveness + 10);
            
            window.game.addMessage(`Upgraded ${upgrade.name} at ${campsite.name} to level ${upgrade.level} for $${upgradeCost}`);
            return true;
        } else {
            window.game.addMessage("Not enough money to upgrade!");
            return false;
        }
    }
    
    getCampsiteUpgrades(campsite) {
        return campsite.upgrades || [];
    }
    
    getAvailableUpgradesForCampsite(campsite) {
        const installedUpgrades = this.getCampsiteUpgrades(campsite);
        return this.availableUpgrades.filter(upgrade => 
            !installedUpgrades.some(installed => installed.id === upgrade.id)
        );
    }
    
    getUpgradeById(campsite, id) {
        return this.getCampsiteUpgrades(campsite).find(u => u.id === id);
    }
    
    getTotalUpgradeBonusForCampsite(campsite) {
        return this.getCampsiteUpgrades(campsite).reduce((total, upgrade) => {
            return total + (upgrade.happinessBonus * (upgrade.effectiveness / 100) * upgrade.level);
        }, 0);
    }
    
    getTotalVisitorBonusForCampsite(campsite) {
        return this.getCampsiteUpgrades(campsite).reduce((total, upgrade) => {
            return total + (upgrade.visitorBonus * (upgrade.effectiveness / 100) * upgrade.level);
        }, 0);
    }
    
    getUpgradesByCategoryForCampsite(campsite, category) {
        return this.getCampsiteUpgrades(campsite).filter(u => u.category === category);
    }
    
    getUpgradeCategoriesForCampsite(campsite) {
        const categories = [...new Set(this.getCampsiteUpgrades(campsite).map(u => u.category))];
        return categories;
    }
    
    // Simulate upgrade effectiveness changes over time for a campsite
    updateUpgradeEffectivenessForCampsite(campsite) {
        this.getCampsiteUpgrades(campsite).forEach(upgrade => {
            // Random effectiveness changes
            const change = (Math.random() - 0.5) * 5;
            upgrade.effectiveness = Math.max(50, Math.min(100, upgrade.effectiveness + change));
        });
    }
    
    // Get upgrade recommendations based on campsite state
    getUpgradeRecommendationsForCampsite(campsite) {
        const recommendations = [];
        
        // Check if game is available
        if (!window.game || !window.game.getGameState) {
            return recommendations;
        }
        
        const gameState = window.game.getGameState();
        
        // Recommend safety upgrades if campsite is at high elevation
        if (campsite.elevation > 7000) {
            recommendations.push('emergency_equipment', 'weather_station');
        }
        
        // Recommend facility upgrades if campsite has high capacity
        if (campsite.capacity > 40) {
            recommendations.push('comfort_stations', 'campground_kitchen');
        }
        
        // Recommend water-related upgrades if campsite has water facilities
        if (campsite.facilities.includes('water_source')) {
            recommendations.push('water_filters');
        }
        
        return recommendations.filter((id, index, arr) => arr.indexOf(id) === index);
    }
    
    // Calculate upgrade maintenance costs for a campsite
    calculateMaintenanceCostsForCampsite(campsite) {
        return this.getCampsiteUpgrades(campsite).reduce((total, upgrade) => {
            return total + (upgrade.cost * 0.05 * upgrade.level); // 5% of original cost per level
        }, 0);
    }
    
    // Get upgrade statistics for a campsite
    getUpgradeStatsForCampsite(campsite) {
        const upgrades = this.getCampsiteUpgrades(campsite);
        return {
            totalUpgrades: upgrades.length,
            totalHappinessBonus: this.getTotalUpgradeBonusForCampsite(campsite),
            totalVisitorBonus: this.getTotalVisitorBonusForCampsite(campsite),
            averageLevel: upgrades.length > 0 ? 
                upgrades.reduce((sum, u) => sum + u.level, 0) / upgrades.length : 0,
            averageEffectiveness: upgrades.length > 0 ? 
                upgrades.reduce((sum, u) => sum + u.effectiveness, 0) / upgrades.length : 0
        };
    }
    
    // Get upgrade cost for next level
    getUpgradeCost(campsite, upgradeId) {
        const upgrade = this.getUpgradeById(campsite, upgradeId);
        if (!upgrade) return 0;
        
        return Math.round(upgrade.cost * 0.7);
    }
    
    // Check if upgrade can be purchased for a campsite
    canPurchaseUpgradeForCampsite(campsite, upgradeId) {
        const upgradeData = this.availableUpgrades.find(u => u.id === upgradeId);
        if (!upgradeData) return false;
        
        // Check if game is available
        if (!window.game || !window.game.getGameState) {
            return false;
        }
        
        return window.game.getGameState().money >= upgradeData.cost;
    }
    
    // Check if upgrade can be upgraded for a campsite
    canUpgradeExistingForCampsite(campsite, upgradeId) {
        const upgrade = this.getUpgradeById(campsite, upgradeId);
        if (!upgrade) return false;
        
        const upgradeCost = upgrade.cost * 0.7;
        
        // Check if game is available
        if (!window.game || !window.game.getGameState) {
            return false;
        }
        
        return window.game.getGameState().money >= upgradeCost;
    }
} 