from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import hashlib
import time
import json
from datetime import datetime

app = FastAPI(title="ForensiChain API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

investigators: dict = {}
evidence_items: dict = {}
blockchain: list = []
dh_sessions: dict = {}

def sha256(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def sign_transaction(transaction: str, private_key: str) -> str:
    tx_hash = sha256(transaction)
    return sha256(tx_hash + private_key)

def verify_signature(transaction: str, signature: str, public_key: str) -> bool:
    tx_hash = sha256(transaction)
    expected = sha256(tx_hash + public_key)
    return expected == signature

def compute_block_hash(index: int, timestamp: str, data: dict, previous_hash: str) -> str:
    block_str = json.dumps({"index": index, "timestamp": timestamp, "data": data, "previous_hash": previous_hash}, sort_keys=True)
    return sha256(block_str)

def add_block(data: dict) -> dict:
    index = len(blockchain)
    timestamp = datetime.utcnow().isoformat()
    previous_hash = blockchain[-1]["hash"] if blockchain else "0" * 64
    block_hash = compute_block_hash(index, timestamp, data, previous_hash)
    block = {"index": index, "timestamp": timestamp, "data": data, "previous_hash": previous_hash, "hash": block_hash}
    blockchain.append(block)
    return block

def verify_chain() -> list:
    tampered = []
    for i, block in enumerate(blockchain):
        expected = compute_block_hash(block["index"], block["timestamp"], block["data"], block["previous_hash"])
        if expected != block["hash"]:
            tampered.append(i)
        if i > 0 and block["previous_hash"] != blockchain[i-1]["hash"]:
            if i not in tampered:
                tampered.append(i)
    return tampered

class InvestigatorCreate(BaseModel):
    name: str
    private_key: str

class EvidenceCreate(BaseModel):
    evidence_id: str
    name: str
    description: str
    file_hash: str
    investigator_name: str
    private_key: str

class AccessLog(BaseModel):
    investigator_name: str
    private_key: str
    evidence_id: str
    action: str
    notes: Optional[str] = ""

class DHInitiate(BaseModel):
    initiator: str
    p: int = 29
    g: int = 3
    private_key_a: int = 4

class DHRespond(BaseModel):
    session_id: str
    private_key_b: int = 7

class VerifyRequest(BaseModel):
    transaction: str
    signature: str
    private_key: str

@app.get("/")
def root():
    return {"message": "ForensiChain API running", "blocks": len(blockchain)}

@app.post("/investigators/create")
def create_investigator(data: InvestigatorCreate):
    if data.name in investigators:
        raise HTTPException(400, "Investigator already exists")
    public_key = data.private_key
    investigators[data.name] = {"name": data.name, "private_key": data.private_key, "public_key": public_key, "created_at": datetime.utcnow().isoformat()}
    block = add_block({"type": "INVESTIGATOR_REGISTERED", "name": data.name, "public_key": public_key})
    return {"success": True, "public_key": public_key, "block": block}

@app.get("/investigators")
def list_investigators():
    return [{"name": v["name"], "public_key": v["public_key"], "created_at": v["created_at"]} for v in investigators.values()]

@app.post("/investigators/login")
def login(data: InvestigatorCreate):
    inv = investigators.get(data.name)
    if not inv:
        raise HTTPException(404, "Investigator not found")
    if inv["private_key"] != data.private_key:
        raise HTTPException(401, "Invalid private key")
    return {"success": True, "public_key": inv["public_key"], "name": inv["name"]}

@app.post("/evidence/register")
def register_evidence(data: EvidenceCreate):
    inv = investigators.get(data.investigator_name)
    if not inv:
        raise HTTPException(404, "Investigator not found")
    if inv["private_key"] != data.private_key:
        raise HTTPException(401, "Invalid private key")
    if data.evidence_id in evidence_items:
        raise HTTPException(400, "Evidence ID already exists")
    transaction = f"{data.investigator_name} registers evidence {data.evidence_id} with hash {data.file_hash}"
    signature = sign_transaction(transaction, data.private_key)
    evidence_items[data.evidence_id] = {"id": data.evidence_id, "name": data.name, "description": data.description, "file_hash": data.file_hash, "registered_by": data.investigator_name, "registered_at": datetime.utcnow().isoformat()}
    block = add_block({"type": "EVIDENCE_REGISTERED", "evidence_id": data.evidence_id, "evidence_name": data.name, "file_hash": data.file_hash, "registered_by": data.investigator_name, "public_key": inv["public_key"], "transaction": transaction, "signature": signature})
    return {"success": True, "signature": signature, "block": block}

@app.get("/evidence")
def list_evidence():
    return list(evidence_items.values())

@app.post("/access/log")
def log_access(data: AccessLog):
    inv = investigators.get(data.investigator_name)
    if not inv:
        raise HTTPException(404, "Investigator not found")
    if inv["private_key"] != data.private_key:
        raise HTTPException(401, "Invalid private key")
    if data.evidence_id not in evidence_items:
        raise HTTPException(404, "Evidence not found")
    timestamp = datetime.utcnow().isoformat()
    transaction = f"{data.investigator_name} performed {data.action} on evidence {data.evidence_id} at {timestamp}"
    signature = sign_transaction(transaction, data.private_key)
    valid = verify_signature(transaction, signature, inv["public_key"])
    block = add_block({"type": "ACCESS_LOG", "investigator": data.investigator_name, "public_key": inv["public_key"], "evidence_id": data.evidence_id, "action": data.action, "notes": data.notes, "transaction": transaction, "signature": signature, "verified": valid, "timestamp": timestamp})
    return {"success": True, "transaction": transaction, "signature": signature, "verified": valid, "block": block}

@app.post("/verify")
def verify(data: VerifyRequest):
    result = verify_signature(data.transaction, data.signature, data.private_key)
    return {"valid": result, "transaction": data.transaction}

@app.get("/blockchain")
def get_blockchain():
    tampered = verify_chain()
    return {"chain": blockchain, "length": len(blockchain), "tampered_indices": tampered, "is_valid": len(tampered) == 0}

@app.get("/blockchain/verify")
def check_integrity():
    tampered = verify_chain()
    return {"is_valid": len(tampered) == 0, "tampered_indices": tampered, "total_blocks": len(blockchain)}

@app.post("/dh/initiate")
def dh_initiate(data: DHInitiate):
    p, g, a = data.p, data.g, data.private_key_a
    A = pow(g, a, p)
    session_id = sha256(f"{data.initiator}{time.time()}")[:16]
    dh_sessions[session_id] = {"initiator": data.initiator, "p": p, "g": g, "a_private": a, "a_public": A, "status": "WAITING"}
    return {"session_id": session_id, "p": p, "g": g, "a_public": A}

@app.post("/dh/respond")
def dh_respond(data: DHRespond):
    session = dh_sessions.get(data.session_id)
    if not session:
        raise HTTPException(404, "DH session not found")
    p, g, b = session["p"], session["g"], data.private_key_b
    B = pow(g, b, p)
    a_shared = pow(B, session["a_private"], p)
    b_shared = pow(session["a_public"], b, p)
    match = a_shared == b_shared
    session.update({"b_private": b, "b_public": B, "a_shared": a_shared, "b_shared": b_shared, "status": "ESTABLISHED" if match else "FAILED"})
    block = add_block({"type": "DH_KEY_EXCHANGE", "session_id": data.session_id, "initiator": session["initiator"], "p": p, "g": g, "a_public": session["a_public"], "b_public": B, "shared_secret": a_shared if match else "MISMATCH", "secure_channel": match})
    return {"session_id": data.session_id, "p": p, "g": g, "a_public": session["a_public"], "b_public": B, "a_shared_key": a_shared, "b_shared_key": b_shared, "match": match, "secure_channel_established": match, "block": block}

@app.get("/dh/sessions")
def list_dh_sessions():
    return [{k: v for k, v in s.items() if k not in ("a_private", "b_private")} for s in dh_sessions.values()]
