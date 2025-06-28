# 🏔️ High Adventure - Backpacking Camp Simulation

Welcome to **High Adventure**, a strategic simulation game where you manage a backpacking camp in the mountains! Your goal is to create the most popular and profitable outdoor recreation destination by building trails, adding activities, and improving your facilities over 10 years of operation.

## 🎮 How to Play

### Getting Started
1. Open `index.html` in your web browser
2. The game automatically starts with auto-progression enabled
3. You'll begin with $50,000 and a procedurally generated mountain with 6-8 campsites
4. Each year consists of 10 weeks of summer sessions
5. Your goal is to maximize visitor happiness and revenue over 10 years

### 🕐 Game Flow & Phases

#### Active Season (Weeks 1-10)
- **Auto-Progression**: The game automatically advances weeks every 2 seconds
- **Visitor Processing**: Each week brings visitors based on your camp's attractions
- **Revenue Generation**: Visitors pay fees based on route quality and amenities
- **Happiness Calculation**: Visitor satisfaction is calculated weekly
- **Pause Control**: Click "⏸️ Pause Auto Progress" to pause, "▶️ Resume Auto Progress" to continue

#### Planning Phase (End of Year)
- **Strategic Decisions**: Choose improvements for the next year
- **Multiple Selections**: You can select multiple improvements if you have the budget
- **Opportunity Types**: Routes, activities, upgrades, and staff hiring
- **Cost Management**: Balance your budget across different improvements
- **Skip Option**: Choose to skip planning if you prefer

### 🗺️ Mountain & Terrain System

#### Procedural Generation
- **Unique Mountains**: Every game generates a different mountain layout
- **Terrain Types**: Snow peaks, rocky cliffs, forests, meadows, and valleys
- **Elevation System**: Campsites are placed at different elevations affecting facilities
- **Interactive Exploration**: Click and drag to pan, use zoom controls to explore

#### Campsite System
- **Strategic Placement**: Campsites are positioned based on terrain features
- **Elevation Effects**: Higher campsites get emergency shelters, lower ones get more amenities
- **Facility Variety**: Each campsite has different facilities based on location
- **Capacity Management**: Campsites have varying visitor capacities

### 🛤️ Trail Route System

#### Route Creation
- **Connect Campsites**: Create trails between different campsites
- **Difficulty Levels**: Easy, Moderate, Difficult, and Expert trails
- **Distance Factor**: Longer trails cost more but can be more appealing
- **Quality System**: Route quality affects visitor happiness and revenue
- **Duplicate Prevention**: Cannot create duplicate routes between the same campsites

#### Route Management
- **Maintenance**: Routes degrade over time and need maintenance
- **Upgrades**: Improve existing routes for better quality and higher fees
- **Strategic Planning**: Consider which routes will be most profitable
- **Network Effects**: More routes increase overall visitor capacity

### 🎯 Activity System

#### Available Activities
- **Fishing** ($2,000): Catch trout in mountain streams (+15 happiness)
- **Rock Climbing** ($5,000): Scale granite cliffs with guides (+25 happiness)
- **Wildlife Viewing** ($1,500): Spot bears, elk, and eagles (+10 happiness)
- **Stargazing** ($1,000): Clear mountain night skies (+8 happiness)
- **Photography** ($3,000): Capture stunning landscapes (+12 happiness)
- **Campfire Stories** ($500): Evening storytelling sessions (+5 happiness)
- **Nature Hikes** ($2,500): Guided educational walks (+18 happiness)
- **Swimming** ($1,500): Cool off in mountain lakes (+12 happiness)
- **Bird Watching** ($1,200): Observe diverse bird species (+10 happiness)
- **Mountain Biking** ($4,000): Ride challenging trails (+20 happiness)

#### Activity Management
- **Satisfaction Tracking**: Activities have satisfaction levels that change over time
- **Popularity System**: Some activities are more popular than others
- **Strategic Placement**: Consider which activities work best at different campsites
- **Revenue Impact**: Activities increase visitor happiness and willingness to pay

### 🏗️ Upgrade System

#### Upgrade Categories
- **Trails**: Better trail markers, emergency equipment
- **Safety**: First aid supplies, weather stations
- **Facilities**: Comfort stations, picnic areas, campground kitchens
- **Technology**: WiFi hotspots, interpretive signs
- **Sustainability**: Solar panels, water filtration
- **Wildlife**: Viewing platforms, enhanced fire pits

#### Upgrade Mechanics
- **Leveling System**: Upgrades can be improved multiple times
- **Effectiveness**: Each upgrade has an effectiveness percentage
- **Strategic Investment**: Choose upgrades that complement your strategy
- **Cost Scaling**: Upgrading existing items costs less than new purchases

### 👥 Staff Management

#### Staff Types
- **Guides** ($5,000/year): Increase visitor capacity and happiness
- **Maintenance** ($3,000/year): Keep routes and facilities in good condition

#### Staff Strategy
- **Balanced Approach**: Mix of guides and maintenance staff
- **Cost Management**: Staff salaries are paid annually
- **Scaling**: More staff increases costs but improves camp performance
- **Strategic Hiring**: Hire staff when you can afford the ongoing costs

### 📊 Game Mechanics Deep Dive

#### Visitor Calculation
```
Base Visitors = 10 + (Year - 1) × 5
Route Bonus = Total Routes × 2
Activity Bonus = Total Activities × 3
Staff Bonus = Guides × 5
Total Visitors = Base + Route + Activity + Staff
```

#### Revenue System
```
Base Price = $50 per visitor
Route Price = Average route price bonus
Total Revenue = Visitors × (Base Price + Route Price)
```

