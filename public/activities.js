// Activity manager for resort activities
class ActivityManager {
    constructor() {
        this.gameState = null;
        this.futuristicActivities = [
            {
                id: 'holographic_tours',
                name: 'Holographic Tours',
                description: 'Immersive 3D guided experiences',
                icon: '👁️',
                cost: 12000,
                happinessBonus: 15,
                popularity: 8
            },
            {
                id: 'gravity_parks',
                name: 'Gravity Parks',
                description: 'Low-gravity adventure zones',
                icon: '🌌',
                cost: 30000,
                happinessBonus: 25,
                popularity: 6
            },
            {
                id: 'alien_wildlife',
                name: 'Alien Wildlife Viewing',
                description: 'Observe native Terra Nova creatures',
                icon: '🦅',
                cost: 8000,
                happinessBonus: 10,
                popularity: 9
            },
            {
                id: 'stellar_observatory',
                name: 'Stellar Observatory',
                description: 'Crystal-clear cosmic viewing',
                icon: '⭐',
                cost: 5000,
                happinessBonus: 8,
                popularity: 7
            },
            {
                id: 'quantum_photography',
                name: 'Quantum Photography',
                description: 'Capture multi-dimensional landscapes',
                icon: '📸',
                cost: 18000,
                happinessBonus: 12,
                popularity: 8
            },
            {
                id: 'neural_storytelling',
                name: 'Neural Storytelling',
                description: 'AI-enhanced narrative experiences',
                icon: '🧠',
                cost: 3000,
                happinessBonus: 5,
                popularity: 10
            },
            {
                id: 'bio_luminescent_hikes',
                name: 'Bio-luminescent Hikes',
                description: 'Guided tours through glowing forests',
                icon: '🌲',
                cost: 15000,
                happinessBonus: 18,
                popularity: 9
            },
            {
                id: 'crystal_lakes',
                name: 'Crystal Lakes',
                description: 'Swim in healing mineral waters',
                icon: '🏊',
                cost: 10000,
                happinessBonus: 12,
                popularity: 8
            },
            {
                id: 'avian_spectacles',
                name: 'Avian Spectacles',
                description: 'Watch exotic flying creatures',
                icon: '🦜',
                cost: 7000,
                happinessBonus: 10,
                popularity: 7
            },
            {
                id: 'hover_biking',
                name: 'Hover Biking',
                description: 'Anti-gravity trail riding',
                icon: '🚴',
                cost: 25000,
                happinessBonus: 20,
                popularity: 6
            },
            {
                id: 'teleportation_experience',
                name: 'Teleportation Experience',
                description: 'Instant travel between viewpoints',
                icon: '⚡',
                cost: 35000,
                happinessBonus: 30,
                popularity: 5
            },
            {
                id: 'atmospheric_dining',
                name: 'Atmospheric Dining',
                description: 'Floating restaurants with planet views',
                icon: '🍽️',
                cost: 20000,
                happinessBonus: 16,
                popularity: 8
            },
            {
                id: 'time_dilation_zones',
                name: 'Time Dilation Zones',
                description: 'Experience time at different speeds',
                icon: '⏰',
                cost: 40000,
                happinessBonus: 35,
                popularity: 4
            },
            {
                id: 'neural_meditation',
                name: 'Neural Meditation',
                description: 'AI-guided mindfulness sessions',
                icon: '🧘',
                cost: 12000,
                happinessBonus: 14,
                popularity: 7
            },
            {
                id: 'crystal_caves',
                name: 'Crystal Caves',
                description: 'Explore underground crystal formations',
                icon: '💎',
                cost: 22000,
                happinessBonus: 18,
                popularity: 6
            }
        ];
        
        this.earthActivities = [
            {
                id: 'fishing',
                name: 'Fishing',
                description: 'Catch trout in mountain streams',
                icon: '🎣',
                cost: 12000,
                happinessBonus: 15,
                popularity: 8
            },
            {
                id: 'rock_climbing',
                name: 'Rock Climbing',
                description: 'Scale granite cliffs with guides',
                icon: '🧗',
                cost: 30000,
                happinessBonus: 25,
                popularity: 6
            },
            {
                id: 'wildlife_viewing',
                name: 'Wildlife Viewing',
                description: 'Spot bears, elk, and eagles',
                icon: '🦅',
                cost: 8000,
                happinessBonus: 10,
                popularity: 9
            },
            {
                id: 'stargazing',
                name: 'Stargazing',
                description: 'Clear mountain night skies',
                icon: '⭐',
                cost: 5000,
                happinessBonus: 8,
                popularity: 7
            },
            {
                id: 'photography',
                name: 'Photography',
                description: 'Capture stunning landscapes',
                icon: '📸',
                cost: 18000,
                happinessBonus: 12,
                popularity: 8
            },
            {
                id: 'campfire_stories',
                name: 'Campfire Stories',
                description: 'Evening storytelling sessions',
                icon: '🔥',
                cost: 3000,
                happinessBonus: 5,
                popularity: 10
            },
            {
                id: 'nature_hikes',
                name: 'Nature Hikes',
                description: 'Guided educational walks',
                icon: '🌲',
                cost: 15000,
                happinessBonus: 18,
                popularity: 9
            },
            {
                id: 'swimming',
                name: 'Swimming',
                description: 'Cool off in mountain lakes',
                icon: '🏊',
                cost: 10000,
                happinessBonus: 12,
                popularity: 8
            },
            {
                id: 'bird_watching',
                name: 'Bird Watching',
                description: 'Observe diverse bird species',
                icon: '🦜',
                cost: 7000,
                happinessBonus: 10,
                popularity: 7
            },
            {
                id: 'mountain_biking',
                name: 'Mountain Biking',
                description: 'Ride challenging trails',
                icon: '🚴',
                cost: 25000,
                happinessBonus: 20,
                popularity: 6
            },
            {
                id: 'horseback_riding',
                name: 'Horseback Riding',
                description: 'Explore trails on horseback',
                icon: '🐎',
                cost: 35000,
                happinessBonus: 30,
                popularity: 5
            },
            {
                id: 'outdoor_dining',
                name: 'Outdoor Dining',
                description: 'Scenic picnic areas and restaurants',
                icon: '🍽️',
                cost: 20000,
                happinessBonus: 16,
                popularity: 8
            },
            {
                id: 'sunset_viewing',
                name: 'Sunset Viewing',
                description: 'Spectacular sunset viewpoints',
                icon: '🌅',
                cost: 40000,
                happinessBonus: 35,
                popularity: 4
            },
            {
                id: 'yoga_classes',
                name: 'Yoga Classes',
                description: 'Outdoor yoga and meditation',
                icon: '🧘',
                cost: 12000,
                happinessBonus: 14,
                popularity: 7
            },
            {
                id: 'cave_exploration',
                name: 'Cave Exploration',
                description: 'Explore limestone caves',
                icon: '🕳️',
                cost: 22000,
                happinessBonus: 18,
                popularity: 6
            }
        ];
    }
    
