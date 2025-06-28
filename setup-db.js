#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    console.log('🏔️ Setting up High Adventure Database...');
    
    // Connect to PostgreSQL
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/high_adventure',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    try {
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL');
        
        // Create tables
        console.log('📋 Creating tables...');
        
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
        
        // Create indexes
        console.log('🔍 Creating indexes...');
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_session_id ON players(session_id);
            CREATE INDEX IF NOT EXISTS idx_game_sessions_active ON game_sessions(is_active);
            CREATE INDEX IF NOT EXISTS idx_game_sessions_created ON game_sessions(created_at);
        `);
        
        // Create some sample data for testing
        console.log('🎮 Creating sample game session...');
        
        const sampleGameState = {
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
        
        const sessionResult = await client.query(
            'INSERT INTO game_sessions (session_name, game_state) VALUES ($1, $2) RETURNING id',
            ['Sample Multiplayer Session', sampleGameState]
        );
        
        const sessionId = sessionResult.rows[0].id;
        
        // Add sample players
        await client.query(
            'INSERT INTO players (session_id, player_name, player_data) VALUES ($1, $2, $3)',
            [sessionId, 'Alice', { money: 50000, score: 0 }]
        );
        
        await client.query(
            'INSERT INTO players (session_id, player_name, player_data) VALUES ($1, $2, $3)',
            [sessionId, 'Bob', { money: 50000, score: 0 }]
        );
        
        client.release();
        
        console.log('✅ Database setup completed successfully!');
        console.log('📊 Sample session created with ID:', sessionId);
        console.log('👥 Sample players: Alice, Bob');
        console.log('');
        console.log('🚀 You can now start the server with: npm run dev');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('');
            console.log('💡 Make sure PostgreSQL is running:');
            console.log('   - On macOS: brew services start postgresql');
            console.log('   - On Ubuntu: sudo systemctl start postgresql');
            console.log('   - Or use Docker: docker-compose up db');
        }
        
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase }; 