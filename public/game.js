// Main game controller
class HighAdventureGame {
    constructor() {
        this.gameState = {
            year: 1,
            week: 1,
            money: 50000,
            totalVisitors: 0,
            avgHappiness: 50,
            weeklyVisitors: 0,
            weeklyRevenue: 0,
            staff: {
                guides: 0,
                maintenance: 0
            },
            gamePhase: 'active', // 'active' or 'planning'
            autoProgress: false, // Changed to false initially
            planningChoices: [],
            gameStarted: false // New state to track if game has started
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
        console.log('Initializing High Adventure Game...');
        this.mountain.generateMountain();
        this.campsiteManager.generateCampsites(this.mountain);
        
        // Generate day hikes after campsites are added
        this.mountain.generateDayHikes();
        
        // Create initial connected routes
        this.createInitialRoutes();
        
        // Ensure mountain is rendered with initial routes
        if (this.mountain) {
            console.log('Rendering mountain with initial routes...');
            this.mountain.render();
            
            // Force multiple renders to ensure routes are visible
            setTimeout(() => {
                console.log('Re-rendering mountain to ensure initial routes are visible');
                this.mountain.render();
            }, 100);
            
            setTimeout(() => {
                console.log('Final render to ensure initial routes are visible');
                this.mountain.render();
            }, 500);
        }
        
        // Debug: Check if routeManager has the method
        console.log('RouteManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.routeManager)));
        console.log('RouteManager setCampsiteManager exists:', typeof this.routeManager.setCampsiteManager);
        
        // Temporarily comment out to test
        // this.routeManager.setCampsiteManager(this.campsiteManager);
        
        this.activityManager.setGameState(this.gameState);
        this.upgradeManager.setGameState(this.gameState);
        
        // Initialize some basic activities and upgrades for each campsite
        this.campsiteManager.getCampsites().forEach(campsite => {
            this.activityManager.initializeActivities(campsite);
            this.upgradeManager.initializeUpgrades(campsite);
        });
        
        this.ui.initialize(this);
        
        // Update UI to show initial routes and trails
        this.ui.updateRoutesList();
        this.ui.updateTrailsList();
        
        // Don't start auto-progression automatically
        // this.startAutoProgress();
        
        console.log('Game initialized successfully:', this);
        this.addMessage("Welcome to High Adventure! Click 'Start Game' to begin your backpacking camp adventure.");
    }
    
    createInitialRoutes() {
        const campsites = this.campsiteManager.getCampsites();
        console.log(`Creating initial routes with ${campsites.length} campsites:`, campsites.map(c => c.name));
        
        if (campsites.length < 3) {
            console.log('Not enough campsites to create initial routes');
            return;
        }
        
        // Create 3 connected routes in a triangle pattern with calculated distances
        console.log('Creating initial route 1...');
        const route1 = this.routeManager.createRoute(
            campsites[0].name, 
            campsites[1].name, 
            'moderate',
            null,
            this.mountain
        );
        
        console.log('Creating initial route 2...');
        const route2 = this.routeManager.createRoute(
            campsites[1].name, 
            campsites[2].name, 
            'easy',
            null,
            this.mountain
        );
        
        console.log('Creating initial route 3...');
        const route3 = this.routeManager.createRoute(
            campsites[2].name, 
            campsites[0].name, 
            'difficult',
            null,
            this.mountain
        );
        
        if (route1 && route2 && route3) {
            console.log('Successfully created all initial routes:', route1, route2, route3);
            console.log(`Total routes in manager: ${this.routeManager.getRoutes().length}`);
            this.addMessage(`Created initial trail network: ${route1.name} (${route1.distance}mi), ${route2.name} (${route2.distance}mi), and ${route3.name} (${route3.distance}mi)`);
        } else {
            console.log('Failed to create some initial routes');
            console.log('Route creation results:', { route1, route2, route3 });
        }
    }
    
    startGame() {
        if (!this.gameState.gameStarted) {
            this.gameState.gameStarted = true;
            this.gameState.autoProgress = true;
            this.addMessage("Game started! Your backpacking camp is now open for visitors.");
            this.startAutoProgress();
            this.ui.updateStartButton();
        }
    }
    
    startAutoProgress() {
        if (this.gameState.autoProgress && this.gameState.gamePhase === 'active' && this.gameState.gameStarted) {
            setTimeout(() => {
                this.nextWeek();
            }, 2000); // Progress every 2 seconds
        }
    }
    
    nextWeek() {
        console.log(`Next Week clicked. Current week: ${this.gameState.week}`);
        this.gameState.week++;
        console.log(`Week incremented to: ${this.gameState.week}`);
        
        // Send multiplayer action
        this.sendMultiplayerAction('next-week');
        
        // Check if we've completed a year (after week 10)
        if (this.gameState.week > 10) {
            console.log('Year complete, entering planning phase');
            this.enterPlanningPhase();
            return;
        }
        
        // Only process visitors if we didn't complete a year
        console.log('Processing weekly visitors for week:', this.gameState.week);
        this.processWeeklyVisitors();
        this.updateUI();
        
        // Continue auto-progression
        this.startAutoProgress();
    }
    
    enterPlanningPhase() {
        this.gameState.gamePhase = 'planning';
        this.gameState.autoProgress = false;
        
        // Process year end
        this.processYearEnd();
        
        // Generate planning choices
        this.generatePlanningChoices();
        
        // Show planning modal
        this.showPlanningModal();
        
        this.updateUI();
        this.addMessage(`Year ${this.gameState.year} complete! Time to plan for next year.`);
    }
    
    generatePlanningChoices() {
        this.gameState.planningChoices = [];
        
        // Route opportunities - only show if no duplicate would be created
        const availableCampsites = this.campsiteManager.getCampsiteNames();
        if (availableCampsites.length >= 2) {
            // Find campsite pairs that don't already have routes
            const possibleRoutes = [];
            for (let i = 0; i < availableCampsites.length; i++) {
                for (let j = i + 1; j < availableCampsites.length; j++) {
                    const from = availableCampsites[i];
                    const to = availableCampsites[j];
                    if (!this.routeManager.routeExists(from, to)) {
                        possibleRoutes.push({ from, to });
                    }
                }
            }
            
            // Add a random route opportunity if any are available
            if (possibleRoutes.length > 0) {
                const routePair = possibleRoutes[Math.floor(Math.random() * possibleRoutes.length)];
                this.gameState.planningChoices.push({
                    type: 'route',
                    title: 'New Trail Route',
                    description: `Create a trail from ${routePair.from} to ${routePair.to}`,
                    cost: 2000,
                    effect: '+2 visitors per week',
                    action: () => {
                        const route = this.routeManager.createRoute(routePair.from, routePair.to, 'moderate', null, this.mountain);
                        if (route) {
                            this.addMessage(`Created new trail: ${route.name} (${route.distance}mi)`);
                            // Re-render the mountain to show the new route
                            if (this.mountain) {
                                this.mountain.render();
                            }
                        } else {
                            this.addMessage(`Failed to create route - duplicate may exist`);
                        }
                    }
                });
            }
        }
        
        // Activity opportunities - select a random campsite
        const campsites = this.campsiteManager.getCampsites();
        if (campsites.length > 0) {
            const selectedCampsite = campsites[Math.floor(Math.random() * campsites.length)];
            const availableActivities = this.activityManager.getAvailableActivitiesForCampsite(selectedCampsite);
            if (availableActivities.length > 0) {
                const activity = availableActivities[Math.floor(Math.random() * availableActivities.length)];
                this.gameState.planningChoices.push({
                    type: 'activity',
                    title: 'New Activity',
                    description: `Install ${activity.name} at ${selectedCampsite.name}`,
                    cost: activity.cost,
                    effect: `+${activity.happinessBonus} happiness`,
                    action: () => this.activityManager.purchaseActivityForCampsite(selectedCampsite, activity.id)
                });
            }
        }
        
        // Upgrade opportunities - select a random campsite
        if (campsites.length > 0) {
            const selectedCampsite = campsites[Math.floor(Math.random() * campsites.length)];
            const availableUpgrades = this.upgradeManager.getAvailableUpgradesForCampsite(selectedCampsite);
            if (availableUpgrades.length > 0) {
                const upgrade = availableUpgrades[Math.floor(Math.random() * availableUpgrades.length)];
                this.gameState.planningChoices.push({
                    type: 'upgrade',
                    title: 'Camp Improvement',
                    description: `Install ${upgrade.name} at ${selectedCampsite.name}`,
                    cost: upgrade.cost,
                    effect: `+${upgrade.happinessBonus} happiness`,
                    action: () => this.upgradeManager.purchaseUpgradeForCampsite(selectedCampsite, upgrade.id)
                });
            }
        }
        
        // Staff opportunities
        this.gameState.planningChoices.push({
            type: 'staff',
            title: 'Hire Guide',
            description: 'Hire an experienced mountain guide',
            cost: 5000,
            effect: '+5 visitors per week',
            action: () => this.hireStaff('guide')
        });
        
        this.gameState.planningChoices.push({
            type: 'staff',
            title: 'Hire Maintenance',
            description: 'Hire maintenance staff',
            cost: 3000,
            effect: '+2 happiness',
            action: () => this.hireStaff('maintenance')
        });
    }
    
    showPlanningModal() {
        const modalHTML = `
            <div id="planning-modal" class="modal" style="display: block;">
                <div class="modal-content" style="max-width: 800px;">
                    <h2>🏔️ Year ${this.gameState.year} Planning Phase</h2>
                    <p>Choose improvements for next year (you can select multiple):</p>
                    
                    <div class="planning-choices">
                        ${this.gameState.planningChoices.map((choice, index) => `
                            <div class="planning-choice ${this.gameState.money >= choice.cost ? '' : 'disabled'}">
                                <div class="choice-header">
                                    <h3>${choice.title}</h3>
                                    <span class="choice-cost">$${choice.cost}</span>
                                </div>
                                <p>${choice.description}</p>
                                <p class="choice-effect"><strong>Effect:</strong> ${choice.effect}</p>
                                <button onclick="window.game.selectPlanningChoice(${index})" 
                                        class="primary-button"
                                        ${this.gameState.money >= choice.cost ? '' : 'disabled'}>
                                    ${this.gameState.money >= choice.cost ? 'Select' : 'Not Enough Money'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="planning-summary">
                        <h3>Selected Improvements:</h3>
                        <div id="selected-choices"></div>
                        <p><strong>Total Cost:</strong> <span id="total-cost">$0</span></p>
                        <p><strong>Available Money:</strong> $${this.gameState.money.toLocaleString()}</p>
                    </div>
                    
                    <div class="planning-actions">
                        <button onclick="window.game.completePlanning()" class="primary-button">Complete Planning</button>
                        <button onclick="window.game.skipPlanning()" class="secondary-button">Skip Planning</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Update selected choices display
        this.updateSelectedChoices();
    }
    
    selectPlanningChoice(index) {
        const choice = this.gameState.planningChoices[index];
        if (this.gameState.money >= choice.cost) {
            choice.selected = true;
            this.gameState.money -= choice.cost;
            choice.action();
            this.updateSelectedChoices();
            this.updateUI();
        }
    }
    
    updateSelectedChoices() {
        const selectedChoices = document.getElementById('selected-choices');
        const totalCostElement = document.getElementById('total-cost');
        
        if (!selectedChoices) return;
        
        const selected = this.gameState.planningChoices.filter(c => c.selected);
        const totalCost = selected.reduce((sum, c) => sum + c.cost, 0);
        
        if (selected.length === 0) {
            selectedChoices.innerHTML = '<p>No improvements selected</p>';
        } else {
            selectedChoices.innerHTML = selected.map(choice => 
                `<div class="selected-choice">
                    <strong>${choice.title}</strong> - ${choice.description}
                </div>`
            ).join('');
        }
        
        if (totalCostElement) {
            totalCostElement.textContent = `$${totalCost.toLocaleString()}`;
        }
    }
    
    completePlanning() {
        // Apply selected choices
        const selected = this.gameState.planningChoices.filter(c => c.selected);
        selected.forEach(choice => {
            choice.action();
        });
        
        this.exitPlanningPhase();
    }
    
    skipPlanning() {
        this.exitPlanningPhase();
    }
    
    exitPlanningPhase() {
        // Remove planning modal
        const modal = document.getElementById('planning-modal');
        if (modal) {
            modal.remove();
        }
        
        // Reset for new year
        this.gameState.week = 1;
        this.gameState.year++;
        this.gameState.gamePhase = 'active';
        this.gameState.autoProgress = true;
        this.gameState.planningChoices = [];
        
        this.updateUI();
        this.addMessage(`Starting Year ${this.gameState.year}!`);
        
        // Check if game is complete (10 years)
        if (this.gameState.year > 10) {
            this.endGame();
        } else {
            // Resume auto-progression
            this.startAutoProgress();
        }
    }
    
    processWeeklyVisitors() {
        const baseVisitors = 10 + (this.gameState.year - 1) * 5;
        const routeBonus = this.routeManager.getTotalRoutes() * 2;
        
        // Calculate activity and upgrade bonuses per campsite
        let totalActivityBonus = 0;
        let totalUpgradeBonus = 0;
        this.campsiteManager.getCampsites().forEach(campsite => {
            totalActivityBonus += this.activityManager.getTotalActivitiesForCampsite(campsite) * 3;
            totalUpgradeBonus += this.upgradeManager.getTotalVisitorBonusForCampsite(campsite);
        });
        
        const staffBonus = this.gameState.staff.guides * 5;
        
        this.gameState.weeklyVisitors = Math.floor(baseVisitors + routeBonus + totalActivityBonus + totalUpgradeBonus + staffBonus);
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
        
        // Activity and upgrade bonuses per campsite
        this.campsiteManager.getCampsites().forEach(campsite => {
            const activityBonus = this.activityManager.getTotalHappinessBonusForCampsite(campsite);
            const upgradeBonus = this.upgradeManager.getTotalUpgradeBonusForCampsite(campsite);
            happiness += activityBonus + upgradeBonus;
        });
        
        // Staff bonus
        happiness += this.gameState.staff.guides * 3;
        happiness += this.gameState.staff.maintenance * 2;
        
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
            
            // Send multiplayer action
            this.sendMultiplayerAction('hire-staff', { staffType: type });
            
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
        this.ui.updateAll();
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
    
    endGame() {
        const finalScore = this.calculateFinalScore();
        this.addMessage("🎉 Game Complete! 10 years of High Adventure have passed!");
        
        // Show final score modal
        this.showFinalScoreModal(finalScore);
    }
    
    calculateFinalScore() {
        // Calculate total activities and upgrades across all campsites
        let totalActivities = 0;
        let totalUpgrades = 0;
        this.campsiteManager.getCampsites().forEach(campsite => {
            totalActivities += this.activityManager.getTotalActivitiesForCampsite(campsite);
            totalUpgrades += this.upgradeManager.getCampsiteUpgrades(campsite).length;
        });
        
        const score = {
            totalVisitors: this.gameState.totalVisitors,
            totalRevenue: this.calculateTotalRevenue(),
            avgHappiness: this.gameState.avgHappiness,
            routeScore: this.routeManager.getTotalRoutes() * 100,
            activityScore: totalActivities * 50,
            upgradeScore: totalUpgrades * 75,
            staffScore: (this.gameState.staff.guides + this.gameState.staff.maintenance) * 200,
            finalScore: 0
        };
        
        // Calculate final score
        score.finalScore = 
            score.totalVisitors * 0.1 +
            score.totalRevenue * 0.001 +
            score.avgHappiness * 100 +
            score.routeScore +
            score.activityScore +
            score.upgradeScore +
            score.staffScore;
        
        return score;
    }
    
    calculateTotalRevenue() {
        // Estimate total revenue based on current weekly revenue and years
        return this.gameState.weeklyRevenue * 10 * 10; // 10 weeks * 10 years
    }
    
    showFinalScoreModal(finalScore) {
        // Create modal HTML
        const modalHTML = `
            <div id="final-score-modal" class="modal" style="display: block;">
                <div class="modal-content" style="max-width: 600px;">
                    <h2>🏔️ High Adventure - Game Complete!</h2>
                    <h3>Final Score: ${Math.round(finalScore.finalScore).toLocaleString()}</h3>
                    
                    <div class="score-breakdown">
                        <h4>Camp Statistics:</h4>
                        <div class="score-grid">
                            <div class="score-item">
                                <span class="score-label">Total Visitors:</span>
                                <span class="score-value">${finalScore.totalVisitors.toLocaleString()}</span>
                            </div>
                            <div class="score-item">
                                <span class="score-label">Total Revenue:</span>
                                <span class="score-value">$${finalScore.totalRevenue.toLocaleString()}</span>
                            </div>
                            <div class="score-item">
                                <span class="score-label">Average Happiness:</span>
                                <span class="score-value">${finalScore.avgHappiness}%</span>
                            </div>
                            <div class="score-item">
                                <span class="score-label">Trail Routes:</span>
                                <span class="score-value">${this.routeManager.getTotalRoutes()}</span>
                            </div>
                            <div class="score-item">
                                <span class="score-label">Activities:</span>
                                <span class="score-value">${totalActivities}</span>
                            </div>
                            <div class="score-item">
                                <span class="score-label">Upgrades:</span>
                                <span class="score-value">${totalUpgrades}</span>
                            </div>
                            <div class="score-item">
                                <span class="score-label">Staff Members:</span>
                                <span class="score-value">${this.gameState.staff.guides + this.gameState.staff.maintenance}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="final-message">
                        <p>Congratulations on completing 10 years of High Adventure! You've built a successful backpacking camp that has brought joy to thousands of visitors.</p>
                        <p>Your final score reflects your success in managing visitors, revenue, happiness, and camp development.</p>
                    </div>
                    
                    <div class="modal-buttons">
                        <button onclick="location.reload()" class="primary-button">Play Again</button>
                        <button onclick="document.getElementById('final-score-modal').style.display='none'" class="secondary-button">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Disable game controls
        this.disableGameControls();
    }
    
    disableGameControls() {
        // Disable all game buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.id !== 'final-score-modal') {
                button.disabled = true;
            }
        });
    }
    
    pauseAutoProgress() {
        this.gameState.autoProgress = false;
        this.updateUI();
        this.addMessage("Auto-progression paused. Click 'Resume Auto Progress' to continue.");
    }
    
    resumeAutoProgress() {
        this.gameState.autoProgress = true;
        this.updateUI();
        this.addMessage("Auto-progression resumed.");
        this.startAutoProgress();
    }
    
    // Multiplayer integration methods
    setMultiplayerClient(client) {
        this.multiplayerClient = client;
    }
    
    sendMultiplayerAction(action, payload = {}) {
        if (this.multiplayerClient) {
            this.multiplayerClient.sendGameAction(action, payload);
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    try {
        window.game = new HighAdventureGame();
        console.log('Game initialized successfully:', window.game);
        
        // Set up multiplayer integration when available
        setTimeout(() => {
            if (window.multiplayerClient && window.game) {
                window.game.setMultiplayerClient(window.multiplayerClient);
                console.log('Multiplayer client connected to game');
            } else {
                console.log('Waiting for multiplayer client to be available...');
                // Try again after a short delay
                setTimeout(() => {
                    if (window.multiplayerClient && window.game) {
                        window.game.setMultiplayerClient(window.multiplayerClient);
                        console.log('Multiplayer client connected to game (retry)');
                    }
                }, 1000);
            }
        }, 1000);
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}); 