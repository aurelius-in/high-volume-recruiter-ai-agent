from typing import TypedDict, Literal, Optional, Dict, Any

Channel = Literal["sms", "whatsapp", "web", "email"]

class AuditEvent(TypedDict, total=False):
    id: str
    ts: float
    actor: str
    action: str
    payload: Dict[str, Any]
    hash: str
    prev_hash: str


