# Help Desk Management System — Documentation

## **Documentation Index**

This documentation has been reorganized into 8 focused documents for better maintainability and clarity. All conflicts have been resolved based on stakeholder clarifications.

---

## **📚 Document Structure**

### **[01-Project-Charter.md](01-Project-Charter.md)**
- System Overview
- Project Goals
- Project Scope
- Success Criteria
- Stakeholders Overview
- Resources & Timeline
- Project Deliverables Overview

### **[02-Roles-and-Permissions.md](02-Roles-and-Permissions.md)**
- Detailed role definitions (Requester, Moderator, Assignee, Admin, Project Manager, CEO)
- Role boundaries and access matrix
- Permission mappings
- Key business rules summary

### **[03-Technical-Architecture.md](03-Technical-Architecture.md)**
- Technical Stack (Frontend, Backend, Database, Real-time)
- System Architecture Overview
- Frontend Architecture (folder structure, components)
- Backend Architecture (folder structure, services)
- Integration Layer (SMS, Email, etc.)
- API Versioning Strategy
- Database Migration Strategy
- Concurrent Update Handling (Optimistic/Pessimistic Locking)
- Secrets Management
- Audit Log Retention Policy
- Rate Limiting Strategy
- File Upload Security
- Database Connection Pooling (PgBouncer)
- Caching Strategy (Cache-Aside Pattern)
- State Machine Implementation (django-fsm)
- Soft Delete Queryset Pattern
- Transaction Strategy
- WebSocket Authentication
- Message Queue Strategy (Celery)
- Database Backup Strategy
- Observability (Future)
- Security Enhancements
- Testing Strategy

### **[04-Ticket-Lifecycle.md](04-Ticket-Lifecycle.md)**
- Conditional ticket status flows (Standard, Approval, Rejection, Postponement, Reopen)
- Status transition rules
- Lifecycle diagrams
- Closure and reopen rules
- Postponement workflow
- Auto-close behavior
- Draft handling
- State Machine Implementation (django-fsm)
- Version Field for Optimistic Locking
- Transaction Boundaries for Status Transitions

### **[05-Workflows-by-Role.md](05-Workflows-by-Role.md)**
- Requester Scenarios (Ticket creation, chat, resolution, etc.)
- Moderator Scenarios (Review, assignment, sub-tickets, etc.)
- Assignee Scenarios (Assignment, progress, approvals, etc.)
- Admin Scenarios (User management, sync, configuration, etc.)
- Sub-ticket Lifecycle
- File Upload Workflow with Security Checks
- Cache Invalidation Triggers in Workflows
- Transaction Handling in Complex Workflows

### **[06-API-Specifications.md](06-API-Specifications.md)**
- Endpoint definitions (organized by module) - All use `/api/v1/` prefix
- WebSocket events (Django Channels native WebSocket)
- Request/Response schemas
- Authentication flows
- Error handling
- Rate limiting and pagination (Token Bucket algorithm, role-based limits)
- Idempotency implementation
- File upload endpoint specifications with security details
- WebSocket authentication method (subprotocol headers)

### **[07-Business-Rules.md](07-Business-Rules.md)**
- All business rules consolidated
- Validation rules
- Constraints and limits
- Edge cases handling
- Security rules
- Performance rules
- Concurrent Update Handling Rules (Optimistic/Pessimistic Locking)
- File Upload Security Rules (comprehensive validation, scanning, conversion)
- Rate Limiting Rules (per role, per endpoint)
- Cache Invalidation Rules
- Transaction Management Rules
- Idempotency Rules
- Input Sanitization Rules

### **[08-Project-Deliverables.md](08-Project-Deliverables.md)**
- System deliverables
- MVP features checklist
- Out of scope items
- Technical deliverables (updated with new components)
- Testing deliverables (80%+ coverage target, performance testing, security testing)
- Success metrics
- Observability deliverables (deferred to production phase)

---

## **🔧 Key Corrections Applied**

All conflicts identified in the original documentation have been resolved:

