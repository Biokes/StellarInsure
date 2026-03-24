"""Test database models for StellarInsure API"""
import pytest
from datetime import datetime
from decimal import Decimal
from src.models import User, Policy, Claim, Transaction, PolicyType, PolicyStatus


class TestUserModel:
    """Test suite for User model"""

    def test_user_creation(self):
        """Test that a User can be created with required fields"""
        user = User(
            stellar_address="GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"
        )
        assert user.stellar_address == "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"
        assert user.email is None

    def test_user_with_email(self):
        """Test that a User can be created with email"""
        user = User(
            stellar_address="GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS",
            email="test@example.com"
        )
        assert user.email == "test@example.com"

    def test_user_repr(self):
        """Test User string representation"""
        user = User(
            id=1,
            stellar_address="GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRS"
        )
        assert "id=1" in repr(user)
        assert "stellar_address" in repr(user)


class TestPolicyModel:
    """Test suite for Policy model"""

    def test_policy_creation(self):
        """Test that a Policy can be created with required fields"""
        policy = Policy(
            id=1,
            policyholder_id=1,
            policy_type=PolicyType.weather,
            coverage_amount=Decimal("1000.0000000"),
            premium=Decimal("50.0000000"),
            start_time=1000000,
            end_time=2000000,
            trigger_condition="Temperature below -10C"
        )
        assert policy.policy_type == PolicyType.weather
        assert policy.status == PolicyStatus.active
        assert policy.claim_amount == Decimal("0")

    def test_policy_is_expired(self):
        """Test policy expiration check"""
        policy = Policy(
            id=1,
            policyholder_id=1,
            policy_type=PolicyType.weather,
            coverage_amount=Decimal("1000.0000000"),
            premium=Decimal("50.0000000"),
            start_time=1000000,
            end_time=2000000,
            trigger_condition="Temperature below -10C"
        )
        assert policy.is_expired(1500000) is False
        assert policy.is_expired(2500000) is True

    def test_policy_is_active(self):
        """Test policy active status check"""
        policy = Policy(
            id=1,
            policyholder_id=1,
            policy_type=PolicyType.weather,
            coverage_amount=Decimal("1000.0000000"),
            premium=Decimal("50.0000000"),
            start_time=1000000,
            end_time=2000000,
            trigger_condition="Temperature below -10C"
        )
        assert policy.is_active() is True
        
        policy.status = PolicyStatus.expired
        assert policy.is_active() is False

    def test_policy_can_claim(self):
        """Test if policy can accept claims"""
        policy = Policy(
            id=1,
            policyholder_id=1,
            policy_type=PolicyType.weather,
            coverage_amount=Decimal("1000.0000000"),
            premium=Decimal("50.0000000"),
            start_time=1000000,
            end_time=2000000,
            trigger_condition="Temperature below -10C"
        )
        assert policy.can_claim(1500000) is True
        assert policy.can_claim(2500000) is False

    def test_policy_remaining_coverage(self):
        """Test remaining coverage calculation"""
        policy = Policy(
            id=1,
            policyholder_id=1,
            policy_type=PolicyType.weather,
            coverage_amount=Decimal("1000.0000000"),
            premium=Decimal("50.0000000"),
            start_time=1000000,
            end_time=2000000,
            trigger_condition="Temperature below -10C",
            claim_amount=Decimal("200.0000000")
        )
        assert policy.remaining_coverage() == Decimal("800.0000000")

    def test_policy_repr(self):
        """Test Policy string representation"""
        policy = Policy(
            id=1,
            policy_type=PolicyType.weather,
            status=PolicyStatus.active
        )
        assert "id=1" in repr(policy)
        assert "weather" in repr(policy)
        assert "active" in repr(policy)


class TestClaimModel:
    """Test suite for Claim model"""

    def test_claim_creation(self):
        """Test that a Claim can be created with required fields"""
        claim = Claim(
            id=1,
            policy_id=1,
            claimant_id=1,
            claim_amount=Decimal("500.0000000"),
            proof="Weather report showing temperature -15C",
            timestamp=1500000
        )
        assert claim.claim_amount == Decimal("500.0000000")
        assert claim.approved is False

    def test_claim_repr(self):
        """Test Claim string representation"""
        claim = Claim(
            id=1,
            policy_id=1,
            approved=False
        )
        assert "id=1" in repr(claim)
        assert "policy_id=1" in repr(claim)
        assert "approved=False" in repr(claim)


class TestTransactionModel:
    """Test suite for Transaction model"""

    def test_transaction_creation(self):
        """Test that a Transaction can be created with required fields"""
        transaction = Transaction(
            id=1,
            user_id=1,
            policy_id=1,
            transaction_hash="abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            amount=Decimal("50.0000000"),
            transaction_type="premium_payment"
        )
        assert transaction.transaction_hash == "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
        assert transaction.status == "pending"

    def test_transaction_for_claim(self):
        """Test that a Transaction can be created for a claim"""
        transaction = Transaction(
            id=1,
            user_id=1,
            claim_id=1,
            transaction_hash="abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            amount=Decimal("500.0000000"),
            transaction_type="claim_payout"
        )
        assert transaction.claim_id == 1
        assert transaction.policy_id is None

    def test_transaction_repr(self):
        """Test Transaction string representation"""
        transaction = Transaction(
            id=1,
            transaction_type="premium_payment",
            status="pending"
        )
        assert "id=1" in repr(transaction)
        assert "premium_payment" in repr(transaction)
        assert "pending" in repr(transaction)


class TestPolicyTypeEnum:
    """Test suite for PolicyType enum"""

    def test_policy_types(self):
        """Test all policy types exist"""
        assert PolicyType.weather.value == "weather"
        assert PolicyType.smart_contract.value == "smart_contract"
        assert PolicyType.flight.value == "flight"
        assert PolicyType.health.value == "health"
        assert PolicyType.asset.value == "asset"


class TestPolicyStatusEnum:
    """Test suite for PolicyStatus enum"""

    def test_policy_statuses(self):
        """Test all policy statuses exist"""
        assert PolicyStatus.active.value == "active"
        assert PolicyStatus.expired.value == "expired"
        assert PolicyStatus.cancelled.value == "cancelled"
        assert PolicyStatus.claim_pending.value == "claim_pending"
        assert PolicyStatus.claim_approved.value == "claim_approved"
        assert PolicyStatus.claim_rejected.value == "claim_rejected"
