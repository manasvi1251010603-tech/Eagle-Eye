import os
import uuid
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException
from app.config import UPLOADS_DIR

ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png"}
ALLOWED_PDF_EXTS = {".pdf"}
ALLOWED_EXCEL_EXTS = {".xlsx", ".xls"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


def validate_file_extension(filename: str, allowed_extensions: set) -> str:
    if not filename:
        raise HTTPException(status_code=400, detail="Filename cannot be empty")
    _, ext = os.path.splitext(filename.lower())
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{ext}'. Allowed: {', '.join(allowed_extensions)}"
        )
    return ext


async def save_uploaded_file(upload_file: UploadFile, allowed_extensions: set) -> Tuple[str, str]:
    """
    Saves an uploaded file to a safe server-controlled path with a unique UUID.
    Returns (original_filename, safe_relative_path).
    """
    ext = validate_file_extension(upload_file.filename, allowed_extensions)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOADS_DIR, unique_name)

    size = 0
    with open(dest_path, "wb") as f:
        while chunk := await upload_file.read(1024 * 1024):  # 1MB chunks
            size += len(chunk)
            if size > MAX_FILE_SIZE_BYTES:
                os.remove(dest_path)
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB"
                )
            f.write(chunk)

    return upload_file.filename, f"uploads/{unique_name}"
