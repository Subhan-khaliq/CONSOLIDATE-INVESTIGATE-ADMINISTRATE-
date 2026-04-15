# CIA Project Roadmap
## Consolidate, Investigate & Administrate — I-NSA-801

> **Context:** The previous sysadmin rage-quit, leaving a partially broken and undocumented infrastructure. Your mission is to take ownership, secure it, fix it, extend it, and make it sustainable.

---

## 1. The Full Scope

### 1.1 Infrastructure Architecture

| VM | Role | Stack | Port |
|----|------|-------|------|
| VM1 | Web Frontend | React + TypeScript + Redux + Bootstrap 4 | 8080 |
| VM2 | API Backend | Node.js + Express + JWT | 3000 |
| VM3 | Database | Unknown (to investigate) | Unknown |
| VM4 | Monitoring | Portainer | Unknown |

> **Key:** API and Web must remain on **separate hosts** and the API must **not be moved**.

---

### 1.2 Mandatory Deliverables

#### Cloud / SysAdmin
- [ ] Regain admin privileges on all 4 VMs
- [ ] Keep services distributed (no service consolidation)
- [ ] All containers run as user `service-web`
- [ ] Full inventory management feature in the web app (beyond user management)
- [ ] Working web app connected to the database
- [ ] Demo-ready with `admin:admin` credentials for acceptance

#### DevOps / CI-CD
- [ ] GitLab instance set up as versioning service
- [ ] Scripted CI/CD pipeline (`.gitlab-ci.yml`)
- [ ] Nexus as artifact management software
- [ ] Nexus integrated with the CI/CD pipeline (no source code stored directly on hosts)

#### Security
- [ ] Gain root access using **dirty COW** (CVE-2016-5195) — GRUB method explicitly forbidden
- [ ] Exploit vertical vulnerabilities (privilege escalation)
- [ ] Exploit lateral vulnerabilities (pivoting between VMs)
- [ ] Patch every discovered vulnerability (preferably without upgrading the stack)
- [ ] Written security report: reproducible steps, vulnerability IDs, mitigations
- [ ] API complete logging system + extensive tests

#### Documentation
- [ ] Security report with pentest procedures
- [ ] Architecture documentation
- [ ] Hardening recommendations

---

### 1.3 Known Intel to Leverage

**Credentials list to try (from `password.txt`):**
```
itjrjheh:czcczf
kuyyuiuy:heehge
cxzxz:egye
kukuk:kykykj
bebfb:bfgbgb
eaeae:eaad
rexx:xxdsf
rree:saeae
no_rights:no_rights
toto:toto
admin:admin
titi:tata
```

**Known API routes:**
```
POST  /auth/register
GET   /user/            [JWT + ADMIN]
PATCH /user/:username   [JWT + ADMIN]
DELETE/user/:username   [JWT + ADMIN]
```

**Known tools to use:**
- Cloud: GitLab, Nexus, Docker, Portainer, VMware
- Security: NMAP, ZAProxy, Nikto, DIRB, searchsploit, John the Ripper

---

## 2. Roadmap by Phase

---

### Phase 0 — Reconnaissance & Discovery
**Goal:** Understand what you're dealing with before touching anything.

#### 2.0.1 Network Recon
- [ ] Identify IP addresses of all 4 VMs (check DHCP leases, VMware console, or nmap scan on the subnet)
- [ ] `nmap -sV -sC -p- <subnet>` to fingerprint all open ports and services
- [ ] Identify OS versions on each VM (relevant for dirty COW)

#### 2.0.2 Service Enumeration
- [ ] Try all credentials from `.creds.txt` on: SSH, Portainer, web app, API, DB
- [ ] Check Portainer for running/stopped containers and their configurations
- [ ] DIRB / Nikto on the web app and API to discover hidden routes
- [ ] Check for exposed `.env` files, config files, or Docker volumes

#### 2.0.3 Source Code Investigation
- [ ] Locate any existing code on the VMs (check `/home`, `/var/www`, `/opt`, `/srv`)
- [ ] Examine Dockerfiles and `docker-compose.yml` for hardcoded credentials or misconfigs
- [ ] Check git history if any repo is present (`.git` folders, `git log`)

