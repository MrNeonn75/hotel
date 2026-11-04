import base64
import hashlib
import hmac
import json
import secrets
import time
from datetime import timedelta
from typing import Any

from cryptography.fernet import Fernet

from app.core.config import settings
from app.core.logging import logger


class DataEncryptor:
    """Həssas məlumatların (məs. sənəd nömrəsi) şifrələnməsi və deşifrələnməsi üçün Fernet köməkçisi."""

    def __init__(self, key: str | None = None):
        raw_key = key or settings.ENCRYPTION_KEY
        try:
            key_bytes = raw_key.encode("utf-8")
            if len(key_bytes) != 44:
                digest = hashlib.sha256(key_bytes).digest()
                key_bytes = base64.urlsafe_b64encode(digest)
            self._fernet = Fernet(key_bytes)
        except Exception as exc:
            logger.warning(f"Fernet açarı yaradılarkən xəta baş verdi: {exc}, default istifadə olunur.")
            self._fernet = Fernet(Fernet.generate_key())

    def encrypt(self, plain_text: str | None) -> str | None:
        if not plain_text:
            return plain_text
        return self._fernet.encrypt(plain_text.encode("utf-8")).decode("utf-8")

    def decrypt(self, cipher_text: str | None) -> str | None:
        if not cipher_text:
            return cipher_text
        try:
            return self._fernet.decrypt(cipher_text.encode("utf-8")).decode("utf-8")
        except Exception:
            return cipher_text


encryptor = DataEncryptor()


# ============================================================================
# Şifrələmə və Parol hashing (PBKDF2-HMAC-SHA256)
# ============================================================================

def hash_password(password: str) -> str:
    """Parolu təhlükəsiz PBKDF2-HMAC-SHA256 ilə hash-ləyir (100,000 iterasiya + 16 bayt duz)."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"pbkdf2_sha256$100000${salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Daxil edilmiş parolun saxlanılan hash ilə uyğunluğunu yoxlayır (timing attack qorunması ilə)."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = parts[2]
        expected_hash = parts[3]
        key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), iterations)
        return hmac.compare_digest(key.hex(), expected_hash)
    except Exception:
        return False


# ============================================================================
# JWT Token (RFC 7519 HMAC-SHA256)
# ============================================================================

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    padded = data + "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(padded)


def create_access_token(payload: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Standart RFC 7519 HS256 JWT access token yaradır."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    exp = now + int((expires_delta or timedelta(days=30)).total_seconds())
    data = {**payload, "iat": now, "exp": exp}

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(data, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(settings.SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> dict[str, Any] | None:
    """JWT token-i təsdiqləyir və payload-u qaytarır (müddəti bitibsə və ya imza yanlışdırsa None qaytarır)."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
        if "exp" in payload and int(time.time()) > payload["exp"]:
            return None
        return payload
    except Exception:
        return None