    setGameState(gameState) {
        this.gameState = gameState;
    }
    
    initializeActivities(campsite) {
        // Start with a few basic activities for the campsite
        if (window.gameMode === 'earth') {
            this.addActivityToCampsite(campsite, 'campfire_stories');
            this.addActivityToCampsite(campsite, 'wildlife_viewing');
        } else {
            this.addActivityToCampsite(campsite, 'neural_storytelling');
            this.addActivityToCampsite(campsite, 'alien_wildlife');
        }
    }
    
    addActivityToCampsite(campsite, activityId) {
        const activityData = this.getAvailableActivities().find(a => a.id === activityId);
        if (!activityData) return false;
        
        const activity = {
            ...activityData,
            installed: true,
            popularity: activityData.popularity,
            satisfaction: 100
        };
        
        if (!campsite.activities) {
            campsite.activities = [];
        }
        campsite.activities.push(activity);
        return true;
    }
    
    getCampsiteActivities(campsite) {
        return campsite.activities || [];
    }
    
    getAvailableActivitiesForCampsite(campsite) {
        const installedActivities = this.getCampsiteActivities(campsite);
        return this.getAvailableActivities().filter(activity => 
            !installedActivities.some(installed => installed.id === activity.id)
        );
    }
    
    getTotalActivitiesForCampsite(campsite) {
        return this.getCampsiteActivities(campsite).length;
    }
    
