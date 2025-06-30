// UI manager for handling all user interface interactions
class GameUI {
    constructor() {
        this.game = null;
        this.selectedCampsite = null;
        this.eventListenersSetup = false; // Add flag to prevent duplicate setup
        this.setupEventListeners();
    }
    
    initialize(game) {
        console.log('Initializing UI with game:', game);
        this.game = game;
        this.setupTabs();
        this.setupModals();
        this.setupEventListeners(); // Move this here after game is set
        
        // Ensure route modal is hidden on startup
        const routeModal = document.getElementById('route-modal');
        if (routeModal) {
            routeModal.style.display = 'none';
        }
        
        this.updateAll();
        console.log('UI initialization complete');
    }
    
    setupEventListeners() {
        // Prevent duplicate setup
        if (this.eventListenersSetup) {
            console.log('Event listeners already setup, skipping...');
            return;
        }
        
        console.log('Setting up event listeners...');
        
        // Game control buttons
        const nextWeekBtn = document.getElementById('next-week');
        const nextYearBtn = document.getElementById('next-year');
        const hireGuideBtn = document.getElementById('hire-guide');
        const hireMaintenanceBtn = document.getElementById('hire-maintenance');
        const createRouteBtn = document.getElementById('create-route');
        const startGameBtn = document.getElementById('start-game');
        
        console.log('Found buttons:', { nextWeekBtn, nextYearBtn, hireGuideBtn, hireMaintenanceBtn, createRouteBtn, startGameBtn });
        
        // Remove any existing listeners by cloning and replacing elements
        const newNextWeekBtn = nextWeekBtn.cloneNode(true);
        const newNextYearBtn = nextYearBtn.cloneNode(true);
        const newHireGuideBtn = hireGuideBtn.cloneNode(true);
        const newHireMaintenanceBtn = hireMaintenanceBtn.cloneNode(true);
        const newCreateRouteBtn = createRouteBtn.cloneNode(true);
        const newStartGameBtn = startGameBtn.cloneNode(true);
        
        nextWeekBtn.parentNode.replaceChild(newNextWeekBtn, nextWeekBtn);
        nextYearBtn.parentNode.replaceChild(newNextYearBtn, nextYearBtn);
        hireGuideBtn.parentNode.replaceChild(newHireGuideBtn, hireGuideBtn);
        hireMaintenanceBtn.parentNode.replaceChild(newHireMaintenanceBtn, hireMaintenanceBtn);
        createRouteBtn.parentNode.replaceChild(newCreateRouteBtn, createRouteBtn);
        startGameBtn.parentNode.replaceChild(newStartGameBtn, startGameBtn);
        
        newStartGameBtn.addEventListener('click', () => {
            console.log('Start game button clicked');
            if (this.game) {
                this.game.startGame();
            } else {
                console.error('Game not initialized');
            }
        });
        
        newNextWeekBtn.addEventListener('click', () => {
            console.log('Next week button clicked');
            if (this.game) {
                // Toggle auto-progression instead of manually advancing
                if (this.game.gameState.autoProgress) {
                    this.game.pauseAutoProgress();
                } else {
                    this.game.resumeAutoProgress();
                }
            } else {
                console.error('Game not initialized');
            }
        });
        
        newNextYearBtn.addEventListener('click', () => {
            console.log('Next year button clicked');
            if (this.game) {
                this.game.completeYear();
            } else {
                console.error('Game not initialized');
            }
        });
        
        newHireGuideBtn.addEventListener('click', () => {
            console.log('Hire guide button clicked');
            if (this.game) {
                this.game.hireStaff('guide');
            } else {
                console.error('Game not initialized');
            }
        });
        
        newHireMaintenanceBtn.addEventListener('click', () => {
            console.log('Hire maintenance button clicked');
            if (this.game) {
                this.game.hireStaff('maintenance');
            } else {
                console.error('Game not initialized');
            }
        });
        
        newCreateRouteBtn.addEventListener('click', () => {
            console.log('Create route button clicked');
            if (this.game) {
                this.showRouteModal();
            } else {
                console.error('Game not initialized');
            }
        });
        
        // Canvas click for campsite selection
        const canvas = document.getElementById('mountainCanvas');
        canvas.addEventListener('click', (e) => {
            console.log('Canvas clicked');
            if (this.game) {
                this.handleCanvasClick(e);
            } else {
                console.error('Game not initialized');
            }
        });
        
        this.eventListenersSetup = true; // Mark as setup
        console.log('Event listeners setup complete');
    }
    
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked tab
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                // Update tab content
                this.updateTabContent(targetTab);
            });
        });
    }
    
    setupModals() {
        const modal = document.getElementById('route-modal');
        const closeBtn = modal.querySelector('.close');
        const createBtn = document.getElementById('create-route-confirm');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        createBtn.addEventListener('click', () => {
            this.createRoute();
        });
    }
    
    handleCanvasClick(e) {
        const canvas = document.getElementById('mountainCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        
        // Convert to terrain coordinates
        const terrainX = x * 100 / canvas.width;
        const terrainY = y * 100 / canvas.height;
        
        const campsite = this.game.getCampsiteManager().getCampsiteAtPosition(terrainX, terrainY);
        if (campsite) {
            this.selectCampsite(campsite);
        }
    }
    
    selectCampsite(campsite) {
        this.selectedCampsite = campsite;
        this.updateCampsiteDetails();
    }
    
    showRouteModal() {
        const modal = document.getElementById('route-modal');
        const fromSelect = document.getElementById('route-from');
        const toSelect = document.getElementById('route-to');
        
        // Populate campsite dropdowns
        const campsites = this.game.getCampsiteManager().getCampsiteNames();
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        
        campsites.forEach(campsite => {
            const option1 = document.createElement('option');
            option1.value = campsite;
            option1.textContent = campsite;
            fromSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = campsite;
            option2.textContent = campsite;
            toSelect.appendChild(option2);
        });
        
        // Add event listener to filter "to" dropdown based on "from" selection
        fromSelect.addEventListener('change', () => {
            const selectedFrom = fromSelect.value;
            toSelect.innerHTML = '';
            
            campsites.forEach(campsite => {
                // Don't show the same campsite or campsites that already have routes
                if (campsite !== selectedFrom && !this.game.getRouteManager().routeExists(selectedFrom, campsite)) {
                    const option = document.createElement('option');
                    option.value = campsite;
                    option.textContent = campsite;
                    toSelect.appendChild(option);
                }
            });
        });
        
        // Trigger initial filter
        fromSelect.dispatchEvent(new Event('change'));
        
        modal.style.display = 'flex';
    }
    
    createRoute() {
        const from = document.getElementById('route-from').value;
        const to = document.getElementById('route-to').value;
        const difficulty = document.getElementById('route-difficulty').value;
        const distance = parseInt(document.getElementById('route-distance').value);
        
        if (from === to) {
            this.addMessage("Cannot create route to the same campsite!");
            return;
        }
        
        // Check if route already exists
        if (this.game.getRouteManager().routeExists(from, to)) {
            this.addMessage(`Route already exists between ${from} and ${to}!`);
            return;
        }
        
        const route = this.game.getRouteManager().createRoute(from, to, difficulty, distance);
        if (route) {
            this.addMessage(`Created route from ${from} to ${to} for $${route.cost}`);
            this.updateRoutesList();
            // Re-render the mountain to show the new route
            if (this.game.getMountain()) {
                this.game.getMountain().render();
            }
        } else {
            this.addMessage("Failed to create route!");
        }
        
        // Close modal
        document.getElementById('route-modal').style.display = 'none';
    }
    
    updateAll() {
        if (!this.game) return;
        
        this.updateGameStats(this.game.getGameState());
        this.updateStaffCount(this.game.getGameState().staff);
        this.updateStartButton();
        this.updateControlButtons(this.game.getGameState());
    }
    
    updateGameStats(gameState = null) {
        const state = gameState || this.game.getGameState();
        
        console.log('Updating game stats with state:', state);
        console.log('Updating week display to:', state.week);
        
        document.getElementById('year').textContent = state.year;
        document.getElementById('week').textContent = state.week;
        document.getElementById('money').textContent = `$${state.money.toLocaleString()}`;
        document.getElementById('total-visitors').textContent = state.totalVisitors.toLocaleString();
        document.getElementById('avg-happiness').textContent = `${state.avgHappiness}%`;
        document.getElementById('current-week').textContent = state.week;
        document.getElementById('weekly-visitors').textContent = state.weeklyVisitors;
        document.getElementById('weekly-revenue').textContent = `$${state.weeklyRevenue.toLocaleString()}`;
        
        console.log('Week elements updated. Current values:');
        console.log('week element:', document.getElementById('week').textContent);
        console.log('current-week element:', document.getElementById('current-week').textContent);
        
        // Add year counter
        const yearsRemaining = 10 - state.year;
        const yearCounter = document.getElementById('year-counter');
        if (yearCounter) {
            yearCounter.textContent = `Years Remaining: ${Math.max(0, yearsRemaining)}`;
            if (yearsRemaining <= 2) {
                yearCounter.style.color = '#dc2626';
                yearCounter.style.fontWeight = 'bold';
            } else if (yearsRemaining <= 5) {
                yearCounter.style.color = '#f97316';
            }
        }
        
        // Update game phase indicators
        this.updateGamePhaseIndicators(state);
        
        // Update control buttons based on game phase
        this.updateControlButtons(state);
    }
    
    updateGamePhaseIndicators(state) {
        // Remove existing indicators
        const existingIndicators = document.querySelectorAll('.auto-progress-indicator, .game-phase-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
        
        // Add auto-progression indicator
        if (state.autoProgress && state.gamePhase === 'active') {
            const autoIndicator = document.createElement('div');
            autoIndicator.className = 'auto-progress-indicator';
            autoIndicator.textContent = '⏱️ Auto Progressing';
            document.body.appendChild(autoIndicator);
        }
        
        // Add game phase indicator
        const phaseIndicator = document.createElement('div');
        phaseIndicator.className = `game-phase-indicator ${state.gamePhase}`;
        phaseIndicator.textContent = state.gamePhase === 'active' ? '🏔️ Active Season' : '📋 Planning Phase';
        document.body.appendChild(phaseIndicator);
        
        // Add week progress bar during active phase
        if (state.gamePhase === 'active') {
            this.updateWeekProgressBar(state.week);
        }
    }
    
    updateWeekProgressBar(week) {
        // Remove existing progress bar
        const existingBar = document.querySelector('.week-progress');
        if (existingBar) {
            existingBar.remove();
        }
        
        // Add progress bar to management section
        const managementSection = document.querySelector('.management-section');
        if (managementSection) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'week-progress';
            progressContainer.innerHTML = '<div class="week-progress-bar"></div>';
            
            // Insert after the session info
            const sessionInfo = managementSection.querySelector('.session-info');
            if (sessionInfo) {
                sessionInfo.parentNode.insertBefore(progressContainer, sessionInfo.nextSibling);
            }
        }
    }
    
    updateControlButtons(state) {
        const nextWeekBtn = document.getElementById('next-week');
        const nextYearBtn = document.getElementById('next-year');
        const hireGuideBtn = document.getElementById('hire-guide');
        const hireMaintenanceBtn = document.getElementById('hire-maintenance');
        const createRouteBtn = document.getElementById('create-route');
        
        // Disable all controls if game hasn't started
        if (!state.gameStarted) {
            [nextWeekBtn, nextYearBtn, hireGuideBtn, hireMaintenanceBtn, createRouteBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = true;
                    btn.classList.add('controls-disabled');
                }
            });
            return;
        }
        
        if (state.gamePhase === 'planning') {
            // Disable all buttons during planning phase
            [nextWeekBtn, nextYearBtn, hireGuideBtn, hireMaintenanceBtn, createRouteBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = true;
                    btn.classList.add('controls-disabled');
                }
            });
        } else {
            // Enable buttons during active phase
            [nextWeekBtn, nextYearBtn, hireGuideBtn, hireMaintenanceBtn, createRouteBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('controls-disabled');
                }
            });
            
            // Update button text based on auto-progression
            if (nextWeekBtn) {
                nextWeekBtn.textContent = state.autoProgress ? '⏸️ Pause Auto Progress' : '▶️ Resume Auto Progress';
            }
        }
    }
    
    updateStaffCount(staff = null) {
        const staffData = staff || this.game.getGameState().staff;
        const totalStaff = staffData.guides + staffData.maintenance;
        document.getElementById('staff-count').textContent = `Staff: ${totalStaff}`;
    }
    
    updateTabContent(tabName) {
        switch (tabName) {
            case 'routes':
                this.updateRoutesList();
                break;
            case 'activities':
                this.updateActivitiesList();
                break;
            case 'upgrades':
                this.updateUpgradesList();
                break;
        }
    }
    
    updateRoutesList() {
        const routesList = document.getElementById('routes-list');
        const routes = this.game.getRouteManager().getRoutes();
        
        if (routes.length === 0) {
            routesList.innerHTML = '<p>No routes created yet. Click "Create New Route" to start!</p>';
            return;
        }
        
        let html = '<div class="routes-grid">';
        routes.forEach(route => {
            const color = this.getDifficultyColor(route.difficulty);
            html += `
                <div class="route-card" style="border-left: 4px solid ${color}">
                    <h4>${route.from} → ${route.to}</h4>
                    <p><strong>Difficulty:</strong> ${route.difficulty}</p>
                    <p><strong>Distance:</strong> ${route.distance} miles</p>
                    <p><strong>Quality:</strong> ${route.quality}%</p>
                    <p><strong>Maintenance:</strong> ${route.maintenance}%</p>
                    <button onclick="window.game.getRouteManager().upgradeRoute(${route.id})" 
                            class="secondary-button">Upgrade</button>
                </div>
            `;
        });
        html += '</div>';
        
        routesList.innerHTML = html;
    }
    
    updateActivitiesList() {
        const container = document.getElementById('activities-container');
        const activities = this.game.getActivityManager().getActivities();
        const available = this.game.getActivityManager().getAvailableActivities();
        
        let html = '<h4>Installed Activities</h4>';
        if (activities.length === 0) {
            html += '<p>No activities installed yet.</p>';
        } else {
            html += '<div class="activities-grid">';
            activities.forEach(activity => {
                html += `
                    <div class="activity-card">
                        <div class="activity-icon">${activity.icon}</div>
                        <h4>${activity.name}</h4>
                        <p>${activity.description}</p>
                        <p><strong>Happiness:</strong> +${activity.happinessBonus}</p>
                        <p><strong>Satisfaction:</strong> ${Math.round(activity.satisfaction)}%</p>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '<h4>Available Activities</h4>';
        if (available.length === 0) {
            html += '<p>All activities have been purchased!</p>';
        } else {
            html += '<div class="activities-grid">';
            available.forEach(activity => {
                html += `
                    <div class="activity-card">
                        <div class="activity-icon">${activity.icon}</div>
                        <h4>${activity.name}</h4>
                        <p>${activity.description}</p>
                        <p><strong>Cost:</strong> $${activity.cost}</p>
                        <p><strong>Happiness:</strong> +${activity.happinessBonus}</p>
                        <button onclick="window.game.getActivityManager().purchaseActivity('${activity.id}')" 
                                class="primary-button">Purchase</button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
    }
    
    updateUpgradesList() {
        const container = document.getElementById('upgrades-container');
        const upgrades = this.game.getUpgradeManager().getUpgrades();
        const available = this.game.getUpgradeManager().getAvailableUpgrades();
        
        let html = '<h4>Installed Upgrades</h4>';
        if (upgrades.length === 0) {
            html += '<p>No upgrades installed yet.</p>';
        } else {
            html += '<div class="upgrades-grid">';
            upgrades.forEach(upgrade => {
                html += `
                    <div class="upgrade-item">
                        <div>
                            <h4>${upgrade.name}</h4>
                            <p>${upgrade.description}</p>
                            <p><strong>Level:</strong> ${upgrade.level}</p>
                            <p><strong>Effectiveness:</strong> ${Math.round(upgrade.effectiveness)}%</p>
                        </div>
                        <button onclick="window.game.getUpgradeManager().upgradeExisting('${upgrade.id}')" 
                                class="secondary-button">Upgrade</button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '<h4>Available Upgrades</h4>';
        if (available.length === 0) {
            html += '<p>All upgrades have been purchased!</p>';
        } else {
            html += '<div class="upgrades-grid">';
            available.forEach(upgrade => {
                html += `
                    <div class="upgrade-item">
                        <div>
                            <h4>${upgrade.name}</h4>
                            <p>${upgrade.description}</p>
                            <p><strong>Cost:</strong> $${upgrade.cost}</p>
                            <p><strong>Happiness:</strong> +${upgrade.happinessBonus}</p>
                        </div>
                        <button onclick="window.game.getUpgradeManager().purchaseUpgrade('${upgrade.id}')" 
                                class="primary-button">Purchase</button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
    }
    
    updateCampsiteDetails() {
        const details = document.getElementById('campsite-details');
        
        if (!this.selectedCampsite) {
            details.innerHTML = '<p>Click on a campsite to view details</p>';
            return;
        }
        
        const campsite = this.selectedCampsite;
        let html = `
            <h4>${campsite.name}</h4>
            <p><strong>Elevation:</strong> ${campsite.elevation} ft</p>
            <p><strong>Capacity:</strong> ${campsite.capacity} people</p>
            <p><strong>Rating:</strong> ${campsite.rating.toFixed(1)} ⭐</p>
            <p><strong>Popularity:</strong> ${campsite.popularity} visitors</p>
            <h5>Facilities:</h5>
            <ul>
        `;
        
        campsite.facilities.forEach(facility => {
            html += `<li>${this.getFacilityName(facility)}</li>`;
        });
        
        html += '</ul>';
        details.innerHTML = html;
    }
    
    getFacilityName(facility) {
        const names = {
            'tent_sites': 'Tent Sites',
            'water_source': 'Water Source',
            'fire_rings': 'Fire Rings',
            'picnic_tables': 'Picnic Tables',
            'bear_lockers': 'Bear Lockers',
            'outhouse': 'Restrooms',
            'shower_house': 'Shower House',
            'camp_store': 'Camp Store',
            'emergency_shelter': 'Emergency Shelter'
        };
        return names[facility] || facility;
    }
    
    getDifficultyColor(difficulty) {
        switch (difficulty) {
            case 'easy': return '#4ade80';
            case 'moderate': return '#fbbf24';
            case 'difficult': return '#f97316';
            case 'expert': return '#dc2626';
            default: return '#6b7280';
        }
    }
    
    addMessage(message) {
        const messagesContainer = document.getElementById('game-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Remove old messages if too many
        while (messagesContainer.children.length > 10) {
            messagesContainer.removeChild(messagesContainer.firstChild);
        }
    }
    
    updateStartButton() {
        const startGameBtn = document.getElementById('start-game');
        const gameStatus = document.getElementById('game-status');
        
        if (this.game && this.game.getGameState().gameStarted) {
            startGameBtn.textContent = '✅ Game Started';
            startGameBtn.disabled = true;
            startGameBtn.classList.add('disabled');
            gameStatus.textContent = 'Game is running - auto-progression active';
            gameStatus.style.color = '#10b981';
        } else {
            startGameBtn.textContent = '🚀 Start Game';
            startGameBtn.disabled = false;
            startGameBtn.classList.remove('disabled');
            gameStatus.textContent = 'Game not started yet';
            gameStatus.style.color = '#6b7280';
        }
    }
} 