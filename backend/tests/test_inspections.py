import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["demo_mode_active"] is True
    assert data["capabilities"]["deterministic_rules_engine"] is True


def test_list_inspections(client):
    response = client.get("/api/inspections")
    assert response.status_code == 200
    sessions = response.json()
    assert len(sessions) >= 1
    # Check seeded session exists
    cab_ids = [s["cabinet_id"] for s in sessions]
    assert "CAB-4092" in cab_ids


def test_create_and_run_inspection_lifecycle(client):
    # 1. Create new inspection session
    payload = {
        "cabinet_id": "CAB-TEST-001",
        "work_order_id": "WO-9901",
        "batch_id": "BATCH-TEST",
        "inspector": "Automated Test Inspector",
        "reference_revision": "Rev C",
        "processing_mode": "DEMO"
    }
    create_resp = client.post("/api/inspections", json=payload)
    assert create_resp.status_code == 200
    session_data = create_resp.json()
    session_id = session_data["id"]
    assert session_data["cabinet_id"] == "CAB-TEST-001"

    # 2. Preview Excel Schedule
    sched_resp = client.post(f"/api/inspections/{session_id}/preview-schedule")
    assert sched_resp.status_code == 200
    sched_data = sched_resp.json()
    assert len(sched_data["columns"]) >= 5
    assert len(sched_data["sample_rows"]) >= 1

    # 3. Test Alignment
    align_resp = client.post(f"/api/inspections/{session_id}/align", json={"mode": "AUTO"})
    assert align_resp.status_code == 200
    align_data = align_resp.json()
    assert align_data["alignment_status"] in ["ALIGNED_AUTO", "ALIGNED_MANUAL"]
    assert align_data["confidence_score"] > 0.8

    # 4. Run Inspection Pipeline
    run_resp = client.post(f"/api/inspections/{session_id}/run-pipeline")
    assert run_resp.status_code == 200
    run_data = run_resp.json()
    assert run_data["total_findings"] >= 15
    assert run_data["fail_count"] >= 1  # Intended K1 & X1:14 fails

    # 5. Fetch Findings
    findings_resp = client.get(f"/api/inspections/{session_id}/findings")
    assert findings_resp.status_code == 200
    findings = findings_resp.json()
    assert len(findings) >= 15

    # Check that contactor K1 is marked FAIL in GA placement
    k1_finding = next((f for f in findings if f["component_ref"] == "K1" and f["check_type"] == "GA_PLACEMENT"), None)
    assert k1_finding is not None
    assert k1_finding["status"] == "FAIL"

    # Check that ferrule X1:14 is marked FAIL
    ferrule_finding = next((f for f in findings if f["component_ref"] == "X1:14" and f["check_type"] == "FERRULE_TEXT"), None)
    assert ferrule_finding is not None
    assert ferrule_finding["status"] == "FAIL"

    # 6. Test Review Override on QF2
    qf2_finding = next((f for f in findings if f["component_ref"] == "QF2"), None)
    assert qf2_finding is not None
    override_resp = client.patch(
        f"/api/inspections/findings/{qf2_finding['id']}/review",
        json={
            "status": "PASS",
            "reviewer_status": "OVERRIDDEN_PASS",
            "reviewer_notes": "Laser marking verified under optical magnifier as QF2."
        }
    )
    assert override_resp.status_code == 200
    assert override_resp.json()["status"] == "PASS"

    # 7. Test Reinspection Diff
    reinspect_resp = client.post(
        f"/api/inspections/{session_id}/reinspect",
        json={
            "inspector": "Automated Test Inspector",
            "reinspection_notes": "Rework verified: contactor repositioned, ferrule retagged."
        }
    )
    assert reinspect_resp.status_code == 200
    reinspect_data = reinspect_resp.json()
    assert len(reinspect_data["resolved_findings"]) >= 1
    assert reinspect_data["can_close_session"] is True

    # 8. Test Reports Generation
    pdf_resp = client.post(f"/api/inspections/{session_id}/reports/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.json()["report_type"] == "PDF"

    excel_resp = client.post(f"/api/inspections/{session_id}/reports/excel")
    assert excel_resp.status_code == 200
    assert excel_resp.json()["report_type"] == "EXCEL"


def test_multipart_reinspection_upload(client):
    # 1. Create a parent session
    payload = {
        "cabinet_id": "CAB-REINSPECT-TEST",
        "inspector": "Reinspection Test Inspector",
        "processing_mode": "DEMO"
    }
    create_resp = client.post("/api/inspections", json=payload)
    assert create_resp.status_code == 200
    parent_id = create_resp.json()["id"]

    # 2. Run initial pipeline so defects exist
    client.post(f"/api/inspections/{parent_id}/run-pipeline")

    # 3. Post multipart reinspection with a mock image
    dummy_image_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
    files = {
        "reinspection_photo": ("cabinet_repaired_test.jpg", dummy_image_bytes, "image/jpeg")
    }
    data = {
        "inspector": "Quality Audit Lead",
        "reinspection_notes": "Rework verified with fresh photograph upload."
    }
    reinspect_resp = client.post(
        f"/api/inspections/{parent_id}/reinspect",
        data=data,
        files=files
    )
    assert reinspect_resp.status_code == 200
    res = reinspect_resp.json()
    assert res["parent_session_id"] == parent_id
    assert res["reinspection_session_id"].startswith("INS-")
    assert "repaired_image_path" in res
    assert len(res["resolved_findings"]) >= 1

    # 4. Verify detail endpoint serializes cleanly with audit events (no PydanticSerializationError)
    detail_resp = client.get(f"/api/inspections/{res['reinspection_session_id']}")
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert len(detail_data["audit_events"]) >= 1

    # 5. Missing parent session returns 404
    missing_resp = client.post("/api/inspections/NON_EXISTENT_ID/reinspect", data={"inspector": "Tester"})
    assert missing_resp.status_code == 404

    # 6. Corrupt image file returns 400
    corrupt_resp = client.post(
        f"/api/inspections/{parent_id}/reinspect",
        data={"inspector": "Tester"},
        files={"reinspection_photo": ("bad_image.jpg", b"NOT_VALID_IMAGE_DATA_12345", "image/jpeg")}
    )
    assert corrupt_resp.status_code == 400


def test_analytics_endpoint(client):
    response = client.get("/api/analytics/defects")
    assert response.status_code == 200
    data = response.json()
    assert data["total_inspections"] >= 1
    assert "severity_distribution" in data
    assert "open_defects_count" in data
    assert "closed_defects_count" in data
    assert len(data["defect_categories"]) >= 1
    assert len(data["top_recurring_components"]) >= 1


def test_extracted_references_endpoints(client):
    # Test GET extracted references for seeded session
    sessions_resp = client.get("/api/inspections")
    session_id = sessions_resp.json()[0]["id"]
    
    get_resp = client.get(f"/api/inspections/{session_id}/extracted-references")
    assert get_resp.status_code == 200
    ref_data = get_resp.json()
    assert "components" in ref_data
    assert "wires" in ref_data
    assert len(ref_data["components"]) >= 5

    # Test POST manual edit to extracted references
    updated_payload = dict(ref_data)
    updated_payload["components"][0]["type"] = "Power Supply 24VDC 10A (User Verified)"
    post_resp = client.post(f"/api/inspections/{session_id}/extracted-references", json=updated_payload)
    assert post_resp.status_code == 200

    # Verify updated content persists
    get_again = client.get(f"/api/inspections/{session_id}/extracted-references")
    assert get_again.status_code == 200
    assert get_again.json()["is_user_edited"] is True
    assert get_again.json()["components"][0]["type"] == "Power Supply 24VDC 10A (User Verified)"

