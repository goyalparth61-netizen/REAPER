import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

from app.workflows.repair_orchestrator import register_stage_listener
from app.core.logging import logger

router = APIRouter(prefix="/ws", tags=["Real-time"])

# Connected client manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, repair_id: str, websocket: WebSocket):
        await websocket.accept()
        if repair_id not in self.active_connections:
            self.active_connections[repair_id] = []
        self.active_connections[repair_id].append(websocket)

    def disconnect(self, repair_id: str, websocket: WebSocket):
        if repair_id in self.active_connections:
            if websocket in self.active_connections[repair_id]:
                self.active_connections[repair_id].remove(websocket)
            if not self.active_connections[repair_id]:
                del self.active_connections[repair_id]

    async def broadcast_to_repair(self, repair_id: str, message: dict):
        if repair_id in self.active_connections:
            for connection in list(self.active_connections[repair_id]):
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    self.disconnect(repair_id, connection)


manager = ConnectionManager()

# Hook orchestrator stage notifications into WebSocket broadcast
def on_stage_event(event: dict):
    repair_id = event.get("repair_id")
    if repair_id:
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.run_coroutine_threadsafe(manager.broadcast_to_repair(repair_id, event), loop)
        except Exception:
            pass


register_stage_listener(on_stage_event)


@router.websocket("/repairs/{repair_id}")
async def repair_websocket_endpoint(websocket: WebSocket, repair_id: str):
    await manager.connect(repair_id, websocket)
    try:
        # Send initial confirmation
        await websocket.send_text(json.dumps({
            "type": "SUBSCRIBED",
            "repair_id": repair_id,
            "message": f"Subscribed to live execution telemetry for {repair_id}."
        }))
        while True:
            # Keep socket alive
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(repair_id, websocket)
    except Exception as e:
        logger.warning(f"WebSocket error for {repair_id}: {e}")
        manager.disconnect(repair_id, websocket)
