from typing import List, Dict, Any, Tuple
from app.models.models import InspectionFinding, InspectionSession, AuditEvent


def compute_reinspection_diff(
    parent_findings: List[InspectionFinding],
    new_findings: List[InspectionFinding]
) -> Dict[str, Any]:
    """
    Compares the original inspection findings with the reinspection session findings.
    Identifies resolved defects, persistent defects, new defects, and review-needed items.
    """
    # Key by (component_ref, check_type)
    parent_map = {(f.component_ref, f.check_type): f for f in parent_findings}
    new_map = {(f.component_ref, f.check_type): f for f in new_findings}

    resolved = []
    persistent = []
    new_items = []
    review_needed = []
    blockers = []

    for (comp, ctype), new_f in new_map.items():
        if (comp, ctype) in parent_map:
            old_f = parent_map[(comp, ctype)]
            if old_f.status in ["FAIL", "REVIEW"] and new_f.status == "PASS":
                resolved.append(new_f)
            elif old_f.status == "FAIL" and new_f.status == "FAIL":
                persistent.append(new_f)
                blockers.append(f"Defect {comp} ({ctype}) remains unresolved.")
            elif new_f.status == "REVIEW":
                review_needed.append(new_f)
                blockers.append(f"Item {comp} ({ctype}) requires human reviewer confirmation.")
        else:
            if new_f.status in ["FAIL", "REVIEW"]:
                new_items.append(new_f)
                blockers.append(f"Newly detected discrepancy: {comp} ({ctype}).")

    can_close = len(blockers) == 0

    return {
        "resolved_findings": resolved,
        "persistent_findings": persistent,
        "new_findings": new_items,
        "review_needed_findings": review_needed,
        "can_close_session": can_close,
        "closure_blockers": blockers
    }