**Deliverable:** Network map + service inventory table.

---

### Phase 1 — Access Recovery (Privilege Escalation)
**Goal:** Regain full admin/root access on all VMs.

#### 2.1.1 Initial Access
- [ ] SSH into VMs using found credentials
- [ ] Try credential spraying across all services
- [ ] If no SSH access: exploit exposed API or web vulnerabilities (SQLi, path traversal, RCE)

#### 2.1.2 Vertical Privilege Escalation
- [ ] Check current user's sudo rights: `sudo -l`
- [ ] Check SUID binaries: `find / -perm -u=s -type f 2>/dev/null`
- [ ] Check for writable cron jobs: `ls -la /etc/cron*`
- [ ] Check kernel version: `uname -r` → target dirty COW if kernel ≤ 4.8.3

#### 2.1.3 Dirty COW Exploit (CVE-2016-5195)
- [ ] Confirm vulnerable kernel (Linux < 4.8.3, or specific patched versions)
- [ ] Download dirty COW PoC (e.g., `dirtycow.c` or `dirty.c`)
- [ ] Compile on target or cross-compile: `gcc -pthread dirty.c -o dirty -lcrypt`
- [ ] Execute and escalate to root
- [ ] Document the exact steps and kernel version exploited
- [ ] **Patch:** upgrade kernel or apply vendor patch; document mitigation

#### 2.1.4 Lateral Movement (Pivoting)
- [ ] After rooting VM1, check for SSH keys: `~/.ssh/`, `/root/.ssh/`
- [ ] Check `/etc/hosts` and ARP tables for other VMs
- [ ] Test reused credentials across VMs
- [ ] Check Docker socket exposure: `ls -la /var/run/docker.sock`
- [ ] Check for shared volumes or network bridges between containers
- [ ] Document each pivot step and patch the vector

**Deliverable:** Root shell on all 4 VMs + documented exploit chain.

---

### Phase 2 — Infrastructure Consolidation
**Goal:** Fix what's broken, stabilize services.

#### 2.2.1 Portainer Setup
- [ ] Confirm Portainer is accessible and credentials work
- [ ] If broken: re-deploy Portainer container
- [ ] Change default/weak Portainer admin password
- [ ] Connect all VMs as Portainer endpoints

#### 2.2.2 Database Recovery
- [ ] Identify DB type (MySQL/PostgreSQL/MongoDB — check docker-compose or running containers)
- [ ] Restore connectivity from API to DB
- [ ] Check DB for existing data; backup if needed
- [ ] Change default/weak DB credentials

#### 2.2.3 API Recovery
- [ ] Confirm API is running and responds to known routes
- [ ] Fix any broken DB connection strings in environment variables
- [ ] Ensure API runs as `service-web` user inside container
- [ ] Verify JWT secret is set and not trivially guessable

#### 2.2.4 Frontend Recovery
- [ ] Confirm React app builds and serves correctly
- [ ] Fix API endpoint URL in frontend config (`.env` or config file)
- [ ] Confirm `admin:admin` login works end-to-end

**Deliverable:** All 4 VMs with running, interconnected services.

---

### Phase 3 — Security Hardening
**Goal:** Patch all found vulnerabilities and harden the infra.

#### 2.3.1 Authentication & Access
- [ ] Remove/disable all default and weak accounts
- [ ] Enforce strong passwords or SSH key-only auth
- [ ] Rotate all credentials found in `.creds.txt`
- [ ] Implement JWT expiration and refresh token strategy on the API
- [ ] Disable `root` SSH login (`PermitRootLogin no` in `sshd_config`)

#### 2.3.2 Container Security
- [ ] Ensure no container runs as `root`; confirm `service-web` user everywhere
- [ ] Remove `--privileged` flag from any container if present
- [ ] Do not expose Docker socket to containers unless strictly necessary
- [ ] Use read-only mounts where possible
- [ ] Implement Docker resource limits (CPU, memory)

