# GymForge — Database & Firestore Admin Client
import os
from pathlib import Path
from config import FIREBASE_CREDENTIALS_PATH, ENVIRONMENT

db = None
firebase_app = None
is_firestore_connected = False

# Try initializing Firebase Admin SDK if credentials exist
cred_path = Path(FIREBASE_CREDENTIALS_PATH)
if cred_path.exists() and cred_path.is_file():
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        cred = credentials.Certificate(str(cred_path))
        firebase_app = firebase_admin.initialize_app(cred)
        db = firestore.client()
        is_firestore_connected = True
        print("[Firestore] Conectado com sucesso via Firebase Admin SDK.")
    except Exception as e:
        print(f"[Firestore] Falha ao conectar ao Firestore: {e}. Utilizando Mock Database em memoria.")
else:
    print(f"[Firestore] Credenciais nao encontradas em '{FIREBASE_CREDENTIALS_PATH}'. Operando em modo de desenvolvimento local (In-Memory Mock Store).")

# In-Memory Storage Fallback for Local Development & Offline Testing
class InMemoryMockStore:
    def __init__(self):
        self.collections = {
            "users": {},
            "characters": {},
            "workouts": {},
            "workout_records": {},
            "missions": {},
            "achievements": {}
        }
    
    def get_document(self, collection: str, doc_id: str):
        return self.collections.get(collection, {}).get(doc_id)

    def set_document(self, collection: str, doc_id: str, data: dict, merge: bool = False):
        if collection not in self.collections:
            self.collections[collection] = {}
        if merge and doc_id in self.collections[collection]:
            self.collections[collection][doc_id].update(data)
        else:
            self.collections[collection][doc_id] = data
        return self.collections[collection][doc_id]

    def list_documents(self, collection: str, filter_fn = None):
        items = list(self.collections.get(collection, {}).values())
        if filter_fn:
            items = [item for item in items if filter_fn(item)]
        return items

mock_store = InMemoryMockStore()

def get_db():
    if is_firestore_connected and db:
        return db
    return mock_store
