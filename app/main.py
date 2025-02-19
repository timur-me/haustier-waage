from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, animals, weights
from .database import engine
from . import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pet Weight Monitoring API",
    description="An API for monitoring pet weights and health",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(animals.router)
app.include_router(weights.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Pet Weight Monitoring API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
