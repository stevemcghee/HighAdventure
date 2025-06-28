// Main game controller
class HighAdventureGame {
    constructor() {
        this.gameState = {
            year: 1,
            week: 1,
            money: 50000,
            totalVisitors: 0,
            avgHappiness: 0,
            weeklyVisitors: 0,
            weeklyRevenue: 0,
            staff: {
                guides: 0,
                maintenance: 0
            }
        };
        
        this.mountain = new MountainGenerator();
        this.campsiteManager = new CampsiteManager();
        this.routeManager = new RouteManager();
        this.activityManager = new ActivityManager();
        this.upgradeManager = new UpgradeManager();
        this.ui = new GameUI();
        
        this.init();
    }
    
    init() {
        this.mountain.generateMountain();
        this.campsiteManager.generateCampsites(this.mountain);
        this.activityManager.initializeActivities();
        this.upgradeManager.initializeUpgrades();
        this.ui.initialize(this);
        this.updateUI();
        this.addMessage("Welcome to High Adventure! Your backpacking camp is ready for visitors.");
    }
    
    nextWeek() {
        if (this.gameState.week >= 10) {
            this.completeYear();
            return;
        }
        
        this.gameState.week++;
        this.processWeeklyVisitors();
        this.updateUI();
    }
    
    completeYear() {
        this.gameState.year++;
        this.gameState.week = 1;
        this.processYearEnd();
        this.updateUI();
        this.addMessage(`Year ${this.gameState.year - 1} complete! Starting year ${this.gameState.year}.`);
    }
    
    processWeeklyVisitors() {
        const baseVisitors = 10 + (this.gameState.year - 1) * 5;
        const routeBonus = this.routeManager.getTotalRoutes() * 2;
        const activityBonus = this.activityManager.getTotalActivities() * 3;
        const staffBonus = this.gameState.staff.guides * 5;
        
        this.gameState.weeklyVisitors = Math.floor(baseVisitors + routeBonus + activityBonus + staffBonus);
        this.gameState.totalVisitors += this.gameState.weeklyVisitors;
        
        // Calculate revenue
        const basePrice = 50;
        const routePrice = this.routeManager.getAverageRoutePrice();
        this.gameState.weeklyRevenue = this.gameState.weeklyVisitors * (basePrice + routePrice);
        this.gameState.money += this.gameState.weeklyRevenue;
        
        // Calculate happiness
        this.calculateHappiness();
        
        this.addMessage(`Week ${this.gameState.week}: ${this.gameState.weeklyVisitors} visitors, $${this.gameState.weeklyRevenue} revenue`);
    }
    
    processYearEnd() {
        // Staff costs
        const staffCost = (this.gameState.staff.guides * 5000) + (this.gameState.staff.maintenance * 3000);
        this.gameState.money -= staffCost;
        
        // Year-end bonuses
        if (this.gameState.avgHappiness > 80) {
            const bonus = Math.floor(this.gameState.totalVisitors * 10);
            this.gameState.money += bonus;
            this.addMessage(`High satisfaction bonus: +$${bonus}`);
        }
    }
    
    calculateHappiness() {
        let happiness = 50; // Base happiness
        
        // Route quality bonus
        const routeQuality = this.routeManager.getAverageRouteQuality();
        happiness += routeQuality * 10;
        
        // Activity variety bonus
        const activityVariety = this.activityManager.getActivityVariety();
        happiness += activityVariety * 5;
        
        // Staff bonus
        happiness += this.gameState.staff.guides * 3;
        happiness += this.gameState.staff.maintenance * 2;
        
        // Upgrade bonus
        const upgradeBonus = this.upgradeManager.getTotalUpgradeBonus();
        happiness += upgradeBonus;
        
        happiness = Math.min(100, Math.max(0, happiness));
        this.gameState.avgHappiness = Math.round(happiness);
    }
    
    hireStaff(type) {
        const cost = type === 'guide' ? 5000 : 3000;
        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            if (type === 'guide') {
                this.gameState.staff.guides++;
            } else {
                this.gameState.staff.maintenance++;
            }
            this.addMessage(`Hired ${type} staff member for $${cost}`);
            this.updateUI();
        } else {
            this.addMessage("Not enough money to hire staff!");
        }
    }
    
    addMessage(message) {
        this.ui.addMessage(message);
    }
    
    updateUI() {
        this.ui.updateGameStats(this.gameState);
        this.ui.updateStaffCount(this.gameState.staff);
    }
    
    getGameState() {
        return this.gameState;
    }
    
    getMountain() {
        return this.mountain;
    }
    
    getCampsiteManager() {
        return this.campsiteManager;
    }
    
    getRouteManager() {
        return this.routeManager;
    }
    
    getActivityManager() {
        return this.activityManager;
    }
    
    getUpgradeManager() {
        return this.upgradeManager;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new HighAdventureGame();
}); 