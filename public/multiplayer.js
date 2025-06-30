// Multiplayer client for High Adventure
class MultiplayerClient {
    constructor() {
        this.socket = null;
        this.sessionId = null;
        this.playerName = null;
        this.game = null;
        this.isConnected = false;
        this.players = new Map();
        
        this.initializeSocket();
    }
    
    initializeSocket() {
        // Connect to the server
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to multiplayer server');
            this.isConnected = true;
            this.updateConnectionStatus();
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from multiplayer server');
            this.isConnected = false;
            this.updateConnectionStatus();
        });
        
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.showError(error.message);
        });
        
        this.socket.on('player-joined', (data) => {
            this.handlePlayerJoined(data);
        });
        
        this.socket.on('player-left', (data) => {
            this.handlePlayerLeft(data);
        });
        
        this.socket.on('game-state-update', (data) => {
            this.handleGameStateUpdate(data);
        });
    }
    
    setGame(game) {
        this.game = game;
    }
    
    async createSession(sessionName, maxPlayers = 4) {
        try {
            console.log('Creating session:', { sessionName, maxPlayers });
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionName, maxPlayers })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create session');
            }
            
            const data = await response.json();
            this.sessionId = data.sessionId;
            console.log('Session created with ID:', this.sessionId);
            
            return this.sessionId;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }
    
    async joinSession(sessionId, playerName) {
        this.sessionId = sessionId;
        this.playerName = playerName;
        
        this.socket.emit('join-session', {
            sessionId,
            playerName
        });
    }
    
    async getSessions() {
        try {
            const response = await fetch('/api/sessions');
            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }
            const sessions = await response.json();
            console.log('Fetched sessions:', sessions);
            return sessions;
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
    }
    
    sendGameAction(action, payload = {}) {
        if (!this.isConnected || !this.sessionId) {
            console.warn('Not connected to multiplayer session');
            return;
        }
        
        this.socket.emit('game-action', {
            action,
            payload
        });
    }
    
    handlePlayerJoined(data) {
        const { playerId, playerName, gameState } = data;
        
        this.players.set(playerId, {
            id: playerId,
            name: playerName,
            joinedAt: new Date()
        });
        
        // Update game state if this is the first player
        if (this.game && gameState) {
            this.game.gameState = gameState;
            this.game.updateUI();
        }
        
        this.updatePlayersList();
        this.showMessage(`${playerName} joined the game`);
    }
    
    handlePlayerLeft(data) {
        const { playerName } = data;
        
        // Remove player from list
        for (const [id, player] of this.players.entries()) {
            if (player.name === playerName) {
                this.players.delete(id);
                break;
            }
        }
        
        this.updatePlayersList();
        this.showMessage(`${playerName} left the game`);
    }
    
    handleGameStateUpdate(data) {
        const { gameState, action, playerName } = data;
        
        if (this.game && gameState) {
            // Update local game state
            this.game.gameState = gameState;
            this.game.updateUI();
            
            // Show action notification
            if (playerName !== this.playerName) {
                this.showActionNotification(playerName, action);
            }
        }
    }
    
    updatePlayersList() {
        const playersList = document.getElementById('players-list');
        if (!playersList) return;
        
        if (this.players.size === 0) {
            playersList.innerHTML = '<span class="no-players">None</span>';
            return;
        }
        
        playersList.innerHTML = '';
        
        this.players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            playerElement.textContent = player.name;
            playersList.appendChild(playerElement);
        });
    }
    
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;
        
        if (this.isConnected) {
            statusElement.textContent = '🟢 Connected';
            statusElement.className = 'status-connected';
        } else {
            statusElement.textContent = '🔴 Disconnected';
            statusElement.className = 'status-disconnected';
        }
    }
    
    showMessage(message) {
        if (this.game) {
            this.game.addMessage(message);
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    showActionNotification(playerName, action) {
        const notification = document.createElement('div');
        notification.className = 'action-notification';
        notification.innerHTML = `
            <span class="player-name">${playerName}</span>
            <span class="action-text">${this.getActionText(action)}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    getActionText(action) {
        const actionTexts = {
            'next-week': 'advanced to next week',
            'hire-staff': 'hired staff',
            'purchase-activity': 'purchased an activity',
            'purchase-upgrade': 'purchased an upgrade',
            'create-route': 'created a new route'
        };
        
        return actionTexts[action] || 'performed an action';
    }
}

// Multiplayer UI Manager
class MultiplayerUI {
    constructor(multiplayerClient) {
        this.client = multiplayerClient;
        this.createMultiplayerUI();
    }
    
    createMultiplayerUI() {
        // Create multiplayer panel
        const multiplayerPanel = document.createElement('div');
        multiplayerPanel.className = 'multiplayer-panel';
        multiplayerPanel.innerHTML = `
            <div class="multiplayer-content">
                <div class="multiplayer-left">
                    <div class="multiplayer-header">
                        <h3>🌐 Multiplayer</h3>
                        <div class="connection-info">
                            <span id="connection-status" class="status-disconnected">🔴 Disconnected</span>
                        </div>
                    </div>
                    
                    <div class="session-controls">
                        <button id="create-session-btn" class="primary-button">Create Session</button>
                        <button id="join-session-btn" class="secondary-button">Join Session</button>
                        <button id="refresh-sessions-btn" class="secondary-button">Refresh</button>
                    </div>
                </div>
                
                <div class="multiplayer-right">
                    <div class="sessions-list" id="sessions-list">
                        <span class="no-sessions">Loading sessions...</span>
                    </div>
                    
                    <div class="players-section">
                        <h4>Players:</h4>
                        <div class="players-list" id="players-list">
                            <span class="no-players">None</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert at the top of the body instead of game container
        document.body.insertBefore(multiplayerPanel, document.body.firstChild);
        
        // Add event listeners
        this.addEventListeners();
        
        // Add CSS styles
        this.addStyles();
        
        // Load initial sessions
        this.refreshSessions();
    }
    
    addEventListeners() {
        document.getElementById('create-session-btn').addEventListener('click', () => {
            this.showCreateSessionModal();
        });
        
        document.getElementById('join-session-btn').addEventListener('click', () => {
            this.showJoinSessionModal();
        });
        
        document.getElementById('refresh-sessions-btn').addEventListener('click', () => {
            this.refreshSessions();
        });
    }
    
    async showCreateSessionModal() {
        let sessionName = prompt('Enter session name:');
        if (!sessionName) return;
        
        // Keep prompting for a new name if there's a duplicate
        while (true) {
            try {
                const sessionId = await this.client.createSession(sessionName);
                const playerName = prompt('Enter your player name:');
                if (!playerName) return;
                
                await this.client.joinSession(sessionId, playerName);
                this.showMessage(`Created and joined session: ${sessionName}`);
                
                // Refresh sessions list to show the newly created session
                this.refreshSessions();
                break; // Success, exit the loop
            } catch (error) {
                if (error.message.includes('already exists')) {
                    // Session name already exists, prompt for a new name
                    sessionName = prompt(`Session name "${sessionName}" already exists. Please enter a different name:`);
                    if (!sessionName) return; // User cancelled
                } else {
                    // Other error, show it and exit
                    this.showError('Failed to create session: ' + error.message);
                    break;
                }
            }
        }
    }
    
    async showJoinSessionModal() {
        try {
            const sessions = await this.client.getSessions();
            if (sessions.length === 0) {
                this.showError('No active sessions available');
                return;
            }
            
            const sessionOptions = sessions.map(s => 
                `${s.session_name} (${s.player_count}/${s.max_players} players)`
            ).join('\n');
            
            const sessionIndex = prompt(
                `Select a session (0-${sessions.length - 1}):\n${sessionOptions}`
            );
            
            if (sessionIndex === null) return;
            
            const selectedSession = sessions[parseInt(sessionIndex)];
            if (!selectedSession) {
                this.showError('Invalid session selection');
                return;
            }
            
            const playerName = prompt('Enter your player name:');
            if (!playerName) return;
            
            await this.client.joinSession(selectedSession.id, playerName);
            this.showMessage(`Joined session: ${selectedSession.session_name}`);
            
            // Refresh sessions list to update player count
            this.refreshSessions();
        } catch (error) {
            this.showError('Failed to join session: ' + error.message);
        }
    }
    
    async refreshSessions() {
        try {
            const sessions = await this.client.getSessions();
            console.log('Refreshing sessions list with:', sessions);
            this.updateSessionsList(sessions);
        } catch (error) {
            console.error('Error refreshing sessions:', error);
            this.showError('Failed to refresh sessions: ' + error.message);
        }
    }
    
    updateSessionsList(sessions) {
        const sessionsList = document.getElementById('sessions-list');
        
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<span class="no-sessions">No active sessions found</span>';
            return;
        }
        
        sessionsList.innerHTML = sessions.map(session => `
            <div class="session-item">
                <span class="session-name">${session.session_name}</span>
                <span class="session-info">
                    <span class="player-count">${session.player_count}/${session.max_players}</span>
                </span>
            </div>
        `).join('');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .multiplayer-panel {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #1e293b, #334155);
                border-bottom: 3px solid #3b82f6;
                padding: 10px 20px;
                color: white;
                z-index: 1000;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .multiplayer-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .multiplayer-left {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .multiplayer-header {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .multiplayer-header h3 {
                margin: 0;
                color: #3b82f6;
                font-size: 18px;
            }
            
            .connection-info {
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .status-connected {
                color: #10b981;
            }
            
            .status-disconnected {
                color: #ef4444;
            }
            
            .session-controls {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .session-controls button {
                padding: 8px 16px;
                font-size: 14px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s;
            }
            
            .session-controls .primary-button {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
            }
            
            .session-controls .primary-button:hover {
                background: linear-gradient(135deg, #2563eb, #1e40af);
                transform: translateY(-1px);
            }
            
            .session-controls .secondary-button {
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
            }
            
            .session-controls .secondary-button:hover {
                background: linear-gradient(135deg, #4b5563, #374151);
                transform: translateY(-1px);
            }
            
            .multiplayer-right {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .sessions-list {
                display: flex;
                gap: 15px;
                align-items: center;
            }
            
            .session-item {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid #3b82f6;
                border-radius: 6px;
                padding: 8px 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
            }
            
            .session-name {
                font-weight: bold;
                color: #3b82f6;
            }
            
            .session-info {
                display: flex;
                gap: 10px;
                font-size: 12px;
                color: #9ca3af;
            }
            
            .players-section {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .players-section h4 {
                margin: 0;
                color: #3b82f6;
                font-size: 14px;
            }
            
            .players-list {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .player-item {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid #10b981;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                color: #10b981;
            }
            
            .no-sessions {
                color: #9ca3af;
                font-style: italic;
            }
            
            .no-players {
                color: #9ca3af;
                font-style: italic;
            }
            
            .action-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #3b82f6;
                border-radius: 10px;
                padding: 15px;
                color: white;
                z-index: 1001;
                animation: fadeInOut 3s ease-in-out;
            }
            
            .action-notification .player-name {
                color: #3b82f6;
                font-weight: bold;
            }
            
            .error-message {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(239, 68, 68, 0.9);
                border: 2px solid #ef4444;
                border-radius: 10px;
                padding: 15px;
                color: white;
                z-index: 1001;
                animation: fadeInOut 5s ease-in-out;
            }
            
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
            
            /* Adjust main game container to account for top bar */
            .game-container {
                margin-top: 80px;
            }
        `;
        document.head.appendChild(style);
    }
    
    showMessage(message) {
        console.log(message);
    }
    
    showError(message) {
        console.error(message);
    }
}

// Initialize multiplayer when the page loads
let multiplayerClient;
let multiplayerUI;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize multiplayer client
    multiplayerClient = new MultiplayerClient();
    
    // Wait for the game to initialize, then set up multiplayer
    setTimeout(() => {
        if (window.game) {
            multiplayerClient.setGame(window.game);
            multiplayerUI = new MultiplayerUI(multiplayerClient);
        }
    }, 1000);
}); 