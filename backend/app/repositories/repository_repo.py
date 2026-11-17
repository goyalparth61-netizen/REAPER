from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.repository import Repository


class RepositoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        user_id: str,
        name: str,
        owner: str,
        default_branch: str = "main",
        language: Optional[str] = None,
        description: Optional[str] = None,
        is_private: bool = True,
        is_demo: bool = False
    ) -> Repository:
        repo = Repository(
            user_id=user_id,
            name=name,
            owner=owner,
            full_name=f"{owner}/{name}",
            default_branch=default_branch,
            language=language,
            description=description,
            is_private=is_private,
            is_demo=is_demo
        )
        self.db.add(repo)
        self.db.commit()
        self.db.refresh(repo)
        return repo

    def get_by_id(self, repo_id: str) -> Optional[Repository]:
        return self.db.query(Repository).filter(Repository.id == repo_id).first()

    def list_by_user(self, user_id: str) -> List[Repository]:
        return self.db.query(Repository).filter(Repository.user_id == user_id).all()

    def list_all(self, limit: int = 50) -> List[Repository]:
        return self.db.query(Repository).limit(limit).all()

    def delete(self, repo_id: str) -> bool:
        repo = self.get_by_id(repo_id)
        if repo:
            self.db.delete(repo)
            self.db.commit()
            return True
        return False
