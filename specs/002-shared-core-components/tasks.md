# Tasks: Shared Core Components

**Input**: Design documents from `/specs/002-shared-core-components/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL for infrastructure setup. Connection verification scripts included instead.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared directory structure

- [X] T001 Create shared directory structure `services/shared/core/` with `__init__.py` in `services/shared/core/__init__.py`
- [X] T002 [P] Verify Python 3.12+ and Django 5.x are available in all services
- [X] T003 [P] Add `requests` library to shared requirements or verify it's available in all services

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure components that MUST be complete before services can use shared code

**⚠️ CRITICAL**: No service integration work can begin until this phase is complete

- [X] T004 Create BaseModel abstract class with UUID primary key, soft delete fields, and timestamps in `services/shared/core/models.py`
- [X] T005 Create SoftDeleteQuerySet class with active(), deleted(), and with_deleted() methods in `services/shared/core/models.py`
- [X] T006 Create SoftDeleteManager class with get_queryset(), deleted(), and with_deleted() methods in `services/shared/core/models.py`
- [X] T007 Implement soft_delete() method in BaseModel class in `services/shared/core/models.py`
- [X] T008 Implement restore() method in BaseModel class in `services/shared/core/models.py`
- [X] T009 Create HTTPClient class with default timeout and retry configuration in `services/shared/core/clients.py`
- [X] T010 Implement get(), post(), put(), delete(), patch() methods in HTTPClient class in `services/shared/core/clients.py`
- [X] T011 Implement get_json() and post_json() helper methods in HTTPClient class in `services/shared/core/clients.py`
- [X] T012 Implement authentication token handling (parameter and auto-retrieval) in HTTPClient class in `services/shared/core/clients.py`
- [X] T013 Implement retry logic with urllib3.util.retry.Retry and exponential backoff in HTTPClient class in `services/shared/core/clients.py`
- [X] T014 Create get_logging_config() function that returns standardized logging configuration dictionary in `services/shared/core/logging_config.py`

**Checkpoint**: Foundation ready - BaseModel, HTTPClient, and logging configuration are available. Service integration can now begin.

---

## Phase 3: User Story 1 - Shared BaseModel for Consistent Data Models (Priority: P1) 🎯 MVP

**Goal**: All Django services can use BaseModel for consistent UUID primary keys, soft delete functionality, and automatic timestamp tracking.

**Independent Test**: Create a test model that inherits from BaseModel, verify UUID generation, soft delete operations, and timestamp updates work correctly. Test can be run independently in any Django service.

### Implementation for User Story 1

- [X] T015 [US1] Configure user-service to import BaseModel by adding shared directory to sys.path in `services/user-service/src/core/settings/base.py`
- [X] T016 [US1] Configure ticket-service to import BaseModel by adding shared directory to sys.path in `services/ticket-service/src/core/settings/base.py`
- [X] T017 [US1] Configure communication-service to import BaseModel by adding shared directory to sys.path in `services/communication-service/src/core/settings/base.py`
- [X] T018 [US1] Configure file-service to import BaseModel by adding shared directory to sys.path in `services/file-service/src/core/settings/base.py`
- [X] T019 [US1] Update at least one model in user-service to inherit from BaseModel (e.g., User or Department model) in `services/user-service/src/apps/*/models.py`
- [X] T020 [US1] Verify BaseModel import works in user-service by running Django shell and importing BaseModel
- [X] T021 [US1] Verify BaseModel import works in ticket-service by running Django shell and importing BaseModel
- [X] T022 [US1] Verify BaseModel import works in communication-service by running Django shell and importing BaseModel
- [X] T023 [US1] Verify BaseModel import works in file-service by running Django shell and importing BaseModel

**Checkpoint**: At this point, User Story 1 should be fully functional - all services can import and use BaseModel. Test by creating a model instance and verifying UUID, timestamps, and soft delete functionality.

---

## Phase 4: User Story 2 - Shared HTTP Client for Inter-Service Communication (Priority: P1) 🎯 MVP

**Goal**: All Django services can use shared HTTPClient for inter-service communication with consistent error handling, timeout management, and authentication.

**Independent Test**: Create a test service that uses the shared HTTP client to make requests to another service, verifying proper error handling, timeout behavior, and response parsing. Test can be run independently in any Django service.

### Implementation for User Story 2

- [X] T024 [US2] Configure user-service to import HTTPClient by ensuring shared directory is in sys.path in `services/user-service/src/core/settings/base.py`
- [X] T025 [US2] Configure ticket-service to import HTTPClient by ensuring shared directory is in sys.path in `services/ticket-service/src/core/settings/base.py`
- [X] T026 [US2] Configure communication-service to import HTTPClient by ensuring shared directory is in sys.path in `services/communication-service/src/core/settings/base.py`
- [X] T027 [US2] Configure file-service to import HTTPClient by ensuring shared directory is in sys.path in `services/file-service/src/core/settings/base.py`
- [X] T028 [US2] Replace existing HTTP client code in user-service with shared HTTPClient in `services/user-service/src/core/clients/*.py` (if exists)
- [X] T029 [US2] Replace existing HTTP client code in ticket-service with shared HTTPClient in `services/ticket-service/src/core/clients/*.py` (if exists)
- [X] T030 [US2] Replace existing HTTP client code in communication-service with shared HTTPClient in `services/communication-service/src/core/clients/*.py` (if exists)
- [X] T031 [US2] Replace existing HTTP client code in file-service with shared HTTPClient in `services/file-service/src/core/clients/*.py` (if exists)
- [X] T032 [US2] Add SERVICE_AUTH_TOKEN or AUTH_TOKEN to Django settings for automatic token retrieval in `services/*/src/core/settings/base.py`
- [X] T033 [US2] Verify HTTPClient import works in user-service by running Django shell and importing HTTPClient
- [X] T034 [US2] Verify HTTPClient import works in ticket-service by running Django shell and importing HTTPClient
- [X] T035 [US2] Verify HTTPClient import works in communication-service by running Django shell and importing HTTPClient
- [X] T036 [US2] Verify HTTPClient import works in file-service by running Django shell and importing HTTPClient

**Checkpoint**: At this point, User Story 2 should be fully functional - all services can import and use HTTPClient. Test by making an inter-service HTTP request and verifying timeout, retry, and authentication work correctly.

---

## Phase 5: User Story 3 - Shared Code Import Configuration (Priority: P2)

**Goal**: All Django services can successfully import shared code (BaseModel and HTTP clients) without manual path manipulation or fallback code.

**Independent Test**: Verify that all Django services can successfully import BaseModel and HTTP clients from the shared directory without import errors or fallback code execution. Test can be run independently by checking imports in each service.

### Implementation for User Story 3

- [X] T037 [US3] Remove any fallback code for BaseModel import in user-service model files in `services/user-service/src/apps/*/models.py`
- [X] T038 [US3] Remove any fallback code for BaseModel import in ticket-service model files in `services/ticket-service/src/apps/*/models.py`
- [X] T039 [US3] Remove any fallback code for BaseModel import in communication-service model files in `services/communication-service/src/apps/*/models.py`
- [X] T040 [US3] Remove any fallback code for BaseModel import in file-service model files in `services/file-service/src/apps/*/models.py`
- [X] T041 [US3] Verify all services start without import errors by running `python manage.py check` in each service
- [X] T042 [US3] Document import configuration pattern in quickstart.md or README for future services

**Checkpoint**: At this point, User Story 3 should be complete - all services import shared code cleanly without fallback mechanisms. Test by starting all services and verifying no import errors occur.

---

## Phase 6: User Story 4 - Standardized Logging Configuration (Priority: P2)

**Goal**: All Django services use consistent logging configuration with uniform log formats, log levels, and output destinations.

**Independent Test**: Verify that all services produce logs in the expected format, with appropriate log levels configured, and logs are output to the correct destinations. Test can be run independently by generating log messages in each service.

### Implementation for User Story 4

- [X] T043 [US4] Import and apply shared logging configuration in user-service settings in `services/user-service/src/core/settings/base.py`
- [X] T044 [US4] Import and apply shared logging configuration in ticket-service settings in `services/ticket-service/src/core/settings/base.py`
- [X] T045 [US4] Import and apply shared logging configuration in communication-service settings in `services/communication-service/src/core/settings/base.py`
- [X] T046 [US4] Import and apply shared logging configuration in file-service settings in `services/file-service/src/core/settings/base.py`
- [X] T047 [US4] Configure environment-specific log levels (DEBUG for dev, INFO for prod) in `services/*/src/core/settings/dev.py` and `services/*/src/core/settings/prod.py`
- [X] T048 [US4] Verify logging works in user-service by generating test log messages and checking output format
- [X] T049 [US4] Verify logging works in ticket-service by generating test log messages and checking output format
- [X] T050 [US4] Verify logging works in communication-service by generating test log messages and checking output format
- [X] T051 [US4] Verify logging works in file-service by generating test log messages and checking output format

**Checkpoint**: At this point, User Story 4 should be complete - all services use consistent logging configuration. Test by running services and verifying log output matches the structured text format.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation across all components

- [X] T052 [P] Update documentation in `specs/002-shared-core-components/quickstart.md` with any implementation details discovered
- [X] T053 [P] Verify all services can start successfully with shared code by running `docker-compose up` and checking for errors
- [X] T054 [P] Test BaseModel soft delete functionality across all services by creating and soft-deleting test records
- [X] T055 [P] Test HTTPClient retry logic by simulating network failures and verifying retry behavior
- [X] T056 [P] Test HTTPClient timeout behavior by making requests with different timeout values
- [X] T057 [P] Verify logging format consistency across all services by comparing log output
- [X] T058 [P] Remove any unused or deprecated code related to old HTTP clients or model base classes
- [X] T059 Run quickstart.md validation by following all setup steps and verifying they work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) and User Story 2 (P1) can proceed in parallel after Foundational
  - User Story 3 (P2) and User Story 4 (P2) can proceed in parallel after US1/US2 or alongside them
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Can run in parallel with US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for BaseModel imports, but can work in parallel with US2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent of other stories, can run in parallel

### Within Each User Story

- Import configuration before model updates
- Model updates before verification
- Service configuration before verification
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Foundational tasks T004-T008 (BaseModel) can run sequentially (same file)
- Foundational tasks T009-T013 (HTTPClient) can run sequentially (same file)
- Foundational task T014 (logging) is independent and can run in parallel with BaseModel/HTTPClient work
- User Story 1 tasks T015-T018 (import configuration) can run in parallel (different services)
- User Story 1 tasks T019-T023 (verification) can run in parallel (different services)
- User Story 2 tasks T024-T027 (import configuration) can run in parallel (different services)
- User Story 2 tasks T028-T031 (replace existing clients) can run in parallel (different services)
- User Story 2 tasks T033-T036 (verification) can run in parallel (different services)
- User Story 3 tasks T037-T040 (remove fallback code) can run in parallel (different services)
- User Story 4 tasks T043-T046 (apply logging config) can run in parallel (different services)
- User Story 4 tasks T047-T051 (configure and verify) can run in parallel (different services)
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all import configuration tasks in parallel (different services):
Task: "Configure user-service to import BaseModel in services/user-service/src/core/settings/base.py"
Task: "Configure ticket-service to import BaseModel in services/ticket-service/src/core/settings/base.py"
Task: "Configure communication-service to import BaseModel in services/communication-service/src/core/settings/base.py"
Task: "Configure file-service to import BaseModel in services/file-service/src/core/settings/base.py"

# Launch all verification tasks in parallel (different services):
Task: "Verify BaseModel import works in user-service"
Task: "Verify BaseModel import works in ticket-service"
Task: "Verify BaseModel import works in communication-service"
Task: "Verify BaseModel import works in file-service"
```

