from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .routers import auth, users, animals, weights, media
from .database import engine
from . import models
from .websocket import manager
from . import auth as auth_module
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create database tables
try:
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")
    raise

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

# Mount media uploads directory
media_dir = Path("media_uploads")
media_dir.mkdir(exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(animals.router)
app.include_router(weights.router)
app.include_router(media.router)


@app.on_event("startup")
async def startup_event():
    """Start background tasks on application startup."""
    logger.info("Starting application...")
    try:
        await manager.start()
        logger.info("Application started successfully")
    except Exception as e:
        logger.error(f"Error during application startup: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Stop background tasks on application shutdown."""
    logger.info("Shutting down application...")
    try:
        await manager.stop()
        logger.info("Application shutdown completed")
    except Exception as e:
        logger.error(f"Error during application shutdown: {e}")
        raise


@app.get("/")
async def root():
    return {"message": "Welcome to the Pet Weight Monitor API"}


@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        # Verify token and get user
        user = await auth_module.get_current_user_ws(token)
        if not user:
            logger.warning(f"Invalid token attempt for WebSocket connection")
            await websocket.close(code=1008)  # Policy violation
            return

        logger.info(f"WebSocket connection established for user {user.id}")
        await manager.connect(websocket, str(user.id))
        try:
            while True:
                # Wait for messages (can be used for ping/pong)
                data = await websocket.receive_text()
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for user {user.id}")
            manager.disconnect(websocket, str(user.id))
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close(code=1011)  # Internal error
        except:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
