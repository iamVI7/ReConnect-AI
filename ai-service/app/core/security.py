from fastapi import Header, HTTPException, status
from jose import jwt, JWTError
from app.core.config import settings


async def verify_service_token(authorization: str = Header(default=None)):
    """
    Verifies that the incoming request carries a valid, short-lived
    service JWT signed by the Node.js backend. This is the only
    authentication mechanism for this service — it has no public routes.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing service token")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.service_jwt_secret, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid service token")

    return payload
