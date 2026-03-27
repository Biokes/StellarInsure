import os
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from ..services.storage_service import storage_service
from ..errors import FileNotFoundStorageError, InvalidStorageTokenError

router = APIRouter(prefix="/storage", tags=["storage"])

@router.get(
    "/files/{token}",
    summary="Retrieve a secure file",
    description="Serves a file if the provided token is valid, has not expired, and contains a valid signature for the requested file path.",
    responses={
        200: {
            "description": "The requested file",
            "content": {"image/*": {}, "application/pdf": {}}
        },
        404: {"description": "File not found or invalid/expired token"},
        403: {"description": "Invalid signature or token"}
    }
)
async def get_file(token: str):
    """
    Serves a file if the provided token is valid and hasn't expired.
    """
    try:
        file_path = storage_service.validate_token(token)
    except:
        raise InvalidStorageTokenError()
    
    if not os.path.exists(file_path):
        raise FileNotFoundStorageError()
    
    return FileResponse(file_path)
