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
        
        if (from === to) {
            this.addMessage("Cannot create route to the same campsite!");
            return;
        }
        
        // Check if route already exists
        if (this.game.getRouteManager().routeExists(from, to)) {
            this.addMessage(`Route already exists between ${from} and ${to}!`);
            return;
        }
        
        const route = this.game.getRouteManager().createRoute(from, to, difficulty);
        if (route) {
            this.addMessage(`Created ${route.name} (${route.distance}mi) for $${route.cost}`);
            this.updateRoutesList();
            
            // Ensure mountain re-renders to show the new route
            const mountain = this.game.getMountain();
            if (mountain) {
                console.log('Re-rendering mountain after route creation');
                mountain.render();
                
                // Force a second render after a short delay to ensure it's visible
                setTimeout(() => {
                    mountain.render();
                }, 100);
            } else {
                console.warn('Mountain object not found for re-rendering');
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
        this.updateRoutesList();
        this.updateActivitiesList();
        this.updateUpgradesList();
        if (this.selectedCampsite) {
            this.updateCampsiteDetails();
        }
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
            const difficultyIcon = this.getDifficultyIcon(route.difficulty);
            html += `
                <div class="route-card" style="border-left: 4px solid ${color}">
                    <div class="route-header">
                        <h3>${route.name || 'Unnamed Trail'}</h3>
                        <span class="route-difficulty ${route.difficulty}">
                            ${difficultyIcon} ${route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)}
                        </span>
                    </div>
                    <div class="route-details">
                        <p class="route-connection"><strong>${route.from}</strong> → <strong>${route.to}</strong></p>
                        <p class="route-distance">${route.distance} miles</p>
                        <div class="route-stats">
                            <span class="stat">Quality: ${route.quality}%</span>
                            <span class="stat">Maintenance: ${route.maintenance}%</span>
                            <span class="stat">Popularity: ${route.popularity}</span>
                        </div>
                    </div>
                    ${route.features && route.features.length > 0 ? `
                        <div class="route-features">
                            <h5>Features:</h5>
                            <div class="feature-tags">
                                ${route.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <div class="route-actions">
                        <button onclick="window.game.getRouteManager().upgradeRoute(${route.id})" 
                                class="secondary-button">Upgrade</button>
                        <button onclick="window.game.getRouteManager().maintainRoute(${route.id})" 
                                class="secondary-button">Maintain</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        routesList.innerHTML = html;
    }
    
    updateActivitiesList() {
        const container = document.getElementById('activities-container');
        const campsites = this.game.getCampsiteManager().getCampsites();
        
        // Collect all activities across campsites
        const allActivities = new Map(); // activityId -> {activity, campsites: []}
        const allAvailableActivities = new Map(); // activityId -> activity
        
        campsites.forEach(campsite => {
            const activities = this.game.getActivityManager().getCampsiteActivities(campsite);
            const available = this.game.getActivityManager().getAvailableActivitiesForCampsite(campsite);
            
            activities.forEach(activity => {
                if (!allActivities.has(activity.id)) {
                    allActivities.set(activity.id, { activity, campsites: [] });
                }
                allActivities.get(activity.id).campsites.push(campsite.name);
            });
            
            available.forEach(activity => {
                if (!allAvailableActivities.has(activity.id)) {
                    allAvailableActivities.set(activity.id, activity);
                }
            });
        });
        
        let html = '<h4>Installed Activities (All Campsites)</h4>';
        if (allActivities.size === 0) {
            html += '<p>No activities installed yet.</p>';
        } else {
            html += '<div class="activities-grid">';
            allActivities.forEach(({ activity, campsites }) => {
                html += `
                    <div class="activity-card">
                        <div class="activity-icon">${activity.icon}</div>
                        <h4>${activity.name}</h4>
                        <p>${activity.description}</p>
                        <p><strong>Happiness:</strong> +${activity.happinessBonus}</p>
                        <p><strong>Satisfaction:</strong> ${Math.round(activity.satisfaction)}%</p>
                        <p><strong>Installed at:</strong> ${campsites.join(', ')}</p>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '<h4>Available Activities</h4>';
        if (allAvailableActivities.size === 0) {
            html += '<p>All activities have been purchased across all campsites!</p>';
        } else {
            html += '<div class="activities-grid">';
            allAvailableActivities.forEach(activity => {
                html += `
                    <div class="activity-card">
                        <div class="activity-icon">${activity.icon}</div>
                        <h4>${activity.name}</h4>
                        <p>${activity.description}</p>
                        <p><strong>Cost:</strong> $${activity.cost}</p>
                        <p><strong>Happiness:</strong> +${activity.happinessBonus}</p>
                        <p><em>Click on a campsite to purchase this activity</em></p>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
    }
    
    updateUpgradesList() {
        const container = document.getElementById('upgrades-container');
        const campsites = this.game.getCampsiteManager().getCampsites();
        
        // Collect all upgrades across campsites
        const allUpgrades = new Map(); // upgradeId -> {upgrade, campsites: []}
        const allAvailableUpgrades = new Map(); // upgradeId -> upgrade
        
        campsites.forEach(campsite => {
            const upgrades = this.game.getUpgradeManager().getCampsiteUpgrades(campsite);
            const available = this.game.getUpgradeManager().getAvailableUpgradesForCampsite(campsite);
            
            upgrades.forEach(upgrade => {
                if (!allUpgrades.has(upgrade.id)) {
                    allUpgrades.set(upgrade.id, { upgrade, campsites: [] });
                }
                allUpgrades.get(upgrade.id).campsites.push(campsite.name);
            });
            
            available.forEach(upgrade => {
                if (!allAvailableUpgrades.has(upgrade.id)) {
                    allAvailableUpgrades.set(upgrade.id, upgrade);
                }
            });
        });
        
        let html = '<h4>Installed Upgrades (All Campsites)</h4>';
        if (allUpgrades.size === 0) {
            html += '<p>No upgrades installed yet.</p>';
        } else {
            html += '<div class="upgrades-grid">';
            allUpgrades.forEach(({ upgrade, campsites }) => {
                html += `
                    <div class="upgrade-item">
                        <div>
                            <h4>${upgrade.name}</h4>
                            <p>${upgrade.description}</p>
                            <p><strong>Level:</strong> ${upgrade.level}</p>
                            <p><strong>Effectiveness:</strong> ${Math.round(upgrade.effectiveness)}%</p>
                            <p><strong>Installed at:</strong> ${campsites.join(', ')}</p>
                        </div>
                        <p><em>Click on a campsite to upgrade this item</em></p>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '<h4>Available Upgrades</h4>';
        if (allAvailableUpgrades.size === 0) {
            html += '<p>All upgrades have been purchased across all campsites!</p>';
        } else {
            html += '<div class="upgrades-grid">';
            allAvailableUpgrades.forEach(upgrade => {
                html += `
                    <div class="upgrade-item">
                        <div>
                            <h4>${upgrade.name}</h4>
                            <p>${upgrade.description}</p>
                            <p><strong>Cost:</strong> $${upgrade.cost}</p>
                            <p><strong>Happiness:</strong> +${upgrade.happinessBonus}</p>
                        </div>
                        <p><em>Click on a campsite to purchase this upgrade</em></p>
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
        const activities = this.game.getActivityManager().getCampsiteActivities(campsite);
        const availableActivities = this.game.getActivityManager().getAvailableActivitiesForCampsite(campsite);
        const upgrades = this.game.getUpgradeManager().getCampsiteUpgrades(campsite);
        const availableUpgrades = this.game.getUpgradeManager().getAvailableUpgradesForCampsite(campsite);
        
        let html = `
            <div class="campsite-header">
                <h4>${campsite.name}</h4>
                <div class="campsite-stats">
                    <div class="stat-item">
                        <span class="stat-icon">🏔️</span>
                        <span class="stat-value">${campsite.elevation} ft</span>
                        <span class="stat-label">Elevation</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">👥</span>
                        <span class="stat-value">${campsite.capacity}</span>
                        <span class="stat-label">Capacity</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value">${campsite.rating.toFixed(1)}</span>
                        <span class="stat-label">Rating</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">👤</span>
                        <span class="stat-value">${campsite.popularity}</span>
                        <span class="stat-label">Visitors</span>
                    </div>
                </div>
            </div>
            
            <div class="facilities-section">
                <h5>🏕️ Facilities</h5>
                <div class="facilities-grid">
        `;
        
        campsite.facilities.forEach(facility => {
            const facilityName = this.getFacilityName(facility);
            const facilityIcon = this.getFacilityIcon(facility);
            const facilityDescription = this.getFacilityDescription(facility);
            
            html += `
                <div class="facility-card">
                    <div class="facility-icon">${facilityIcon}</div>
                    <div class="facility-content">
                        <h4>${facilityName}</h4>
                        <p>${facilityDescription}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div></div>';
        
        // Add activities section
        html += '<h5>Activities:</h5>';
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
        
        // Add available activities
        if (availableActivities.length > 0) {
            html += '<h5>Available Activities:</h5>';
            html += '<div class="activities-grid">';
            availableActivities.forEach(activity => {
                html += `
                    <div class="activity-card" data-activity-id="${activity.id}" data-campsite-name="${campsite.name}">
                        <div class="activity-icon">${activity.icon}</div>
                        <h4>${activity.name}</h4>
                        <p>${activity.description}</p>
                        <p><strong>Cost:</strong> $${activity.cost}</p>
                        <p><strong>Happiness:</strong> +${activity.happinessBonus}</p>
                        <button class="primary-button purchase-activity-btn">Purchase</button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Add upgrades section
        html += '<h5>Upgrades:</h5>';
        if (upgrades.length === 0) {
            html += '<p>No upgrades installed yet.</p>';
        } else {
            html += '<div class="upgrades-grid">';
            upgrades.forEach(upgrade => {
                html += `
                    <div class="upgrade-item" data-upgrade-id="${upgrade.id}" data-campsite-name="${campsite.name}">
                        <div>
                            <h4>${upgrade.name}</h4>
                            <p>${upgrade.description}</p>
                            <p><strong>Level:</strong> ${upgrade.level}</p>
                            <p><strong>Effectiveness:</strong> ${Math.round(upgrade.effectiveness)}%</p>
                        </div>
                        <button class="secondary-button upgrade-existing-btn">Upgrade</button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Add available upgrades
        if (availableUpgrades.length > 0) {
            html += '<h5>Available Upgrades:</h5>';
            html += '<div class="upgrades-grid">';
            availableUpgrades.forEach(upgrade => {
                html += `
                    <div class="upgrade-item" data-upgrade-id="${upgrade.id}" data-campsite-name="${campsite.name}">
                        <div>
                            <h4>${upgrade.name}</h4>
                            <p>${upgrade.description}</p>
                            <p><strong>Cost:</strong> $${upgrade.cost}</p>
                            <p><strong>Happiness:</strong> +${upgrade.happinessBonus}</p>
                        </div>
                        <button class="primary-button purchase-upgrade-btn">Purchase</button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        details.innerHTML = html;
        
        // Add event listeners for purchase buttons
        this.setupPurchaseEventListeners();
    }
    
    setupPurchaseEventListeners() {
        // Activity purchase buttons
        const activityButtons = document.querySelectorAll('.purchase-activity-btn');
        activityButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const activityCard = e.target.closest('.activity-card');
                const activityId = activityCard.dataset.activityId;
                const campsiteName = activityCard.dataset.campsiteName;
                const campsite = this.game.getCampsiteManager().getCampsiteByName(campsiteName);
                
                if (campsite) {
                    // Add success feedback
                    activityCard.classList.add('purchase-success');
                    
                    // Fade out the card after showing success
                    setTimeout(() => {
                        activityCard.classList.add('fade-out');
                    }, 200);
                    
                    // Purchase the activity after a short delay
                    setTimeout(() => {
                        this.game.getActivityManager().purchaseActivityForCampsite(campsite, activityId);
                        // Update the campsite details to reflect the purchase
                        this.updateCampsiteDetails();
                    }, 600);
                }
            });
        });
        
        // Upgrade purchase buttons
        const upgradeButtons = document.querySelectorAll('.purchase-upgrade-btn');
        upgradeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const upgradeItem = e.target.closest('.upgrade-item');
                const upgradeId = upgradeItem.dataset.upgradeId;
                const campsiteName = upgradeItem.dataset.campsiteName;
                const campsite = this.game.getCampsiteManager().getCampsiteByName(campsiteName);
                
                if (campsite) {
                    // Add success feedback
                    upgradeItem.classList.add('purchase-success');
                    
                    // Fade out the item after showing success
                    setTimeout(() => {
                        upgradeItem.classList.add('fade-out');
                    }, 200);
                    
                    // Purchase the upgrade after a short delay
                    setTimeout(() => {
                        this.game.getUpgradeManager().purchaseUpgradeForCampsite(campsite, upgradeId);
                        // Update the campsite details to reflect the purchase
                        this.updateCampsiteDetails();
                    }, 600);
                }
            });
        });
        
        // Upgrade existing buttons
        const upgradeExistingButtons = document.querySelectorAll('.upgrade-existing-btn');
        upgradeExistingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const upgradeItem = e.target.closest('.upgrade-item');
                const upgradeId = upgradeItem.dataset.upgradeId;
                const campsiteName = upgradeItem.dataset.campsiteName;
                const campsite = this.game.getCampsiteManager().getCampsiteByName(campsiteName);
                
                if (campsite) {
                    // Add success feedback
                    upgradeItem.classList.add('purchase-success');
                    
                    // Fade out the item briefly, then update it
                    setTimeout(() => {
                        upgradeItem.classList.add('fade-out');
                    }, 200);
                    
                    // Upgrade the existing upgrade after a short delay
                    setTimeout(() => {
                        this.game.getUpgradeManager().upgradeExistingForCampsite(campsite, upgradeId);
                        // Update the campsite details to reflect the upgrade
                        this.updateCampsiteDetails();
                    }, 600);
                }
            });
        });
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
    
    getFacilityIcon(facility) {
        const icons = {
            'tent_sites': '⛺',
            'water_source': '💧',
            'fire_rings': '🔥',
            'picnic_tables': '🪑',
            'bear_lockers': '🔒',
            'outhouse': '🚻',
            'shower_house': '🚿',
            'camp_store': '🏪',
            'emergency_shelter': '🏠'
        };
        return icons[facility] || '🏕️';
    }
    
    getFacilityDescription(facility) {
        const descriptions = {
            'tent_sites': 'Designated areas for tent camping with level ground',
            'water_source': 'Clean drinking water available for campers',
            'fire_rings': 'Safe fire pits for cooking and warmth',
            'picnic_tables': 'Covered picnic areas for outdoor dining',
            'bear_lockers': 'Secure food storage to prevent wildlife encounters',
            'outhouse': 'Basic restroom facilities for campers',
            'shower_house': 'Hot showers and modern bathroom facilities',
            'camp_store': 'Convenience store with camping supplies and snacks',
            'emergency_shelter': 'Weather protection and emergency refuge'
        };
        return descriptions[facility] || 'Camping facility';
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
    
    getDifficultyIcon(difficulty) {
        switch (difficulty) {
            case 'easy': return '🥾';
            case 'moderate': return '🏔️';
            case 'difficult': return '⛰️';
            case 'expert': return '🧗';
            default: return '🚶';
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
            startGameBtn.classList.add('hidden');
            gameStatus.textContent = 'Game is running - auto-progression active';
            gameStatus.style.color = '#10b981';
        } else {
            startGameBtn.classList.remove('hidden');
            startGameBtn.textContent = '🚀 Start Game';
            startGameBtn.disabled = false;
            startGameBtn.classList.remove('disabled');
            gameStatus.textContent = 'Game not started yet';
            gameStatus.style.color = '#6b7280';
        }
    }
} 