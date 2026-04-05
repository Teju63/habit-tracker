#!/bin/bash
# ============================================================
# scripts/start.sh — Quick Start Script
# Smart Habit Streak Tracker — Team Vate
# ============================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}◈ Smart Habit Streak Tracker — Team Vate${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}✗ Docker is not running. Please start Docker Desktop first.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Build and start
echo -e "${YELLOW}▶ Starting all services with Docker Compose...${NC}"
echo ""

docker-compose up --build -d

echo ""
echo -e "${GREEN}✓ All services started!${NC}"
echo ""
echo -e "  🌐 Frontend:   ${BLUE}http://localhost${NC}"
echo -e "  🔧 Backend:    ${BLUE}http://localhost:3001/health${NC}"
echo -e "  📊 Prometheus: ${BLUE}http://localhost:9090${NC}"
echo -e "  📈 Grafana:    ${BLUE}http://localhost:3000${NC} (admin/vate2024)"
echo ""
echo -e "${YELLOW}To stop:  docker-compose down${NC}"
echo -e "${YELLOW}To logs:  docker-compose logs -f${NC}"
echo ""

# Wait for backend health
echo -e "${YELLOW}Waiting for backend to be healthy...${NC}"
for i in {1..15}; do
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy!${NC}"
    break
  fi
  sleep 2
  echo -n "."
done

echo ""
echo -e "${GREEN}✓ Ready! Open http://localhost in your browser.${NC}"
echo ""
