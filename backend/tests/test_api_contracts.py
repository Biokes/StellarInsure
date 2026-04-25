"""
API contract tests — verify that request/response schemas remain stable.

These tests document the public API contract so that breaking changes
(removed fields, changed types, renamed keys) are caught automatically.
"""
from datetime import datetime

import pytest


# ── Helpers ───────────────────────────────────────────────────────────────────

def _now():
    return int(datetime.utcnow().timestamp())


def _policy_payload(**overrides):
    now = _now()
    base = {
        "policy_type": "weather",
        "coverage_amount": 1000.0,
        "premium": 50.0,
        "start_time": now,
        "end_time": now + 86400,
        "trigger_condition": "rainfall > 100mm",
    }
    base.update(overrides)
    return base


# ── Auth contract ─────────────────────────────────────────────────────────────

class TestAuthContract:
    def test_login_endpoint_exists(self, client):
        resp = client.post("/auth/login", json={})
        # 422 = validation error means the endpoint exists and rejects bad input
        assert resp.status_code in (400, 422)

    def test_login_rejects_missing_fields(self, client):
        resp = client.post("/auth/login", json={"stellar_address": "G" + "A" * 55})
        assert resp.status_code == 422
        error = resp.json()
        assert "detail" in error

    def test_login_rejects_bad_address_format(self, client, auth_message):
        resp = client.post(
            "/auth/login",
            json={
                "stellar_address": "BADADDRESS",
                "signature": "sig",
                "message": auth_message,
            },
        )
        assert resp.status_code == 422

    def test_token_refresh_endpoint_exists(self, client):
        resp = client.post("/auth/refresh", json={})
        assert resp.status_code in (400, 422)

    def test_token_refresh_rejects_invalid_token(self, client):
        resp = client.post("/auth/refresh", json={"refresh_token": "not-a-valid-jwt"})
        assert resp.status_code in (400, 401, 422)


# ── Policy contract ───────────────────────────────────────────────────────────