1. ✅ **Status Flow:** Documented as conditional flows (Standard, Approval, Rejection, Postponement, Reopen)
2. ✅ **Reopen Limit:** Set to 2 (hard limit)
3. ✅ **Auto-Close:** 3 days (configurable), reminder sent 2 days before
4. ✅ **Sub-Ticket Creation:** ONLY Moderator can create; Assignee can only request
5. ✅ **Team Members:** System users assigned by Admin; Department Head assigns to tickets; All updates by Head only
6. ✅ **SLA Format:** `due_at` (datetime) for tickets, `due_delta` for templates
7. ✅ **Chat Visibility:** New participants see messages after join timestamp; Admin/Moderator see full history
8. ✅ **Postponement:** Reason required; Reminders every 3 days until closed; Stop immediately when restarted
9. ✅ **Undo Limit:** 15 minutes time window
10. ✅ **Reopen Permission:** Always requires Moderator approval
11. ✅ **Finance Approval:** Only Finance Assignee can request
12. ✅ **Soft Delete:** All deletions are soft deletes (marked as deleted, hidden from UI, retained in DB)
13. ✅ **Draft Handling:** Soft-deleted after 7 days (not hard deleted)
14. ✅ **Requester Edit:** Can only edit before submission
15. ✅ **Rejected Status:** End of lifecycle (cannot be reopened)
16. ✅ **Parent Closure:** Moderator can force-close parent and all children simultaneously
17. ✅ **Tech Stack:** Standardized on Django 5 + Django Ninja (removed Django REST Framework references)
18. ✅ **WebSocket Stack:** Fixed to use Django Channels on both server and client (removed Socket.IO client)
19. ✅ **API Versioning:** All endpoints use `/api/v1/` prefix
20. ✅ **Rate Limiting:** Token Bucket algorithm with role-based limits (Login: 10/min, Requester: 150/min, Assignee: 250/min, Moderator/Admin: unlimited)
21. ✅ **File Upload Security:** Comprehensive validation, scanning, conversion (500MB server, 250MB frontend, WebP/MP4 conversion)
22. ✅ **Concurrent Updates:** Optimistic locking (version fields) and pessimistic locking for critical operations
23. ✅ **Caching:** Cache-Aside pattern with detailed TTLs and invalidation strategy
24. ✅ **State Machine:** django-fsm for status transition management
25. ✅ **Database:** PgBouncer connection pooling, daily backups + 15-30 minute transaction logs
26. ✅ **Audit Logs:** 7-year retention with archival strategy
27. ✅ **Testing:** 80%+ coverage target, performance testing, security testing
28. ✅ **Security:** Security headers, JWT refresh token rotation, input sanitization

---

## **📋 Quick Reference**

### **Status Flow (Standard)**
```
Draft → Submitted → Pending → Under_Review → Assigned → In_Progress → Resolved → Closed
```

### **Status Flow (With Approval)**
```
Draft → Submitted → Pending → Under_Review → Assigned → In_Progress → Waiting_Approval → Approved/Rejected → Resolved → Closed
```

### **Key Business Rules**
- Reopen limit: 2 times maximum
- Auto-close: 3 days (configurable)
- Undo window: 15 minutes
- Postponement reason: Required
- Soft delete: All deletions
- Sub-ticket creation: Moderator only
- Rate limiting: Role-based (Requester: 150/min, Assignee: 250/min, Moderator/Admin: unlimited)
- File upload: 500MB server limit, 250MB frontend limit
- Concurrent updates: Version field required (optimistic locking)
- Cache TTL: 30-60 seconds (dynamic), 1 hour (static)
- Idempotency: 24-hour TTL for deduplication

---

## **🔗 Cross-References**

- For role-specific workflows, see [05-Workflows-by-Role.md](05-Workflows-by-Role.md)
- For API endpoint details, see [06-API-Specifications.md](06-API-Specifications.md)
- For business rules and constraints, see [07-Business-Rules.md](07-Business-Rules.md)
- For technical implementation details, see [03-Technical-Architecture.md](03-Technical-Architecture.md)
- For ticket lifecycle details, see [04-Ticket-Lifecycle.md](04-Ticket-Lifecycle.md)

---

## **📝 Notes**

- All images from the original documentation are preserved (194 images with base64 encoding)
- Detailed Mermaid diagrams are available in the original comprehensive documentation
- This documentation structure follows best practices for maintainability and clarity
- All terminology has been standardized across documents

---

## **🔄 Document Updates**

When updating documentation:
1. Update the relevant document
2. Update cross-references if needed
3. Update this README if structure changes
4. Ensure business rules remain consistent across all documents

---

**Last Updated:** December 2025 (Architecture Refinements & Industry Standards)
**Version:** 2.0 (Enhanced with Security, Performance, and Best Practices)




