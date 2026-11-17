from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class RepositoryCreateRequest(BaseModel):
    name: str
    owner: str
    default_branch: Optional[str] = "main"
    language: Optional[str] = "TypeScript"
    description: Optional[str] = None
    is_private: Optional[bool] = True
    is_demo: Optional[bool] = False


class RepositoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    owner: str
    full_name: str
    default_branch: str
    language: Optional[str] = None
    description: Optional[str] = None
    is_private: bool
    is_demo: bool
    last_scan: Optional[str] = None
    created_at: datetime
