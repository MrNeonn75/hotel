import uuid
from decimal import Decimal

from app.core.errors import NotFoundError
from app.models.review import Review
from app.models.user import User
from app.repositories.hotel_repo import HotelRepository
from app.repositories.review_repo import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewListResponse, ReviewResponse


class ReviewService:
    def __init__(self, review_repo: ReviewRepository, hotel_repo: HotelRepository):
        self.review_repo = review_repo
        self.hotel_repo = hotel_repo

    async def get_reviews(self, hotel_id: str, limit: int = 50, offset: int = 0) -> ReviewListResponse:
        try:
            val = uuid.UUID(hotel_id)
        except Exception:
            raise NotFoundError("Otel tapılmadı") from None

        hotel = await self.hotel_repo.get_by_id(val)
        if not hotel:
            raise NotFoundError("Otel tapılmadı")

        reviews = await self.review_repo.get_by_hotel_id(val, limit=limit, offset=offset)
        items = [
            ReviewResponse(
                id=str(r.id),
                hotel_id=str(r.hotel_id),
                user_name=r.user_name,
                user_avatar=r.user_avatar,
                user_country=r.user_country,
                rating=float(r.rating),
                date=r.created_at.strftime("%Y-%m-%d"),
                comment=r.comment,
                room_type=r.room_type,
            )
            for r in reviews
        ]
        return ReviewListResponse(items=items, total=hotel.review_count)

    async def add_review(
        self,
        hotel_id: str,
        req: ReviewCreate,
        user: User | None = None,
    ) -> ReviewResponse:
        try:
            val = uuid.UUID(hotel_id)
        except Exception:
            raise NotFoundError("Otel tapılmadı") from None

        hotel = await self.hotel_repo.get_by_id(val)
        if not hotel:
            raise NotFoundError("Otel tapılmadı")

        user_name = (
            f"{user.first_name} {user.last_name}".strip()
            if user and (user.first_name or user.last_name)
            else (req.user_name or "Qonaq")
        )
        user_avatar = user.avatar if user else None

        review = Review(
            id=uuid.uuid4(),
            hotel_id=val,
            user_id=user.id if user else None,
            user_name=user_name,
            user_avatar=user_avatar,
            user_country=req.user_country or "Azərbaycan",
            rating=Decimal(str(round(req.rating, 1))),
            comment=req.comment.strip(),
            room_type=req.room_type,
        )
        created = await self.review_repo.create(review)

        # Otelin reytinq və rəy sayını atomik yenidən hesabla
        avg_rating, total_count = await self.review_repo.get_rating_stats(val)
        hotel.rating = avg_rating
        hotel.review_count = total_count
        await self.hotel_repo.session.commit()

        return ReviewResponse(
            id=str(created.id),
            hotel_id=str(created.hotel_id),
            user_name=created.user_name,
            user_avatar=created.user_avatar,
            user_country=created.user_country,
            rating=float(created.rating),
            date=created.created_at.strftime("%Y-%m-%d"),
            comment=created.comment,
            room_type=created.room_type,
        )

