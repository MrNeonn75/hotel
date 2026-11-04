from fastapi import APIRouter

from app.routers import auth, bookings, collections, favorites, health, hotels, profile

api_router = APIRouter()

# Health router
api_router.include_router(health.router)

# Resource routers
api_router.include_router(auth.router)
api_router.include_router(hotels.router)
api_router.include_router(collections.router)
api_router.include_router(favorites.router)
api_router.include_router(bookings.router)
api_router.include_router(profile.router)
