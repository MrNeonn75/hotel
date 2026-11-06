import contextvars
import logging
import re
import sys

request_id_ctx_var: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "request_id", default=None
)


def get_request_id() -> str | None:
    return request_id_ctx_var.get()


def set_request_id(request_id: str) -> None:
    request_id_ctx_var.set(request_id)



class StructuredLogFilter(logging.Filter):
    """Log filter that injects the current request_id into every log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id() or "-"
        return True


class SensitiveDataFilter(logging.Filter):
    """
    Həssas məlumatların (phone, email, documentNumber)
    loglara düşməsinin qarşısını alan təhlükəsizlik filtri.
    """

    DOC_KEY_PATTERN = re.compile(
        r'([\'"]?(?:document[_-]?number|documentNumber|doc_number)[\'"]?\s*[:=]\s*[\'"])([^\'"\s,}{]+)([\'"])',
        re.IGNORECASE,
    )
    PHONE_KEY_PATTERN = re.compile(
        r'([\'"]?(?:phone|phoneNumber|phone_number|guest_phone|mobile)[\'"]?\s*[:=]\s*[\'"])([^\'"\s,}{]+)([\'"])',
        re.IGNORECASE,
    )
    EMAIL_KEY_PATTERN = re.compile(
        r'([\'"]?(?:email|guest_email|email_address)[\'"]?\s*[:=]\s*[\'"])([^\'"\s,}{]+)([\'"])',
        re.IGNORECASE,
    )
    STANDALONE_EMAIL_PATTERN = re.compile(
        r"\b([a-zA-Z0-9_.+-]{1,2})[a-zA-Z0-9_.+-]*@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b"
    )
    STANDALONE_PHONE_PATTERN = re.compile(
        r"(\+?994\d{2})\d{4}(\d{3})"
    )
    STANDALONE_DOC_PATTERN = re.compile(
        r"\b([A-Z]{1,2})\d{4,5}(\d{2,3})\b"
    )

    def _sanitize(self, text: str) -> str:
        if not text:
            return text
        text = self.DOC_KEY_PATTERN.sub(r"\1****\3", text)
        text = self.PHONE_KEY_PATTERN.sub(r"\1****\3", text)
        text = self.EMAIL_KEY_PATTERN.sub(r"\1****\3", text)
        text = self.STANDALONE_EMAIL_PATTERN.sub(r"\1***@\2", text)
        text = self.STANDALONE_PHONE_PATTERN.sub(r"\1****\2", text)
        text = self.STANDALONE_DOC_PATTERN.sub(r"\1****\2", text)
        return text

    def _sanitize_dict(self, data: dict) -> dict:
        cleaned = {}
        for k, v in data.items():
            key_lower = str(k).lower()
            if any(term in key_lower for term in ("document", "doc_num", "phone", "email")):
                cleaned[k] = "****"
            elif isinstance(v, str):
                cleaned[k] = self._sanitize(v)
            elif isinstance(v, dict):
                cleaned[k] = self._sanitize_dict(v)
            elif isinstance(v, (list, tuple)):
                cleaned[k] = [self._sanitize_item(i) for i in v]
            else:
                cleaned[k] = v
        return cleaned

    def _sanitize_item(self, item: object) -> object:
        if isinstance(item, str):
            return self._sanitize(item)
        elif isinstance(item, dict):
            return self._sanitize_dict(item)
        elif isinstance(item, (list, tuple)):
            res = [self._sanitize_item(i) for i in item]
            return tuple(res) if isinstance(item, tuple) else res
        return item

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self._sanitize(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = self._sanitize_dict(record.args)
            elif isinstance(record.args, tuple):
                record.args = tuple(self._sanitize_item(i) for i in record.args)
            elif isinstance(record.args, list):
                record.args = [self._sanitize_item(i) for i in record.args]
        return True


def setup_logging(level: str = "INFO") -> None:
    """Configures structured console logging for the application."""
    log_format = (
        "%(asctime)s | %(levelname)-7s | [%(request_id)s] | %(name)s | %(message)s"
    )

    formatter = logging.Formatter(fmt=log_format, datefmt="%Y-%m-%d %H:%M:%S")

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    handler.addFilter(StructuredLogFilter())
    handler.addFilter(SensitiveDataFilter())

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    root_logger.handlers = [handler]

    # Quieten noisy external loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


logger = logging.getLogger("staynow")
