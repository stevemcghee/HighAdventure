# 🚀 Free Deployment Guide for High Adventure Game

## Option 1: Render (Recommended - Easiest)

### Step 1: Prepare Your Repository
1. Make sure your code is in a Git repository (GitHub, GitLab, etc.)
2. Ensure all files are committed and pushed

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up for free
2. Click "New +" → "Blueprint"
3. Connect your Git repository
4. Render will automatically detect the `render.yaml` file
5. Click "Apply" to deploy both your app and database

### Step 3: Configure Environment Variables
After deployment, go to your web service dashboard and add:
```
DATABASE_URL=your_render_postgres_url_here
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

### Step 4: Access Your Game
Your game will be available at: `https://your-app-name.onrender.com`

---

## Option 2: Railway (Alternative)

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect it's a Node.js app

### Step 2: Add PostgreSQL Database
1. In your project dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically link it to your app

### Step 3: Set Environment Variables
Add these in your app's variables:
```
DATABASE_URL=your_railway_postgres_url
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

---

## Option 3: Fly.io (Global Deployment)

### Step 1: Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login and Deploy
```bash
fly auth login
fly launch
```

### Step 3: Add PostgreSQL
```bash
fly postgres create
fly postgres attach your-db-name
```

---

## Option 4: Vercel (Frontend Only - Limited)

**Note**: This only works for the frontend files since Vercel doesn't support WebSockets or Node.js backends.

### Step 1: Deploy Frontend
1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Set build command to: `echo "No build needed"`
4. Set output directory to: `public`

### Step 2: Limitations
- No multiplayer functionality
- No database support
- Only static files will work

---

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Ensure `DATABASE_URL` is set correctly
   - Check if database is running
   - Verify SSL settings for production

2. **Port Issues**
   - Render uses port 10000
   - Railway uses `PORT` environment variable
   - Fly.io uses port 8080

3. **WebSocket Issues**
   - Ensure your platform supports WebSockets
   - Check CORS settings
   - Verify Socket.IO configuration

### Environment Variables Checklist:
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=10000 (or platform default)
JWT_SECRET=your-secret-key-here
```

---

## 💰 Cost Comparison

| Platform | Free Tier | Database | WebSockets | Ease of Use |
|----------|-----------|----------|------------|-------------|
| Render | ✅ 750h/month | ✅ PostgreSQL | ✅ Yes | ⭐⭐⭐⭐⭐ |
| Railway | ✅ $5/month credit | ✅ PostgreSQL | ✅ Yes | ⭐⭐⭐⭐ |
| Fly.io | ✅ 3 VMs | ✅ PostgreSQL | ✅ Yes | ⭐⭐⭐ |
| Vercel | ✅ Unlimited | ❌ No | ❌ No | ⭐⭐⭐⭐⭐ |

---

## 🎯 Recommendation

**Use Render** for the easiest free deployment:
- ✅ Free PostgreSQL database
- ✅ WebSocket support
- ✅ Automatic deployments
- ✅ Easy environment variable management
- ✅ Good documentation and support

Your game will be fully functional with multiplayer capabilities on Render's free tier! 