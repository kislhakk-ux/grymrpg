# GymForge — Authentication & Security Middleware
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database.firestore_db import is_firestore_connected

security = HTTPBearer(auto_error=False)

async def get_current_user_id(request: Request, credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """Verifies Firebase JWT token or extracts client user ID from headers/params."""
    # 1. Custom Header from frontend
    x_user_id = request.headers.get("x-user-id")
    if x_user_id and x_user_id.strip():
        return x_user_id.strip()

    # 2. Query Parameter
    q_user_id = request.query_params.get("userId")
    if q_user_id and q_user_id.strip():
        return q_user_id.strip()

    # 3. Firebase Token
    if credentials and credentials.credentials:
        token = credentials.credentials
        if is_firestore_connected:
            try:
                from firebase_admin import auth
                decoded = auth.verify_id_token(token)
                return decoded["uid"]
            except Exception as e:
                raise HTTPException(status_code=401, detail=f"Token de autenticação inválido ou expirado: {e}")
        return token

    return "warrior_demo_1"
