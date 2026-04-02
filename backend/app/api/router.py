from fastapi import APIRouter

from app.api.analytics import router as analytics_router
from app.api.jobs import router as jobs_router
from app.api.profiles import router as profiles_router
from app.api.resumes import router as resumes_router
from app.api.settings import router as settings_router
from app.api.sources import router as sources_router
from app.api.sync import router as sync_router


api_router = APIRouter()
api_router.include_router(jobs_router)
api_router.include_router(profiles_router)
api_router.include_router(resumes_router)
api_router.include_router(sources_router)
api_router.include_router(sync_router)
api_router.include_router(settings_router)
api_router.include_router(analytics_router)