    getActivityVarietyForCampsite(campsite) {
        return this.getCampsiteActivities(campsite).length;
    }
    
    getActivityById(campsite, id) {
        return this.getCampsiteActivities(campsite).find(a => a.id === id);
    }
    
    purchaseActivityForCampsite(campsite, activityId) {
        const activityData = this.getAvailableActivities().find(a => a.id === activityId);
        if (!activityData) return false;
        
        // Check if game is available
        if (!window.game || !window.game.getGameState) {
            console.error('Game not available for activity purchase');
            return false;
        }
        
        if (window.game.getGameState().money >= activityData.cost) {
            window.game.getGameState().money -= activityData.cost;
            this.addActivityToCampsite(campsite, activityId);
            window.game.addMessage(`Added ${activityData.name} activity to ${campsite.name} for $${activityData.cost}`);
            return true;
        } else {
            window.game.addMessage("Not enough money to purchase activity!");
            return false;
        }
    }
    
    getTotalHappinessBonusForCampsite(campsite) {
        return this.getCampsiteActivities(campsite).reduce((total, activity) => {
            return total + (activity.happinessBonus * (activity.satisfaction / 100));
        }, 0);
    }
    
    getActivityPopularityForCampsite(campsite) {
        return this.getCampsiteActivities(campsite).reduce((total, activity) => total + activity.popularity, 0);
    }
    
    // Simulate activity satisfaction changes over time for a campsite
    updateActivitySatisfactionForCampsite(campsite) {
        this.getCampsiteActivities(campsite).forEach(activity => {
            // Random satisfaction changes
            const change = (Math.random() - 0.5) * 10;
            activity.satisfaction = Math.max(0, Math.min(100, activity.satisfaction + change));
            
            // Popularity affects satisfaction
            if (activity.popularity > 8) {
                activity.satisfaction = Math.min(100, activity.satisfaction + 2);
            }
        });
    }
    
    // Get activities suitable for specific campsites
    getSuitableActivitiesForCampsite(campsite) {
        const suitableActivities = [];
        
        this.getAvailableActivities().forEach(activity => {
            let suitable = true;
            
            // Check elevation requirements
            if (activity.id === 'gravity_parks' && campsite.elevation < 6000) {
                suitable = false;
            }
            
            if (activity.id === 'crystal_lakes' && campsite.elevation > 8000) {
                suitable = false;
            }
            
            if (suitable) {
                suitableActivities.push(activity);
            }
        });
        
        return suitableActivities;
    }
    
    // Get activity recommendations based on campsite features
    getActivityRecommendations(campsite) {
        const recommendations = [];
        
        // Water-based activities for campsites near water
        if (campsite.facilities.includes('water_source')) {
            recommendations.push('crystal_lakes');
        }
        
        // High elevation activities
        if (campsite.elevation > 7000) {
            recommendations.push('stellar_observatory');
        }
        
        // Forest activities
        if (campsite.elevation > 4000 && campsite.elevation < 7000) {
            recommendations.push('bio_luminescent_hikes');
        }
        
        return recommendations.filter((id, index, arr) => arr.indexOf(id) === index);
    }
    
    // Calculate activity revenue for a campsite
    calculateActivityRevenueForCampsite(campsite) {
        let revenue = 0;
        
        this.getCampsiteActivities(campsite).forEach(activity => {
            const baseRevenue = activity.popularity * 10;
            const satisfactionMultiplier = activity.satisfaction / 100;
            revenue += baseRevenue * satisfactionMultiplier;
        });
        
        return Math.round(revenue);
    }
    
    // Get activity statistics for a campsite
    getActivityStatsForCampsite(campsite) {
        const activities = this.getCampsiteActivities(campsite);
        return {
            totalActivities: activities.length,
            totalHappinessBonus: this.getTotalHappinessBonusForCampsite(campsite),
            totalPopularity: this.getActivityPopularityForCampsite(campsite),
            averageSatisfaction: activities.length > 0 ? 
                activities.reduce((sum, a) => sum + a.satisfaction, 0) / activities.length : 0
        };
    }
    
    getAvailableActivities() {
        // Determine which activity list to use based on current game mode
        return (window.gameMode === 'earth') ? this.earthActivities : this.futuristicActivities;
    }
} 