#### 2.3.3 Network Security
- [ ] Set up firewall rules (UFW or iptables): only necessary ports open
- [ ] Ensure DB is not exposed to the internet (only reachable from API container)
- [ ] Restrict Portainer access to internal network only

#### 2.3.4 API Security
- [ ] Add rate limiting middleware (e.g., `express-rate-limit`)
- [ ] Add helmet.js for security headers
- [ ] Sanitize all inputs (prevent SQLi, XSS)
- [ ] Remove stack traces from error responses in production
- [ ] Add CORS policy (restrict to frontend domain only)

#### 2.3.5 System Hardening
- [ ] Patch dirty COW after documenting it
- [ ] Update all packages: `apt-get update && apt-get upgrade`
- [ ] Remove unnecessary services and packages
- [ ] Set up fail2ban for SSH brute-force protection
- [ ] Review and restrict SUID binaries

**Deliverable:** Hardening report with before/after state for each issue.

---

### Phase 4 — API Logging System
**Goal:** Complete, testable logging on the API.

#### 2.4.1 Logging Implementation
- [ ] Add `winston` or `morgan` logging middleware to Express
- [ ] Log all HTTP requests: method, route, status code, response time, IP
- [ ] Log authentication events: login success/failure, token validation
- [ ] Log errors with stack traces (to file, not to response)
- [ ] Use log levels: `info`, `warn`, `error`, `debug`
- [ ] Output logs to both console (stdout) and rotating log file

#### 2.4.2 Log Configuration
- [ ] Separate log files: `access.log`, `error.log`
- [ ] Implement log rotation (daily, max size)
- [ ] Include timestamps and request IDs in all log entries
- [ ] Ensure sensitive data (passwords, tokens) is never logged

#### 2.4.3 Extensive Testing
- [ ] Test all API endpoints and verify log entries are generated
- [ ] Simulate authentication failures and confirm error logs
- [ ] Test log rotation under high volume
- [ ] Verify logs persist across container restarts (Docker volume)
- [ ] Include logging tests in CI pipeline

**Deliverable:** Logging system with test evidence in the security report.

---

### Phase 5 — Inventory Feature Development
**Goal:** Add full inventory management to the web application.

#### 2.5.1 Backend (API)
- [ ] Design inventory data model (Item: id, name, description, quantity, category, etc.)
- [ ] Create DB migration/schema for inventory table
- [ ] Implement REST routes:
  - `GET /inventory` — list all items
  - `GET /inventory/:id` — get one item
  - `POST /inventory` — create item [ADMIN]
  - `PATCH /inventory/:id` — edit item [ADMIN]
  - `DELETE /inventory/:id` — delete item [ADMIN]
- [ ] Add JWT + role middleware to inventory routes
- [ ] Add logging to all inventory operations

#### 2.5.2 Frontend (React)
- [ ] Create `Inventory` page/component with item list table
- [ ] Add create/edit/delete forms (admin only)
- [ ] Integrate Redux state for inventory data
- [ ] Add React Router route: `/inventory`
- [ ] Display in navigation bar

#### 2.5.3 Testing
- [ ] Manual end-to-end test with `admin:admin`
- [ ] Test access control (non-admin cannot create/edit/delete)
- [ ] Prepare demo scenario for presentation

**Deliverable:** Functional inventory CRUD in the web app.

---

### Phase 6 — CI/CD & Artifact Management
**Goal:** Automated, reproducible deployment pipeline.

#### 2.6.1 GitLab Setup
- [ ] Deploy GitLab CE on a VM (or use dedicated VM if resources allow)
- [ ] Configure GitLab with a runner (Docker executor)
- [ ] Push all project code to GitLab repositories
- [ ] Set up GitLab groups/projects for: frontend, backend, infra

#### 2.6.2 Nexus Repository Manager
- [ ] Deploy Nexus OSS container
- [ ] Configure a Docker hosted repository
- [ ] Configure an npm hosted repository (for node_modules cache / packages)
- [ ] Link Nexus credentials to GitLab CI variables (secrets)

