# GymForge — MCP Protocol Routes
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any
from mcp.tools import MCP_TOOL_DEFINITIONS
from mcp.executor import execute_mcp_tool
from middleware.auth_middleware import get_current_user_id

class MCPExecuteRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = {}

router = APIRouter(prefix="/api/mcp", tags=["mcp"])

@router.get("/tools")
def list_mcp_tools():
    """Returns the list of available tools declared in the Model Context Protocol."""
    return {"tools": MCP_TOOL_DEFINITIONS}

@router.post("/execute")
def execute_mcp_endpoint(req: MCPExecuteRequest, user_id: str = Depends(get_current_user_id)):
    """Executes a declared MCP tool for the authenticated user."""
    return execute_mcp_tool(req.tool_name, req.arguments, authenticated_user_id=user_id)
