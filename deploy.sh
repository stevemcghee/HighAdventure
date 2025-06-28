#!/bin/bash

# High Adventure Multiplayer Deployment Script
# This script helps deploy the game to various platforms

set -e

echo "🏔️ High Adventure Multiplayer Deployment Script"
echo "================================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command_exists node; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Function to install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
}

# Function to setup environment
setup_environment() {
    echo "Setting up environment..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        echo "📝 Created .env file from template"
        echo "⚠️  Please edit .env with your database configuration"
    else
        echo "✅ .env file already exists"
    fi
}

# Function to run tests
run_tests() {
    echo "Running tests..."
    # Add your test commands here
    echo "✅ Tests passed (no tests configured)"
}

# Function to build for production
build_production() {
    echo "Building for production..."
    # Add build commands if needed
    echo "✅ Build complete"
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "Deploying to Heroku..."
    
    if ! command_exists heroku; then
        echo "❌ Heroku CLI is not installed. Please install it first:"
        echo "   https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Check if app exists
    if heroku apps:info >/dev/null 2>&1; then
        echo "📦 Pushing to existing Heroku app..."
        git push heroku main
    else
        echo "📦 Creating new Heroku app..."
        heroku create
        heroku addons:create heroku-postgresql:mini
        heroku config:set NODE_ENV=production
        git push heroku main
    fi
    
    echo "✅ Deployed to Heroku"
    echo "🌐 Your app is available at: $(heroku info -s | grep web_url | cut -d= -f2)"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "Deploying to Vercel..."
    
    if ! command_exists vercel; then
        echo "❌ Vercel CLI is not installed. Installing..."
        npm install -g vercel
    fi
    
    vercel --prod
    echo "✅ Deployed to Vercel"
}

# Function to deploy with Docker
deploy_docker() {
    echo "Deploying with Docker..."
    
    if ! command_exists docker; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    docker-compose up -d
    echo "✅ Deployed with Docker"
    echo "🌐 Your app is available at: http://localhost:3000"
}

# Function to start development server
start_development() {
    echo "Starting development server..."
    npm run dev
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Setup project (install dependencies, create .env)"
    echo "2) Start development server"
    echo "3) Deploy to Heroku"
    echo "4) Deploy to Vercel"
    echo "5) Deploy with Docker"
    echo "6) Run all setup steps"
    echo "7) Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
}

# Main execution
main() {
    case $1 in
        "setup")
            check_prerequisites
            install_dependencies
            setup_environment
            ;;
        "dev")
            check_prerequisites
            install_dependencies
            start_development
            ;;
        "heroku")
            check_prerequisites
            install_dependencies
            run_tests
            build_production
            deploy_heroku
            ;;
        "vercel")
            check_prerequisites
            install_dependencies
            run_tests
            build_production
            deploy_vercel
            ;;
        "docker")
            check_prerequisites
            deploy_docker
            ;;
        "all")
            check_prerequisites
            install_dependencies
            setup_environment
            run_tests
            build_production
            echo "✅ All setup steps completed"
            echo "🚀 Ready to deploy! Choose a deployment option:"
            show_menu
            ;;
        *)
            show_menu
            ;;
    esac
}

# Handle menu selection
handle_menu_choice() {
    case $choice in
        1)
            check_prerequisites
            install_dependencies
            setup_environment
            ;;
        2)
            start_development
            ;;
        3)
            deploy_heroku
            ;;
        4)
            deploy_vercel
            ;;
        5)
            deploy_docker
            ;;
        6)
            check_prerequisites
            install_dependencies
            setup_environment
            run_tests
            build_production
            echo "✅ All setup steps completed"
            ;;
        7)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            show_menu
            ;;
    esac
}

# Run main function with arguments or show menu
if [ $# -eq 0 ]; then
    main
    handle_menu_choice
else
    main "$1"
fi 