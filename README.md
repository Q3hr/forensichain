# ForensiChain — Blockchain-Based Forensic Investigator Identity & Access Log

## Use Case
Digital Forensics: Every forensic investigator has a cryptographic identity (wallet). 
Every time they access, analyze, or transfer evidence, that action is signed with their 
private key and permanently recorded on the blockchain. Tamper-proof. Court-admissible.

## Architecture
- **Frontend**: React (Vite) → hosted on Vercel
- **Backend**: FastAPI (Python) → hosted on Render
- **Crypto**: SHA-256 digital signatures + Diffie-Hellman key exchange

---

## HOW TO RUN LOCALLY

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 2. Frontend (React)
```bash
cd frontend
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

---

## HOW TO DEPLOY FREE

### Step A: Deploy Backend to Render

1. Go to https://render.com and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo (push this project to GitHub first)
4. Set:
   - Root directory: `backend`
   - Environment: `Python 3`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click "Create Web Service"
6. Wait ~2 minutes. Copy your Render URL, e.g.:
   `https://forensichain-api.onrender.com`

### Step B: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up (free)
2. Click "New Project" → Import your GitHub repo
3. Set:
   - Root directory: `frontend`
   - Framework: Vite
   - Add Environment Variable:
     - Name: `VITE_API_URL`
     - Value: `https://forensichain-api.onrender.com` (your Render URL)
4. Click "Deploy"
5. Your app is live at: `https://forensichain.vercel.app`

### Step C: Push to GitHub First
```bash
cd forensichain
git init
git add .
git commit -m "ForensiChain - Blockchain Forensics Lab Project"
git remote add origin https://github.com/YOUR_USERNAME/forensichain.git
git push -u origin main
```

---

## FEATURES (All Lab Requirements Satisfied)

| Requirement | Implementation |
|---|---|
| Multiple Wallets | Each investigator: name + private key → SHA-256 public key |
| Transaction System | Evidence access events = signed transactions |
| Digital Signatures | SHA-256(SHA-256(tx) + private_key) = signature |
| Verification System | verify_signature() checks before any block is added |
| Blockchain Storage | Immutable list of blocks, each linked by hash |
| Diffie-Hellman | Full DH session: initiate → respond → shared secret |

## PAGES
- **Dashboard** — Live stats, recent blocks, system overview
- **Investigators** — Create wallets, view public keys
- **Evidence Vault** — Register evidence with file hashes + signatures
- **Access Log** — Sign and log every evidence access action
- **Blockchain** — View full chain, detect tampered blocks
- **DH Key Exchange** — Interactive Diffie-Hellman simulation
- **Verify Signature** — Standalone signature verification tool

---
Lab: Blockchain & Technology Lab 11 | BS-CS 6th Semester
