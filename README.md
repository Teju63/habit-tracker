# ◈ Smart Habit Streak Tracker
### Team Vate — DevSecOps Project

> A lightweight productivity app that tracks daily tasks, weekly progress, and consistency streaks — gamifying habit-building with a full DevSecOps pipeline.

---

## 👥 Team Members

| Member | Roll No | Role |
|--------|---------|------|
| Teju P | 1MS23CS198 | CI/CD Pipeline & Containerization |
| Varsha M | 1MS23CS205 | IaC, Monitoring & Security |

---

## 🏗️ Project Architecture

```
smart-habit-tracker/
├── frontend/               # Nginx + Vanilla JS SPA
│   ├── index.html
│   ├── src/
│   │   ├── styles/         # CSS
│   │   ├── components/     # habits.js, streaks.js, analytics.js
│   │   ├── pages/          # dashboard.js, app.js
│   │   └── utils/          # storage.js, helpers.js
│   ├── nginx.conf
│   └── Dockerfile
│
├── backend/                # Node.js Express REST API
│   ├── server.js           # Main API + routes
│   ├── tests/              # Jest + Supertest tests
│   ├── package.json
│   └── Dockerfile          # Multi-stage build
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # Full GitHub Actions pipeline
│
├── k8s/                    # Kubernetes manifests
│   ├── backend-deployment.yml
│   └── frontend-deployment.yml
│
├── terraform/              # AWS Infrastructure as Code
│   ├── main.tf
│   └── variables.tf
│
├── ansible/                # Configuration management
│   ├── playbook.yml
│   └── inventory.ini
│
├── monitoring/
│   └── prometheus/
│       └── prometheus.yml
│
├── docs/
│   └── postman-collection.json
│
├── docker-compose.yml      # ← START HERE for local dev
├── sonar-project.properties
└── README.md
```

---

