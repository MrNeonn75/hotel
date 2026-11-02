import enum


class BookingStatus(enum.StrEnum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class PaymentStatus(enum.StrEnum):
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"
