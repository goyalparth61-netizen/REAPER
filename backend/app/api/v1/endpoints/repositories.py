from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.repositories.repository_repo import RepositoryRepository
from app.services.github_service import github_service
from app.api.deps import get_optional_current_user
from app.models.user import User
from app.schemas.repository import RepositoryResponse, RepositoryCreateRequest

router = APIRouter(prefix="/repositories", tags=["Repositories"])


@router.get("", response_model=List[RepositoryResponse])
def list_repositories(
    current_user: User = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    repo_db = RepositoryRepository(db)
    user_id = current_user.id if current_user else None
    repos = repo_db.list_by_user(user_id) if user_id else repo_db.list_all()

    # If empty, seed from GitHub service preview list
    if not repos:
        preview_list = github_service.list_repositories()
        for p in preview_list:
            created = repo_db.create(
                user_id=user_id or "usr-demo-01",
                name=p["name"],
                owner=p["owner"],
                default_branch=p.get("defaultBranch", "main"),
                language=p.get("language"),
                description=p.get("description"),
                is_private=p.get("visibility") == "private",
                is_demo=p.get("isDemo", True)
            )
            repos.append(created)

    return repos


@router.post("", response_model=RepositoryResponse, status_code=status.HTTP_201_CREATED)
def create_repository(
    req: RepositoryCreateRequest,
    current_user: User = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    repo_db = RepositoryRepository(db)
    user_id = current_user.id if current_user else "usr-demo-01"

    created = repo_db.create(
        user_id=user_id,
        name=req.name,
        owner=req.owner,
        default_branch=req.default_branch or "main",
        language=req.language or "Python",
        description=req.description,
        is_private=bool(req.is_private),
        is_demo=bool(req.is_demo)
    )
    return created


@router.get("/{repository_id}", response_model=RepositoryResponse)
def get_repository(repository_id: str, db: Session = Depends(get_db)):
    repo_db = RepositoryRepository(db)
    repo = repo_db.get_by_id(repository_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found.")
    return repo


@router.delete("/{repository_id}")
def delete_repository(repository_id: str, db: Session = Depends(get_db)):
    repo_db = RepositoryRepository(db)
    success = repo_db.delete(repository_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found.")
    return {"success": True, "message": "Repository removed."}
