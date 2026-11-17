import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

from app.database.base import Base


class RepairJob(Base):
    __tablename__ = "repair_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: f"reaper-{uuid.uuid4().hex[:10]}")
    repository_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("repositories.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    repo_name: Mapped[str] = mapped_column(String(255), nullable=False)
    branch: Mapped[str] = mapped_column(String(100), default="main", nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    issue_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    failure_logs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # 10 Stages workflow status
    # RECEIVED -> VALIDATING -> INVESTIGATING -> REPRODUCING -> DIAGNOSING -> PATCHING -> POLICY_CHECK -> TESTING -> RETRYING -> CREATING_PR -> COMPLETED / FAILED / STOPPED
    status: Mapped[str] = mapped_column(String(50), default="RECEIVED", index=True, nullable=False)
    current_stage: Mapped[str] = mapped_column(String(50), default="RECEIVED", nullable=False)
    
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_retries: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="repair_jobs")
    repository: Mapped[Optional["Repository"]] = relationship("Repository", back_populates="repair_jobs")
    stages: Mapped[List["RepairStage"]] = relationship("RepairStage", back_populates="repair_job", cascade="all, delete-orphan", order_by="RepairStage.started_at")
    diagnosis: Mapped[Optional["AiDiagnosis"]] = relationship("AiDiagnosis", back_populates="repair_job", uselist=False, cascade="all, delete-orphan")
    patch: Mapped[Optional["GeneratedPatch"]] = relationship("GeneratedPatch", back_populates="repair_job", uselist=False, cascade="all, delete-orphan")
    test_executions: Mapped[List["TestExecution"]] = relationship("TestExecution", back_populates="repair_job", cascade="all, delete-orphan")
    report: Mapped[Optional["RepairReport"]] = relationship("RepairReport", back_populates="repair_job", uselist=False, cascade="all, delete-orphan")


class RepairStage(Base):
    __tablename__ = "repair_stages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repair_id: Mapped[str] = mapped_column(String(36), ForeignKey("repair_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    stage_name: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)  # PENDING, RUNNING, COMPLETED, FAILED, SKIPPED
    log_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    repair_job: Mapped["RepairJob"] = relationship("RepairJob", back_populates="stages")


class AiDiagnosis(Base):
    __tablename__ = "ai_diagnoses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repair_id: Mapped[str] = mapped_column(String(36), ForeignKey("repair_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    root_cause: Mapped[str] = mapped_column(Text, nullable=False)
    affected_files: Mapped[str] = mapped_column(Text, nullable=False)  # JSON-encoded array or comma-separated
    confidence_score: Mapped[float] = mapped_column(Float, default=0.95, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    repair_job: Mapped["RepairJob"] = relationship("RepairJob", back_populates="diagnosis")


class GeneratedPatch(Base):
    __tablename__ = "generated_patches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repair_id: Mapped[str] = mapped_column(String(36), ForeignKey("repair_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    diff_content: Mapped[str] = mapped_column(Text, nullable=False)
    files_changed: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    lines_added: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lines_removed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    safety_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    repair_job: Mapped["RepairJob"] = relationship("RepairJob", back_populates="patch")


class TestExecution(Base):
    __tablename__ = "test_executions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repair_id: Mapped[str] = mapped_column(String(36), ForeignKey("repair_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    patch_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("generated_patches.id", ondelete="SET NULL"), nullable=True)
    exit_code: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    stdout: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    stderr: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    test_passed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    duration_seconds: Mapped[float] = mapped_column(Float, default=1.5, nullable=False)
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    repair_job: Mapped["RepairJob"] = relationship("RepairJob", back_populates="test_executions")


class RepairReport(Base):
    __tablename__ = "repair_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: f"rep-{uuid.uuid4().hex[:10]}")
    repair_id: Mapped[str] = mapped_column(String(36), ForeignKey("repair_jobs.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    root_cause_summary: Mapped[str] = mapped_column(Text, nullable=False)
    patch_summary: Mapped[str] = mapped_column(Text, nullable=False)
    security_review: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    repair_job: Mapped["RepairJob"] = relationship("RepairJob", back_populates="report")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
