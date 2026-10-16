import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import CORS_ORIGINS, UPLOADS_DIR, REPORTS_DIR, DEMO_DATA_DIR
from app.database import engine, Base, SessionLocal
from app.api.health import router as health_router
from app.api.inspections import router as inspections_router
from app.api.analytics import router as analytics_router
from app.services.seed_data import seed_database

# Initialize database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed sample data if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown


app = FastAPI(
    title="EAGLE EYE — Industrial Control Cabinet Inspection Platform",
    description="Precision AI-assisted quality control and rework tracking for electrical control cabinets.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads, generated reports, and demo files
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/reports", StaticFiles(directory=REPORTS_DIR), name="reports")
app.mount("/data/demo", StaticFiles(directory=DEMO_DATA_DIR), name="demo")

# API Routers
app.include_router(health_router, prefix="/api")
app.include_router(inspections_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")


@app.get("/")
def root():
    return {
        "platform": "EAGLE EYE",
        "tagline": "Precision Inspection. Traceable Quality.",
        "documentation": "/docs",
        "api_health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
