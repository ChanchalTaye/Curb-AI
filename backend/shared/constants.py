"""Shared constants — severity levels, action types, event categories."""

from enum import StrEnum


class Severity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ActionType(StrEnum):
    SEND_EMAIL = "SendEmailNotification"
    SEND_SLACK = "SendSlackNotification"
    SEND_TEAMS = "SendTeamsNotification"
    SHOW_BROWSER_WARNING = "ShowBrowserWarning"
    FLAG_SESSION = "FlagSession"
    GENERATE_INCIDENT_REPORT = "GenerateIncidentReport"


class EventCategory(StrEnum):
    NAVIGATION = "navigation"
    TAB_MANAGEMENT = "tab_management"
    SESSION_TIMING = "session_timing"
    DOWNLOAD = "download"
    PAGE_ENGAGEMENT = "page_engagement"
    EXTENSION_CHANGE = "extension_change"


class ApprovalStatus(StrEnum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    ESCALATED = "Escalated"
    EXPIRED = "Expired"


class QueueType(StrEnum):
    SECURITY_ALERT = "SecurityAlert"
    RECOMMENDATION = "Recommendation"


class AgentType(StrEnum):
    SECURITY = "security"
    PRODUCTIVITY = "productivity"


class UserRole(StrEnum):
    ANALYST = "analyst"
    MANAGER = "manager"
    ADMIN = "admin"
    MONITORED_USER = "monitored_user"


class AccountStatus(StrEnum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