---

## Parallel Example: User Story 2

```bash
# Launch all import configuration tasks in parallel (different services):
Task: "Configure user-service to import HTTPClient in services/user-service/src/core/settings/base.py"
Task: "Configure ticket-service to import HTTPClient in services/ticket-service/src/core/settings/base.py"
Task: "Configure communication-service to import HTTPClient in services/communication-service/src/core/settings/base.py"
Task: "Configure file-service to import HTTPClient in services/file-service/src/core/settings/base.py"

# Launch all replacement tasks in parallel (different services):
Task: "Replace existing HTTP client code in user-service with shared HTTPClient"
Task: "Replace existing HTTP client code in ticket-service with shared HTTPClient"
Task: "Replace existing HTTP client code in communication-service with shared HTTPClient"
Task: "Replace existing HTTP client code in file-service with shared HTTPClient"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (BaseModel)
4. Complete Phase 4: User Story 2 (HTTPClient)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (BaseModel) → Test independently → Deploy/Demo (MVP Part 1)
3. Add User Story 2 (HTTPClient) → Test independently → Deploy/Demo (MVP Part 2)
4. Add User Story 3 (Import Config) → Test independently → Deploy/Demo
5. Add User Story 4 (Logging) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (BaseModel) - all services
   - Developer B: User Story 2 (HTTPClient) - all services
3. Once US1 and US2 are complete:
   - Developer A: User Story 3 (Import Config)
   - Developer B: User Story 4 (Logging)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Import configuration is done in settings/base.py for each service
- Verification tasks can be done via Django shell or service startup
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- BaseModel and HTTPClient are in shared code, so they're available to all services once Foundational phase is complete

