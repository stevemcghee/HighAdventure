// UI manager for handling all user interface interactions
class GameUI {
    constructor() {
        this.game = null;
        this.selectedCampsite = null;
        this.setupEventListeners();
    }
    
    initialize(game) {
        this.game = game;
        this.setupTabs();
        this.setupModals();
        this.updateAll();
    }
    
    setupEventListeners() {
        // Game control buttons
        document.getElementById('next-week').addEventListener('click', () => {
            this.game.nextWeek();
        });
        
        document.getElementById('next-year').addEventListener('click', () => {
            this.game.completeYear();
        });
        
        // Staff hiring buttons
        document.getElementById('hire-guide').addEventListener('click', () => {
            this.game.hireStaff('guide');
        });
        
        document.getElementById('hire-maintenance').addEventListener('click', () => {
            this.game.hireStaff('maintenance');
        });
        
        // Route creation
        document.getElementById('create-route').addEventListener('click', () => {
            this.showRouteModal();
        });
        
        // Canvas click for campsite selection
        const canvas = document.getElementById('mountainCanvas');
        canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
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
        
        modal.style.display = 'block';
    }
    
    createRoute() {
        const from = document.getElementById('route-from').value;
        const to = document.getElementById('route-to').value;
        const difficulty = document.getElementById('route-difficulty').value;
        const distance = parseInt(document.getElementById('route-distance').value);
        
        if (from === to) {
            this.addMessage("Cannot create route to same campsite!");
            return;
        }
        
        if (this.game.getRouteManager().routeExists(from, to)) {
            this.addMessage("Route already exists between these campsites!");
            return;
        }
        
        const route = this.game.getRouteManager().createRoute(from, to, difficulty, distance);
        if (route) {
            this.addMessage(`Created ${difficulty} route from ${from} to ${to} (${distance} miles)`);
            this.updateRoutesList();
            this.game.getMountain().render();
        }
        
        document.getElementById('route-modal').style.display = 'none';
    }
    
    updateAll() {
        this.updateGameStats();
        this.updateStaffCount();
        this.updateRoutesList();
        this.updateActivitiesList();
        this.updateUpgradesList();
        this.updateCampsiteDetails();
    }
    
    updateGameStats(gameState = null) {
        const state = gameState || this.game.getGameState();
        
        document.getElementById('year').textContent = state.year;
        document.getElementById('week').textContent = state.week;
        document.getElementById('money').textContent = `$${state.money.toLocaleString()}`;
        document.getElementById('total-visitors').textContent = state.totalVisitors.toLocaleString();
        document.getElementById('avg-happiness').textContent = `${state.avgHappiness}%`;
        document.getElementById('current-week').textContent = state.week;
        document.getElementById('weekly-visitors').textContent = state.weeklyVisitors;
        document.getElementById('weekly-revenue').textContent = `$${state.weeklyRevenue.toLocaleString()}`;
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
} 