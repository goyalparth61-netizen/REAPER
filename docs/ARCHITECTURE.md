# REAPER System Architecture

## Overview
REAPER (Autonomous Software Repair Engine) is an end-to-end autonomous engineering platform designed to ingest software issues, localize root causes in codebases, synthesize robust patches via multi-agent reasoning, verify fixes inside isolated execution sandboxes, and publish verified pull requests.

```
                    +------------------------------------------+
                    |          REAPER Frontend (Vite)          |
                    |   Obsidian Emerald UI / Real-time Logs   |
                    +--------------------+---------------------+
                                         | REST / WebSocket
                                         v
                    +------------------------------------------+
                    |          FastAPI Backend (v1 API)        |
                    |   JWT Auth | Repositories | Orchestration|
                    +--------------------+---------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                               |                               |
         v                               v                               v
+------------------+           +-------------------+           +-------------------+
|  Database Layer  |           | Multi-Agent Suite |           | Sandbox Execution |
| PostgreSQL /     |           | 6 Specialized LLM |           | Docker Isolation  |
| SQLAlchemy 2.0   |           | Repair Agents     |           | Process Fallback  |
+------------------+           +-------------------+           +-------------------+
```

---

## Multi-Agent Architecture
REAPER organizes repair intelligence into 6 dedicated agents:

1. **Analysis Agent**: Ingests issue descriptions, stack traces, and commit histories to extract reproduction steps and failure symptoms.
2. **Fault Localization Agent**: Employs spectrum-based fault localization (SBFL) and semantic code analysis to pinpoint suspect files, classes, and line ranges.
3. **Patch Generation Agent**: Synthesizes minimally intrusive candidate patches adhering to repo coding style and language best practices.
4. **Sandbox Execution Agent**: Spawns isolated execution sandboxes (Docker / constrained subprocess) to execute test suites against unpatched vs patched code.
5. **Regression Testing Agent**: Runs full regression suites to guarantee the candidate patch does not introduce side-effects or break other features.
6. **Pull Request Agent**: Compiles an explanation of the bug, root cause analysis, test verification logs, and generates a formatted Pull Request or patch bundle.

---

## 10-Stage Autonomous Repair Pipeline
Every repair session traverses 10 deterministic states managed by the `RepairOrchestrator`:

1. `INGESTION`: Parse repository URL, target branch, and failure logs.
2. `ENVIRONMENT_SETUP`: Clone workspace, restore dependencies, and configure runtime.
3. `FAILURE_REPRODUCTION`: Execute repro commands and verify test failure reproduction.
4. `FAULT_LOCALIZATION`: Compute suspicion scores across AST nodes and identify faulty lines.
5. `CONTEXT_GATHERING`: Extract method signatures, references, imports, and documentation.
6. `CANDIDATE_GENERATION`: Generate multiple candidate diffs using LLM reasoning models.
7. `SANDBOX_VERIFICATION`: Apply candidate patches and execute test cases in isolated environments.
8. `REGRESSION_TESTING`: Run project-wide regression tests against verified candidates.
9. `PATCH_RANKING`: Rank candidates based on test pass rates, diff minimalism, and code quality.
10. `PR_GENERATION`: Format comprehensive pull request and publish to GitHub or export git patch.
