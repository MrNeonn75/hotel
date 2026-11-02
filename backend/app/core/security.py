import base64

from cryptography.fernet import Fernet

from app.core.config import settings
from app.core.logging import logger


class DataEncryptor:
    """Həssas məlumatların (məs. sənəd nömrəsi) şifrələnməsi və deşifrələnməsi üçün Fernet köməkçisi."""

    def __init__(self, key: str | None = None):
        raw_key = key or settings.ENCRYPTION_KEY
        try:
            # Ensure key is valid Fernet 32-byte url-safe base64
            key_bytes = raw_key.encode("utf-8")
            # If not properly padded/formatted, generate/pad
            if len(key_bytes) != 44:
                # pad or digest to 32 bytes and base64 encode
                import hashlib
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
