# ⛓ ForensiChain
### Blockchain-Based Forensic Investigator Identity & Access Log

> This was a Mini Project for my Blockchain & Technology Lab (Lab 11) — BS-CS 6th Semester

[![Live Demo](https://img.shields.io/badge/Live%20Demo-forensichain.vercel.app-00d4ff?style=flat-square&logo=vercel)](https://forensichain.vercel.app/)
[![Backend](https://img.shields.io/badge/API-Render-00ff9d?style=flat-square)](https://forensichain-api.onrender.com)
![Python](https://img.shields.io/badge/Python-FastAPI-blue?style=flat-square&logo=python)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb?style=flat-square&logo=react)

---

## 🎯 Use Case — Digital Forensics

In a real cybercrime investigation, evidence integrity is everything. ForensiChain simulates how a blockchain can be used to:

- Track **who accessed which evidence**, when, and what they did
- Ensure every action is **cryptographically signed** and cannot be denied
- Detect **tampering** instantly through hash chain verification
- Establish **secure communication channels** between investigators using Diffie-Hellman

Every investigator has a cryptographic identity. Every access is a signed transaction. Every transaction is a permanent block. Court-admissible. Tamper-proof.

---

## 🔐 Cryptographic Concepts Covered

| Concept | Implementation |
|---|---|
| Digital Signatures | SHA-256 based sign & verify on every transaction |
| Public/Private Keys | Each investigator wallet has a key pair |
| Blockchain Storage | Immutable linked list of signed blocks |
| Hash Chain Integrity | Each block stores previous block's hash |
| Diffie-Hellman Key Exchange | Secure channel establishment between two investigators |
| Tamper Detection | Any modified block breaks the hash chain |

---

## 🖥 Features

- **Investigator Wallets** — Register identities with private/public key pairs
- **Evidence Vault** — Register digital evidence with SHA-256 file hashes
- **Access Log** — Sign and record every evidence access (VIEW, ANALYZE, TRANSFER, SEAL, EXPORT, HASH_CHECK)
- **Blockchain Explorer** — View the full immutable chain, click blocks to inspect hashes and signatures
- **DH Key Exchange** — Interactive visual showing both parties computing the same shared secret
- **Signature Verifier** — Verify any transaction signature — proves authenticity in court

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Crypto | Python `hashlib` (SHA-256) |
| Hosting (Frontend) | Vercel |
| Hosting (Backend) | Render |

---

## 🚀 Running Locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

**Frontend**
```bash
cd frontend
echo "VITE_API_URL=http://localhost:8000" > .env
npm install
npm run dev
# runs at http://localhost:5173
```

---

## 📁 Project Structure

```
forensichain/
├── backend/
│   ├── main.py           # FastAPI app — all routes & crypto logic
│   ├── requirements.txt
│   └── render.yaml       # Render deployment config
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Investigators.jsx
│   │   │   ├── Evidence.jsx
│   │   │   ├── AccessLog.jsx
│   │   │   ├── Blockchain.jsx
│   │   │   ├── DHExchange.jsx
│   │   │   └── Verify.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── index.css
│   └── vercel.json
└── README.md
```

---

## 📋 Lab Requirements Satisfied

| Requirement | Status |
|---|---|
| Multiple Wallets (Investigators) | ✅ |
| Transaction System | ✅ |
| Digital Signature System | ✅ |
| Verification System | ✅ |
| Blockchain Storage | ✅ |
| Diffie-Hellman Integration | ✅ |
| Frontend (React) | ✅ |
| Backend (FastAPI) | ✅ |
| Hosted & Deployed | ✅ |

---

## 👤 Author

**BS-CS 6th Semester**  
Blockchain & Technology Lab — Lab 11  
Instructor: Muniba Khan
