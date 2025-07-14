const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/high_adventure',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Debug database connection
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Game state management
const gameStates = new Map();
const playerSessions = new Map();

// Database initialization
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_name VARCHAR(255) NOT NULL,
        game_state JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        max_players INTEGER DEFAULT 4,
        is_active BOOLEAN DEFAULT true
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
        player_name VARCHAR(255) NOT NULL,
        player_data JSONB NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_session_id ON players(session_id);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_active ON game_sessions(is_active);
    `);

    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// API Routes
app.get('/api/sessions', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, session_name, created_at, max_players, (SELECT COUNT(*) FROM players WHERE session_id = game_sessions.id) as player_count FROM game_sessions WHERE is_active = true ORDER BY created_at DESC'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const { sessionName, maxPlayers = 4 } = req.body;
    const client = await pool.connect();
    
    // Check if a session with this name already exists
    const existingSession = await client.query(
      'SELECT id FROM game_sessions WHERE session_name = $1 AND is_active = true',
      [sessionName]
    );
    
    if (existingSession.rows.length > 0) {
      client.release();
      return res.status(409).json({ error: 'A session with this name already exists' });
    }
    
    const result = await client.query(
      'INSERT INTO game_sessions (session_name, game_state, max_players) VALUES ($1, $2, $3) RETURNING id',
      [sessionName, getInitialGameState(), maxPlayers]
    );
    
    client.release();
    res.json({ sessionId: result.rows[0].id });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT * FROM game_sessions WHERE id = $1 AND is_active = true',
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const players = await client.query(
      'SELECT id, player_name, player_data, joined_at FROM players WHERE session_id = $1 ORDER BY joined_at',
      [sessionId]
    );
    
    client.release();
    res.json({
      session: result.rows[0],
      players: players.rows
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join-session', async (data) => {
    try {
      const { sessionId, playerName } = data;
      
      // Check if session exists and has room
      const client = await pool.connect();
      const sessionResult = await client.query(
        'SELECT * FROM game_sessions WHERE id = $1 AND is_active = true',
        [sessionId]
      );
      
      if (sessionResult.rows.length === 0) {
        client.release();
        socket.emit('error', { message: 'Session not found' });
        return;
      }
      
      const playerCount = await client.query(
        'SELECT COUNT(*) FROM players WHERE session_id = $1',
        [sessionId]
      );
      
      if (parseInt(playerCount.rows[0].count) >= sessionResult.rows[0].max_players) {
        client.release();
        socket.emit('error', { message: 'Session is full' });
        return;
      }
      
      // Add player to session
      const playerResult = await client.query(
        'INSERT INTO players (session_id, player_name, player_data) VALUES ($1, $2, $3) RETURNING id',
        [sessionId, playerName, { money: 50000, score: 0 }]
      );
      
      const playerId = playerResult.rows[0].id;
      
      // Join socket room
      socket.join(sessionId);
      socket.sessionId = sessionId;
      socket.playerId = playerId;
      socket.playerName = playerName;
      
      // Store player session
      playerSessions.set(socket.id, {
        sessionId,
        playerId,
        playerName
      });
      
      // Load game state
      const gameState = sessionResult.rows[0].game_state;
      gameStates.set(sessionId, gameState);
      
      client.release();
      
      // Notify all players in session
      io.to(sessionId).emit('player-joined', {
        playerId,
        playerName,
        gameState
      });
      
      console.log(`Player ${playerName} joined session ${sessionId}`);
      
    } catch (error) {
      console.error('Error joining session:', error);
      socket.emit('error', { message: 'Failed to join session' });
    }
  });

  socket.on('game-action', async (data) => {
    try {
      const { action, payload } = data;
      const sessionId = socket.sessionId;
      
      if (!sessionId || !gameStates.has(sessionId)) {
        socket.emit('error', { message: 'Invalid session' });
        return;
      }
      
      const gameState = gameStates.get(sessionId);
      
      // Process game action
      const updatedState = processGameAction(gameState, action, payload, socket.playerName);
      
      if (updatedState) {
        gameStates.set(sessionId, updatedState);
        
        // Save to database
        const client = await pool.connect();
        await client.query(
          'UPDATE game_sessions SET game_state = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [updatedState, sessionId]
        );
        client.release();
        
        // Broadcast to all players in session
        io.to(sessionId).emit('game-state-update', {
          gameState: updatedState,
          action,
          playerName: socket.playerName
        });
      }
      
    } catch (error) {
      console.error('Error processing game action:', error);
      socket.emit('error', { message: 'Failed to process action' });
    }
  });

  socket.on('disconnect', async () => {
    console.log('Player disconnected:', socket.id);
    
    const session = playerSessions.get(socket.id);
    if (session) {
      // Update last active time
      try {
        const client = await pool.connect();
        await client.query(
          'UPDATE players SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
          [session.playerId]
        );
        client.release();
      } catch (error) {
        console.error('Error updating player last active:', error);
      }
      
      // Notify other players
      io.to(session.sessionId).emit('player-left', {
        playerName: session.playerName
      });
      
      playerSessions.delete(socket.id);
    }
  });
});

// Game action processor
function processGameAction(gameState, action, payload, playerName) {
  const newState = { ...gameState };
  
  switch (action) {
    case 'next-week':
      newState.week++;
      if (newState.week > 10) {
        newState.year++;
        newState.week = 1;
        newState.gamePhase = 'planning';
      }
      break;
      
    case 'hire-staff':
      const { staffType } = payload;
      if (newState.money >= (staffType === 'guide' ? 5000 : 3000)) {
        newState.money -= (staffType === 'guide' ? 5000 : 3000);
        newState.staff[staffType === 'guide' ? 'guides' : 'maintenance']++;
      }
      break;
      
    case 'purchase-activity':
      const { activityId } = payload;
      // Add activity purchase logic
      break;
      
    case 'purchase-upgrade':
      const { upgradeId } = payload;
      // Add upgrade purchase logic
      break;
      
    case 'create-route':
      const { from, to, difficulty, distance } = payload;
      // Add route creation logic
      break;
      
    default:
      return null;
  }
  
  return newState;
}

// Initial game state
function getInitialGameState() {
  return {
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
    gamePhase: 'active',
    autoProgress: true,
    planningChoices: [],
    routes: [],
    activities: [],
    upgrades: []
  };
}

// Serve the main game page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the beta game page
app.get('/beta', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  await initializeDatabase();
  
  server.listen(PORT, () => {
    console.log(`High Adventure Multiplayer Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error); 