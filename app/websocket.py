from fastapi import WebSocket
from typing import Dict, List, Optional
import json
import asyncio
from datetime import datetime
import psycopg2
import psycopg2.extensions
from .database import SQLALCHEMY_DATABASE_URL
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Store connections with user_id as key
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.db_conn = None
        self.should_listen = False
        self._background_tasks = []

    async def start(self):
        """Start background tasks."""
        logger.info("Starting WebSocket manager...")
        try:
            self.should_listen = True
            await self._init_db_connection()
            self._background_tasks = [
                asyncio.create_task(self.heartbeat()),
                # Add fast notification polling
                asyncio.create_task(self.poll_notifications())
            ]
            logger.info("WebSocket manager started successfully")
        except Exception as e:
            logger.error(f"Failed to start WebSocket manager: {e}")
            await self.stop()
            raise

    async def _init_db_connection(self):
        """Initialize database connection."""
        try:
            # Parse connection string
            conn_params = {}
            parts = SQLALCHEMY_DATABASE_URL.replace(
                "postgresql://", "").split("/")
            db_name = parts[1]
            auth_host = parts[0].split("@")
            host_port = auth_host[1].split(":")
            user_pass = auth_host[0].split(":")

            conn_params["dbname"] = db_name
            conn_params["user"] = user_pass[0]
            conn_params["password"] = user_pass[1]
            conn_params["host"] = host_port[0]
            conn_params["port"] = host_port[1]

            self.db_conn = psycopg2.connect(**conn_params)
            self.db_conn.set_isolation_level(
                psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = self.db_conn.cursor()
            cursor.execute("LISTEN db_changes;")
            logger.info("Database connection initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database connection: {e}")
            if self.db_conn:
                try:
                    self.db_conn.close()
                except:
                    pass
                self.db_conn = None
            raise

    async def stop(self):
        """Stop background tasks and cleanup resources."""
        logger.info("Stopping WebSocket manager...")
        self.should_listen = False
        if self.db_conn:
            try:
                self.db_conn.close()
                logger.info("Database connection closed")
            except Exception as e:
                logger.error(f"Error closing database connection: {e}")
            self.db_conn = None

        for task in self._background_tasks:
            try:
                task.cancel()
                await task
            except asyncio.CancelledError:
                pass
            except Exception as e:
                logger.error(f"Error canceling task: {e}")
        self._background_tasks.clear()
        logger.info("WebSocket manager stopped")

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    dead_connections.append(connection)

            # Clean up dead connections
            for dead_connection in dead_connections:
                self.active_connections[user_id].remove(dead_connection)

            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def poll_notifications(self):
        """Poll database for notifications frequently."""
        logger.info("Starting notification polling...")
        while self.should_listen:
            try:
                # Process any pending notifications
                if self.db_conn:
                    self.db_conn.poll()
                    while self.db_conn.notifies:
                        notify = self.db_conn.notifies.pop()
                        try:
                            payload = json.loads(notify.payload)
                            message = {
                                "type": f"{payload['table'].upper()}_{payload['operation']}D",
                                "data": payload['data']
                            }
                            await self.broadcast_to_user(payload['owner_id'], message)
                        except json.JSONDecodeError as e:
                            logger.error(f"Invalid notification payload: {e}")
                        except Exception as e:
                            logger.error(f"Error processing notification: {e}")

                # Short sleep to prevent CPU overload
                await asyncio.sleep(0.1)  # Poll every 100ms
            except Exception as e:
                logger.error(f"Error in notification polling: {e}")
                # If database connection is lost, try to reconnect
                if not self.db_conn:
                    try:
                        await self._init_db_connection()
                    except Exception as e:
                        logger.error(f"Failed to reconnect to database: {e}")
                # Wait a bit longer before retrying after error
                await asyncio.sleep(1)

    async def heartbeat(self):
        """Send periodic heartbeat to keep connections alive."""
        logger.info("Starting heartbeat...")
        while self.should_listen:
            try:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds

                # Send heartbeat to all connections
                for user_id, connections in list(self.active_connections.items()):
                    dead_connections = []
                    for connection in connections:
                        try:
                            await connection.send_json({"type": "HEARTBEAT"})
                        except Exception as e:
                            logger.error(
                                f"Error sending heartbeat to user {user_id}: {e}")
                            dead_connections.append(connection)

                    # Clean up dead connections
                    for dead_connection in dead_connections:
                        connections.remove(dead_connection)

                    if not connections:
                        del self.active_connections[user_id]
            except Exception as e:
                logger.error(f"Error in heartbeat: {e}")
                await asyncio.sleep(5)  # Wait before retrying


manager = ConnectionManager()
