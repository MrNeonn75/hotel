from fastapi import APIRouter

from app.routers import bookings, cities, favorites, health, hotels, profile

api_router = APIRouter()

# Health router
api_router.include_router(health.router)

# Resource routers
api_router.include_router(hotels.router)
api_router.include_router(cities.router)
api_router.include_router(favorites.router)
api_router.include_router(bookings.router, prefix="/bookings")
api_router.include_router(bookings.router, prefix="/orders")
api_router.include_router(profile.router)