class TestPolicyContract:
    REQUIRED_FIELDS = {
        "id", "policyholder_id", "policy_type", "coverage_amount",
        "premium", "start_time", "end_time", "trigger_condition",
        "status", "claim_amount", "created_at", "updated_at",
    }

    def test_create_policy_response_shape(self, client, auth_headers):
        resp = client.post("/policies/", headers=auth_headers, json=_policy_payload())
        assert resp.status_code == 201
        data = resp.json()
        assert self.REQUIRED_FIELDS.issubset(data.keys()), (
            f"Missing fields: {self.REQUIRED_FIELDS - data.keys()}"
        )

    def test_create_policy_field_types(self, client, auth_headers):
        resp = client.post("/policies/", headers=auth_headers, json=_policy_payload())
        data = resp.json()
        assert isinstance(data["id"], int)
        assert isinstance(data["policyholder_id"], int)
        assert isinstance(data["coverage_amount"], float)
        assert isinstance(data["premium"], float)
        assert isinstance(data["claim_amount"], float)
        assert isinstance(data["start_time"], int)
        assert isinstance(data["end_time"], int)
        assert isinstance(data["trigger_condition"], str)
        assert isinstance(data["status"], str)
        assert isinstance(data["policy_type"], str)

    def test_create_policy_status_is_active(self, client, auth_headers):
        resp = client.post("/policies/", headers=auth_headers, json=_policy_payload())
        assert resp.json()["status"] == "active"

    def test_create_policy_claim_amount_zero(self, client, auth_headers):
        resp = client.post("/policies/", headers=auth_headers, json=_policy_payload())
        assert resp.json()["claim_amount"] == 0.0

    def test_create_policy_valid_types(self, client, auth_headers):
        valid_types = ["weather", "smart_contract", "flight", "health", "asset"]
        for pt in valid_types:
            resp = client.post(
                "/policies/", headers=auth_headers, json=_policy_payload(policy_type=pt)
            )
            assert resp.status_code == 201, f"policy_type={pt} failed"
            assert resp.json()["policy_type"] == pt

    def test_create_policy_rejects_invalid_type(self, client, auth_headers):
        resp = client.post(
            "/policies/", headers=auth_headers,
            json=_policy_payload(policy_type="unknown_type")
        )
        assert resp.status_code == 422

    def test_create_policy_rejects_negative_coverage(self, client, auth_headers):
        resp = client.post(
            "/policies/", headers=auth_headers,
            json=_policy_payload(coverage_amount=-1.0)
        )
        assert resp.status_code == 422

    def test_create_policy_rejects_end_before_start(self, client, auth_headers):
        now = _now()
        resp = client.post(
            "/policies/", headers=auth_headers,
            json=_policy_payload(start_time=now + 1000, end_time=now)
        )
        assert resp.status_code in (400, 422)

    def test_create_policy_requires_auth(self, client):
        resp = client.post("/policies/", json=_policy_payload())
        assert resp.status_code == 401

    def test_list_policies_response_shape(self, client, auth_headers):
        resp = client.get("/policies/", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "policies" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert "has_next" in data
        assert isinstance(data["policies"], list)
        assert isinstance(data["total"], int)
        assert isinstance(data["page"], int)
        assert isinstance(data["per_page"], int)
        assert isinstance(data["has_next"], bool)

    def test_list_policies_pagination_defaults(self, client, auth_headers):
        resp = client.get("/policies/", headers=auth_headers)
        data = resp.json()
        assert data["page"] == 1
        assert data["per_page"] == 10

    def test_list_policies_requires_auth(self, client):
        resp = client.get("/policies/")
        assert resp.status_code == 401

    def test_get_policy_by_id_shape(self, client, auth_headers, auth_user, policy_factory):
        policy = policy_factory(auth_user)
        resp = client.get(f"/policies/{policy.id}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == policy.id
        assert self.REQUIRED_FIELDS.issubset(data.keys())

    def test_get_policy_not_found_returns_404(self, client, auth_headers):
        resp = client.get("/policies/999999", headers=auth_headers)
        assert resp.status_code == 404
        data = resp.json()
        # Contract: error responses must have detail or error_code
        assert "detail" in data or "error_code" in data

    def test_cancel_policy_response_shape(self, client, auth_headers, auth_user, policy_factory):
        policy = policy_factory(auth_user)
        resp = client.delete(f"/policies/{policy.id}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "message" in data
        assert isinstance(data["message"], str)

    def test_cancel_policy_requires_auth(self, client, auth_user, policy_factory):
        policy = policy_factory(auth_user)
        resp = client.delete(f"/policies/{policy.id}")
        assert resp.status_code == 401


# ── Claim contract ────────────────────────────────────────────────────────────

class TestClaimContract:
    REQUIRED_FIELDS = {
        "id", "policy_id", "claimant_id", "claim_amount",
        "proof", "timestamp", "approved", "created_at", "updated_at",
    }

    def test_submit_claim_response_shape(self, client, auth_headers, auth_user, policy_factory):
        policy = policy_factory(auth_user)
        resp = client.post(
            f"/policies/{policy.id}/claims",
            headers=auth_headers,
            json={"policy_id": policy.id, "claim_amount": 100.0, "proof": "Weather data"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert self.REQUIRED_FIELDS.issubset(data.keys()), (
            f"Missing fields: {self.REQUIRED_FIELDS - data.keys()}"
        )

    def test_submit_claim_field_types(self, client, auth_headers, auth_user, policy_factory):
        policy = policy_factory(auth_user)
        resp = client.post(
            f"/policies/{policy.id}/claims",
            headers=auth_headers,
            json={"policy_id": policy.id, "claim_amount": 100.0, "proof": "Proof text"},
        )
        data = resp.json()
        assert isinstance(data["id"], int)
        assert isinstance(data["policy_id"], int)
        assert isinstance(data["claimant_id"], int)
        assert isinstance(data["claim_amount"], float)
        assert isinstance(data["approved"], bool)
        assert data["approved"] is False

    def test_submit_claim_rejects_zero_amount(self, client, auth_headers, auth_user, policy_factory):
        policy = policy_factory(auth_user)
        resp = client.post(
            f"/policies/{policy.id}/claims",
            headers=auth_headers,
            json={"policy_id": policy.id, "claim_amount": 0.0, "proof": "proof"},
        )
        assert resp.status_code == 422

    def test_submit_claim_rejects_empty_proof(self, client, auth_headers, auth_user, policy_factory):
        policy = policy_factory(auth_user)
        resp = client.post(
            f"/policies/{policy.id}/claims",
            headers=auth_headers,
            json={"policy_id": policy.id, "claim_amount": 100.0, "proof": "   "},
        )
        assert resp.status_code == 422

    def test_submit_claim_requires_auth(self, client, auth_user, policy_factory):
        policy = policy_factory(auth_user)
        resp = client.post(
            f"/policies/{policy.id}/claims",
            json={"policy_id": policy.id, "claim_amount": 100.0, "proof": "proof"},
        )
        assert resp.status_code == 401

    def test_submit_claim_on_nonexistent_policy(self, client, auth_headers):
        resp = client.post(
            "/policies/999999/claims",
            headers=auth_headers,
            json={"policy_id": 999999, "claim_amount": 100.0, "proof": "proof"},
        )
        assert resp.status_code == 404


# ── Error response contract ───────────────────────────────────────────────────

class TestErrorContract:
    def test_unauthenticated_request_returns_401(self, client):
        for path in ["/policies/", "/policies/1", "/policies/1/claims"]:
            resp = client.get(path)
            assert resp.status_code == 401, f"Expected 401 for GET {path}"

    def test_404_response_has_detail(self, client, auth_headers):
        resp = client.get("/policies/999999", headers=auth_headers)
        assert resp.status_code == 404
        assert "detail" in resp.json() or "error_code" in resp.json()

    def test_validation_error_shape(self, client, auth_headers):
        resp = client.post("/policies/", headers=auth_headers, json={})
        assert resp.status_code == 422
        data = resp.json()
        assert "detail" in data
