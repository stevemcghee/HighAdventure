// Activity manager for campsite activities
class ActivityManager {
    constructor() {
        this.gameState = null;
        this.availableActivities = [
            {
                id: 'fishing',
                name: 'Fishing',
                description: 'Catch trout in mountain streams',
                icon: '🎣',
                cost: 2000,
                happinessBonus: 15,
                popularity: 8
            },
            {
                id: 'rock_climbing',
                name: 'Rock Climbing',
                description: 'Scale granite cliffs with guides',
                icon: '🧗',
                cost: 5000,
                happinessBonus: 25,
                popularity: 6
            },
            {
                id: 'wildlife_viewing',
                name: 'Wildlife Viewing',
                description: 'Spot bears, elk, and eagles',
                icon: '🦅',
                cost: 1500,
                happinessBonus: 10,
                popularity: 9
            },
            {
                id: 'stargazing',
                name: 'Stargazing',
                description: 'Clear mountain night skies',
                icon: '⭐',
                cost: 1000,
                happinessBonus: 8,
                popularity: 7
            },
            {
                id: 'photography',
                name: 'Photography',
                description: 'Capture stunning landscapes',
                icon: '📸',
                cost: 3000,
                happinessBonus: 12,
                popularity: 8
            },
            {
                id: 'campfire_stories',
                name: 'Campfire Stories',
                description: 'Evening storytelling sessions',
                icon: '🔥',
                cost: 500,
                happinessBonus: 5,
                popularity: 10
            },
            {
                id: 'nature_hikes',
                name: 'Nature Hikes',
                description: 'Guided educational walks',
                icon: '🌲',
                cost: 2500,
                happinessBonus: 18,
                popularity: 9
            },
            {
                id: 'swimming',
                name: 'Swimming',
                description: 'Cool off in mountain lakes',
                icon: '🏊',
                cost: 1500,
                happinessBonus: 12,
                popularity: 8
            },
            {
                id: 'bird_watching',
                name: 'Bird Watching',
                description: 'Observe diverse bird species',
                icon: '🦜',
                cost: 1200,
                happinessBonus: 10,
                popularity: 7
            },
            {
                id: 'mountain_biking',
                name: 'Mountain Biking',
                description: 'Ride challenging trails',
                icon: '🚴',
                cost: 4000,
                happinessBonus: 20,
                popularity: 6
            }
        ];
    }
    
    setGameState(gameState) {
        this.gameState = gameState;
    }
    
    initializeActivities(campsite) {
        // Start with a few basic activities for the campsite
        this.addActivityToCampsite(campsite, 'campfire_stories');
        this.addActivityToCampsite(campsite, 'wildlife_viewing');
    }
    
    addActivityToCampsite(campsite, activityId) {
        const activityData = this.availableActivities.find(a => a.id === activityId);
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
        return this.availableActivities.filter(activity => 
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
        const activityData = this.availableActivities.find(a => a.id === activityId);
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
        
        this.availableActivities.forEach(activity => {
            let suitable = true;
            
            // Check elevation requirements
            if (activity.id === 'rock_climbing' && campsite.elevation < 6000) {
                suitable = false;
            }
            
            if (activity.id === 'swimming' && campsite.elevation > 8000) {
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
            recommendations.push('fishing', 'swimming');
        }
        
        // High elevation activities
        if (campsite.elevation > 7000) {
            recommendations.push('stargazing', 'photography');
        }
        
        // Forest activities
        if (campsite.elevation > 4000 && campsite.elevation < 7000) {
            recommendations.push('wildlife_viewing', 'bird_watching', 'nature_hikes');
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
} 