#### Happiness Calculation
```
Base Happiness = 50%
Route Quality Bonus = Average route quality × 10%
Activity Variety Bonus = Number of activities × 5%
Staff Bonus = Guides × 3% + Maintenance × 2%
Upgrade Bonus = Total upgrade bonuses
Final Happiness = Base + All Bonuses (capped at 100%)
```

#### Year-End Processing
- **Staff Salaries**: Annual costs for all hired staff
- **High Satisfaction Bonus**: Bonus money for 80%+ happiness
- **Planning Phase**: Strategic decisions for next year

### 🎯 Advanced Strategies

#### Early Game (Years 1-2)
1. **Focus on Routes**: Create 2-3 easy routes between nearby campsites
2. **Essential Activities**: Start with Campfire Stories and Wildlife Viewing
3. **Basic Staff**: Hire 1 guide to boost visitor capacity
4. **Safety First**: Invest in emergency equipment and better trail markers

#### Mid Game (Years 3-5)
1. **Route Expansion**: Add moderate and difficult trails
2. **Activity Diversification**: Add specialized activities like rock climbing
3. **Facility Improvements**: Invest in comfort stations and picnic areas
4. **Staff Growth**: Increase to 2-3 guides and 1-2 maintenance staff

#### Late Game (Years 6-10)
1. **Expert Routes**: Create challenging trails for experienced hikers
2. **Premium Activities**: Add high-value activities like mountain biking
3. **Luxury Upgrades**: Invest in WiFi, solar panels, and advanced facilities
4. **Optimization**: Fine-tune all systems for maximum efficiency

### 🏆 Success Metrics & Scoring

#### Key Performance Indicators
- **Total Visitors**: Cumulative visitors over 10 years
- **Average Happiness**: Target 80%+ for bonuses
- **Weekly Revenue**: Monitor income trends
- **Route Quality**: Maintain high-quality trails
- **Activity Variety**: Offer diverse experiences

#### Final Score Calculation
```
Visitor Score = Total Visitors × 0.1
Revenue Score = Total Revenue × 0.001
Happiness Score = Average Happiness × 100
Route Score = Total Routes × 100
Activity Score = Total Activities × 50
Upgrade Score = Total Upgrades × 75
Staff Score = Total Staff × 200
Final Score = Sum of all scores
```

### 🎨 User Interface Guide

#### Main Dashboard
- **Game Stats**: Year, week, money, visitors, happiness
- **Auto-Progress Indicator**: Shows when game is automatically advancing
- **Phase Indicator**: Shows current game phase (Active/Planning)
- **Progress Bar**: Visual representation of week progression

#### Tab System
- **Management**: Current session info, staff hiring, game controls
- **Routes**: View existing routes, create new routes, upgrade routes
- **Activities**: View installed and available activities
- **Upgrades**: View installed and available upgrades

#### Interactive Elements
- **Mountain Canvas**: Click campsites to view details
- **Zoom Controls**: Explore the mountain terrain
- **Planning Modal**: Strategic decision interface
- **Message System**: Real-time feedback and notifications

### 🚀 Pro Tips

#### General Strategy
1. **Start Small**: Don't try to build everything at once
2. **Focus on Routes**: Good trails are the foundation of success
3. **Monitor Happiness**: Keep visitors satisfied for better revenue
4. **Plan Ahead**: Think about long-term growth and sustainability
5. **Experiment**: Try different strategies to find what works best

#### Advanced Tips
1. **Route Efficiency**: Create routes that connect multiple campsites
2. **Activity Synergy**: Combine activities that work well together
3. **Staff Timing**: Hire staff when you can afford ongoing costs
4. **Upgrade Priority**: Focus on upgrades that benefit multiple areas
5. **Budget Management**: Save money during active seasons for planning phases

### 🛠️ Technical Information

#### File Structure
- `index.html` - Main game interface and HTML structure
- `styles.css` - Game styling, layout, and responsive design
- `game.js` - Main game controller and logic
- `mountain.js` - Procedural terrain generation and rendering
- `campsites.js` - Campsite generation and management
- `routes.js` - Trail route system and calculations
- `activities.js` - Activity management and effects
- `upgrades.js` - Camp improvement system
- `ui.js` - User interface management and interactions

#### Game Architecture
- **Modular Design**: Each system is self-contained
- **Event-Driven**: UI updates based on game state changes
- **Procedural Generation**: Unique terrain and campsite layouts
- **Real-Time Updates**: Live feedback and progress tracking

#### Browser Requirements
- Modern browsers with ES6+ support
- Canvas API for terrain rendering
- No external dependencies or internet connection required
- No save system (games are session-based)

### 🎉 Game Features Summary

#### Core Systems
- ✅ Auto-progression with pause/resume control
- ✅ Year-end planning phase with strategic choices
- ✅ Procedural mountain generation
- ✅ Interactive campsite and route management
- ✅ Comprehensive activity and upgrade systems
- ✅ Staff hiring and management
- ✅ Real-time visitor and revenue calculations
- ✅ Happiness and satisfaction tracking

#### Visual & UX Features
- ✅ Interactive 3D-style mountain terrain
- ✅ Color-coded route difficulty system
- ✅ Modern, responsive user interface
- ✅ Real-time progress indicators
- ✅ Strategic planning modal
- ✅ Comprehensive game statistics
- ✅ Visual feedback and notifications

#### Strategic Depth
- ✅ Multiple paths to success
- ✅ Balanced cost-benefit relationships
- ✅ Long-term planning requirements
- ✅ Resource management challenges
- ✅ Replayability with different strategies

### 🏔️ Ready for Adventure?

High Adventure combines strategic management with the beauty of outdoor recreation. Whether you prefer to focus on challenging expert trails, family-friendly activities, or luxury amenities, there's a path to success for every play style.

**Start your mountain management journey today!** ⛺🏔️ 