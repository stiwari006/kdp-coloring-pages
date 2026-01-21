.PHONY: help install build test lint dev start worker docker-build docker-up docker-down deploy

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

build: ## Build the application
	npm run build

test: ## Run tests
	npm test

lint: ## Run linter
	npm run lint

dev: ## Start development server
	npm run dev

start: ## Start production server
	npm start

worker: ## Start worker process
	npm run worker

docker-build: ## Build Docker images
	docker build -t kdp-coloring-pages:latest .
	docker build -f Dockerfile.worker -t kdp-coloring-pages-worker:latest .

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

deploy: build ## Deploy to production (customize for your platform)
	@echo "Deploying to production..."
	# Add your deployment commands here
	# Example: vercel --prod