## 🚀 Quick Start — Run Locally in VS Code

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [VS Code](https://code.visualstudio.com/) with Docker extension (optional)

### Step 1 — Clone / Open the Project
```bash
# Open this folder in VS Code
code smart-habit-tracker/
```

### Step 2 — Start Everything with Docker Compose
```bash
# From the root of the project:
docker-compose up --build
```

That's it! All services will start:

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 Frontend | http://localhost | Habit Tracker Web App |
| 🔧 Backend API | http://localhost:3001 | REST API |
| 📊 Prometheus | http://localhost:9090 | Metrics |
| 📈 Grafana | http://localhost:3000 | Dashboards (admin/vate2024) |

### Step 3 — Verify Services
```bash
# Check all containers are running
docker-compose ps

# Check backend health
curl http://localhost:3001/health

# Check API metrics
curl http://localhost:3001/metrics
```

### Stop Everything
```bash
docker-compose down
# To also delete volumes:
docker-compose down -v
```

---

## 🧪 Running Tests

### Backend Unit Tests (Jest)
```bash
cd backend
npm install
npm test
npm test -- --coverage   # With coverage report
```

### Postman API Tests
1. Open Postman
2. Import `docs/postman-collection.json`
3. Set `baseUrl` variable to `http://localhost:3001`
4. Run the collection

---

## 🔧 Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |
| GET | `/api/habits` | List all habits |
| POST | `/api/habits` | Create new habit |
| GET | `/api/habits/:id` | Get single habit |
| PATCH | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| GET | `/api/logs/:habitId` | Get logs for habit |
| POST | `/api/logs/:habitId/toggle` | Toggle completion |
| GET | `/api/stats` | Get user stats |

---

## 🔄 CI/CD Pipeline (GitHub Actions)

The pipeline runs automatically on every push to `main` or `develop`:

```
Push → Lint → Test → Security Scan → Build Docker → Scan Images → Deploy
```

### Pipeline Stages:
1. **🔍 Lint** — ESLint code quality checks
2. **🧪 Test** — Jest unit tests with coverage report
3. **🔐 Security** — Trivy vulnerability scan + npm audit
4. **🐳 Build** — Multi-stage Docker image build + push to GHCR
5. **🛡️ Scan Images** — Trivy scan on built container images
6. **🚀 Deploy** — Deploy to production (main branch only)

### GitHub Secrets Required:
```
GITHUB_TOKEN         — Auto-provided by GitHub Actions
DEPLOY_HOST          — Your server IP (for SSH deploy)
DEPLOY_USER          — SSH username
DEPLOY_SSH_KEY       — Private SSH key for deployment
```

---

## 🏗️ Infrastructure (Terraform + AWS)

```bash
cd terraform/
terraform init
terraform plan -var="environment=production"
terraform apply
```

**Creates:**
- VPC with public/private subnets (ap-south-1 — Mumbai)
- ECS Fargate cluster for containers
- ECR repositories for Docker images
- Security groups with least-privilege rules
- CloudWatch log groups
- IAM roles

---

## ⚙️ Configuration Management (Ansible)

```bash
cd ansible/
# Edit inventory.ini with your server IPs
ansible-playbook -i inventory.ini playbook.yml
```

**Configures servers with:**
- Docker & Docker Compose
- UFW firewall rules
- fail2ban for SSH protection
- Disables root SSH login
- Deploys and starts all services

---

## ☸️ Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check pods
kubectl get pods -n habit-tracker

# Check services
kubectl get svc -n habit-tracker

# View logs
kubectl logs -f deployment/habit-backend -n habit-tracker
```

**Features:**
- Rolling update deployments (zero downtime)
- Horizontal Pod Autoscaler (2–10 replicas based on CPU/memory)
- Non-root containers with read-only filesystem
- Health probes (liveness + readiness)
- Resource limits & requests

---

## 📊 Monitoring Stack

### Prometheus (http://localhost:9090)
- Scrapes metrics from backend every 10s
- Custom metrics: `habits_total`, `api_uptime_seconds`, `logs_total`

### Grafana (http://localhost:3000)
- Login: `admin` / `vate2024`
- Pre-configured with Prometheus data source
- Create dashboards to visualize habit completion rates, API latency, etc.

---

## 🔐 Security Features

| Tool | Purpose |
|------|---------|
| **Trivy** | Container & filesystem vulnerability scanning in CI |
| **Helmet.js** | HTTP security headers on API |
| **npm audit** | Dependency vulnerability check |
| **UFW** | Server firewall (via Ansible) |
| **fail2ban** | SSH brute-force protection |
| **Non-root containers** | Docker + K8s security context |
| **Multi-stage Docker builds** | Minimal attack surface |
| **ECR scan on push** | AWS-native image scanning |
| **HashiCorp Vault** | Secrets management (integrate via env vars) |

---

## 📅 Project Timeline

| Week | Tasks |
|------|-------|
| Week 1 | ✅ Team formation, project idea, role assignment |
| Week 2 | ✅ Terraform IaC, VPC, ECS, ECR setup |
| Week 3 | ✅ CI pipeline stages defined (lint → test → scan) |
| Week 4 | ✅ Full CI/CD workflow with GitHub Actions |
| Week 5 | ✅ Docker, Kubernetes deployment configs |
| Week 6 | ✅ Prometheus + Grafana monitoring, security hardening |

---

## 🛠️ Tech Stack Summary

| Category | Tools |
|----------|-------|
| **IaC** | Terraform, Ansible |
| **CI/CD** | GitHub Actions |
| **Containerization** | Docker, Docker Compose, Kubernetes |
| **Testing** | Jest, Supertest, Postman |
| **Code Quality** | ESLint, SonarQube |
| **Monitoring** | Prometheus, Grafana |
| **Security** | Trivy, Helmet.js, UFW, fail2ban, HashiCorp Vault |
| **Registry** | GitHub Container Registry (GHCR) / AWS ECR |
| **Cloud** | AWS (ECS Fargate, VPC, ECR, IAM, CloudWatch) |

---

*© 2026 Team Vate — MSRIT, Bengaluru*