#### 2.6.3 CI/CD Pipeline (`.gitlab-ci.yml`)
- [ ] **Build stage:** Build Docker image for API and frontend
- [ ] **Test stage:** Run linting and unit tests
- [ ] **Publish stage:** Push Docker image to Nexus Docker registry (tagged with commit SHA)
- [ ] **Deploy stage:** Pull image from Nexus and restart container on target VM (via SSH or Docker API)
- [ ] Ensure no source code is stored directly on host VMs — only pull images from Nexus

#### 2.6.4 Pipeline Validation
- [ ] Trigger pipeline on every push to `main`/`master`
- [ ] Confirm rollback works by deploying a previous image tag
- [ ] Document pipeline flow in architecture diagram

**Deliverable:** End-to-end pipeline: `git push` → build → test → publish to Nexus → deploy.

---

### Phase 7 — Documentation & Presentation
**Goal:** Professional deliverables for evaluation.

#### 2.7.1 Security Report
Structure:
1. Executive Summary
2. Infrastructure Architecture (diagram)
3. Recon & Enumeration findings
4. Vulnerability table (CVE, severity, affected VM, exploitation method)
5. Per-vulnerability: steps to reproduce → evidence (screenshots/logs) → patch applied → recommendation
6. Privilege escalation chain (dirty COW walkthrough)
7. Lateral movement chain
8. Hardening checklist
9. Logging system documentation

#### 2.7.2 Architecture Documentation
- [ ] Network diagram (4 VMs + container layout)
- [ ] CI/CD pipeline diagram
- [ ] Data flow diagram (Frontend → API → DB)

#### 2.7.3 Demo Preparation
- [ ] Login with `admin:admin` → show dashboard
- [ ] Show inventory management (create, edit, delete)
- [ ] Show user management
- [ ] Show Portainer with all containers
- [ ] Show GitLab pipeline running
- [ ] Show Nexus with pushed Docker image
- [ ] Show API logs live

---

## 3. Milestone Plan

| Milestone | Duration | Key Outcomes |
|-----------|----------|--------------|
| **M0 – Recon** | Day 1–2 | Network map, all services identified, credentials tested |
| **M1 – Access** | Day 2–4 | Root on all VMs, dirty COW documented, lateral pivoting documented |
| **M2 – Stabilize** | Day 4–6 | All 4 services running, frontend connected to API + DB |
| **M3 – Security** | Day 6–9 | All vulnerabilities patched, API logging operational |
| **M4 – Features** | Day 9–13 | Inventory CRUD live in web app |
| **M5 – DevOps** | Day 13–17 | GitLab + Nexus + CI/CD pipeline functional |
| **M6 – Docs & Demo** | Day 17–21 | Security report complete, demo rehearsed |

---

## 4. Tools Reference

| Tool | Purpose | Phase |
|------|---------|-------|
| nmap | Port scanning & service fingerprinting | 0 |
| DIRB | Web directory brute-forcing | 0 |
| Nikto | Web vulnerability scanning | 0 |
| ZAProxy | Web app active security scanning | 0, 3 |
| searchsploit | CVE lookup for identified versions | 1 |
| John the Ripper | Password cracking (hashed creds) | 1 |
| dirty COW (CVE-2016-5195) | Kernel privilege escalation | 1 |
| Portainer | Container monitoring & management | 2 |
| Docker / docker-compose | Container orchestration | 2, 5, 6 |
| GitLab CE | Version control + CI/CD | 6 |
| Nexus OSS | Docker & npm artifact registry | 6 |
| VMware | VM management | 0–6 |
| winston / morgan | Node.js API logging | 4 |

---

## 5. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Kernel version not vulnerable to dirty COW | Medium | High | Have alternative privesc vectors ready (SUID, sudo misconfig, cron) |
| GitLab too heavy for VM resources | Medium | Medium | Use GitLab CE minimal install or consider Gitea as fallback |
| DB data corrupted/missing | Low | High | Backup immediately after gaining access; restore from any available dump |
| Container user constraint breaks services | Medium | Medium | Test `service-web` UID/GID compatibility during stabilization phase |
| CI/CD pipeline fails in deploy stage | Low | Medium | Test SSH deploy scripts manually first |

---

*Document version: 1.0 — CIA I-NSA-801 — Epitech MSc IT*
