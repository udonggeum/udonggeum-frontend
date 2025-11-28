.PHONY: all init install dev build test lint clean docker-build docker-run docker-stop docker-clean pushall help

# Default target
all: build

# Help command
help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Run ESLint"
	@echo "  make clean        - Clean build artifacts"
	@echo ""
	@echo "Docker commands:"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run Docker container"
	@echo "  make docker-stop  - Stop Docker container"
	@echo "  make docker-clean - Remove Docker image and container"
	@echo "  make pushall      - Build and push to GitHub Container Registry"

# Initialize project
init:
	@echo "Initializing project..."
	@$(MAKE) install

# Install dependencies
install:
	@echo "Installing dependencies..."
	@npm ci

# Start development server
dev:
	@echo "Starting development server..."
	@npm run dev

# Build for production
build:
	@echo "Building for production..."
	@npm run build

# Run tests
test:
	@echo "Running tests..."
	@npm run test

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@npm run test:coverage

# Run linter
lint:
	@echo "Running ESLint..."
	@npm run lint

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist
	@rm -rf node_modules/.vite
	@rm -rf coverage
	@echo "Clean complete!"

# Docker: Build image
docker-build:
	@echo "Building Docker image..."
	@docker build -t ghcr.io/udonggeum/udonggeum-frontend:latest .
	@echo "Docker image built successfully!"

# Docker: Run container
docker-run:
	@echo "Running Docker container..."
	@docker run -d --name udonggeum-frontend -p 80:80 ghcr.io/udonggeum/udonggeum-frontend:latest
	@echo "Container started! Access at http://localhost"

# Docker: Stop container
docker-stop:
	@echo "Stopping Docker container..."
	@docker stop udonggeum-frontend 2>/dev/null || true
	@docker rm udonggeum-frontend 2>/dev/null || true
	@echo "Container stopped!"

# Docker: Clean up
docker-clean: docker-stop
	@echo "Removing Docker image..."
	@docker rmi ghcr.io/udonggeum/udonggeum-frontend:latest 2>/dev/null || true
	@echo "Docker cleanup complete!"

# Build and push to GitHub Container Registry
pushall:
	@echo "Building and pushing Docker image to GHCR..."
	@docker build -t ghcr.io/udonggeum/udonggeum-frontend:latest-test .
	@docker push ghcr.io/udonggeum/udonggeum-frontend:latest-test
	@echo "Push complete!"

# Docker Compose: Start all services
compose-up:
	@echo "Starting all services with docker-compose..."
	@docker-compose up -d --build

# Docker Compose: Stop all services
compose-down:
	@echo "Stopping all services..."
	@docker-compose down

# Docker Compose: View logs
compose-logs:
	@docker-compose logs -f

# Full cleanup (node_modules, dist, docker)
clean-all: clean docker-clean
	@echo "Removing node_modules..."
	@rm -rf node_modules
	@echo "Full cleanup complete!"
