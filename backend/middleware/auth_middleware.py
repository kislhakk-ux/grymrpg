# GymForge — Authentication & Security Middleware
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database.firestore_db import is_firestore_connected

security = HTTPBearer(auto_error=False)

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """Verifies Firebase JWT token or grants access in local development mode."""
    if not credentials:
        # Default fallback for development/demo
        return "warrior_demo_1"

    token = credentials.credentials
    if not token:
        return "warrior_demo_1"

    # If Firebase Admin is initialized
    if is_firestore_connected:
        try:
            from firebase_admin import auth
            decoded = auth.verify_id_token(token)
            return decoded["uid"]
        except Exception as e:
            # If token verification fails in production, deny
            raise HTTPException(status_code=401, detail=f"Token de autenticação inválido ou expirado: {e}")

    # In local development mode, if token is provided, extract custom demo UID or default
    return "warrior_demo_1"
