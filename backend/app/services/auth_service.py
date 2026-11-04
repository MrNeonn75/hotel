import uuid
from datetime import timedelta

from app.core.errors import ConflictError, ForbiddenError, NotFoundError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import (
    AuthTokenResponse,
    UserLoginRequest,
    UserResponse,
    UserSignupRequest,
    UserUpdateRequest,
)


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def signup(self, req: UserSignupRequest) -> AuthTokenResponse:
        existing = await self.user_repo.get_by_email(req.email)
        if existing:
            raise ConflictError("Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib")

        hashed = hash_password(req.password)
        new_user = User(
            id=uuid.uuid4(),
            email=str(req.email).strip().lower(),
            password_hash=hashed,
            first_name=req.first_name.strip(),
            last_name=req.last_name.strip(),
            phone=req.phone.strip(),
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            is_active=True,
        )
        created = await self.user_repo.create(new_user)

        token = create_access_token(
            {"sub": str(created.id), "email": created.email},
            expires_delta=timedelta(days=30),
        )

        return AuthTokenResponse(
            user=UserResponse(
                id=str(created.id),
                first_name=created.first_name,
                last_name=created.last_name,
                email=created.email,
                phone=created.phone,
                avatar=created.avatar,
            ),
            token=token,
            token_type="Bearer",
        )

    async def login(self, req: UserLoginRequest) -> AuthTokenResponse:
        user = await self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.password_hash):
            raise UnauthorizedError("E-poçt və ya şifrə yanlışdır")

        if not user.is_active:
            raise ForbiddenError("İstifadəçi hesabı deaktiv edilib")

        token = create_access_token(
            {"sub": str(user.id), "email": user.email},
            expires_delta=timedelta(days=30),
        )

        return AuthTokenResponse(
            user=UserResponse(
                id=str(user.id),
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                phone=user.phone,
                avatar=user.avatar,
            ),
            token=token,
            token_type="Bearer",
        )

    async def get_user_by_id(self, user_id: uuid.UUID) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("İstifadəçi tapılmadı")
        return UserResponse(
            id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone=user.phone,
            avatar=user.avatar,
        )

    async def update_profile(self, user_id: uuid.UUID, req: UserUpdateRequest) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("İstifadəçi tapılmadı")

        if req.first_name is not None:
            user.first_name = req.first_name.strip()
        if req.last_name is not None:
            user.last_name = req.last_name.strip()
        if req.phone is not None:
            user.phone = req.phone.strip()
        if req.avatar is not None:
            user.avatar = req.avatar.strip()

        await self.user_repo.session.commit()
        await self.user_repo.session.refresh(user)

        return UserResponse(
            id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone=user.phone,
            avatar=user.avatar,
        )

