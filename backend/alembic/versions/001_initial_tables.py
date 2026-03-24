"""create initial tables

Revision ID: 001
Revises: 
Create Date: 2026-03-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stellar_address', sa.String(length=56), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('stellar_address'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_stellar_address'), 'users', ['stellar_address'], unique=False)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table(
        'policies',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('policyholder_id', sa.Integer(), nullable=False),
        sa.Column('policy_type', sa.Enum('weather', 'smart_contract', 'flight', 'health', 'asset', name='policytype'), nullable=False),
        sa.Column('coverage_amount', sa.Numeric(precision=20, scale=7), nullable=False),
        sa.Column('premium', sa.Numeric(precision=20, scale=7), nullable=False),
        sa.Column('start_time', sa.BigInteger(), nullable=False),
        sa.Column('end_time', sa.BigInteger(), nullable=False),
        sa.Column('trigger_condition', sa.String(length=500), nullable=False),
        sa.Column('status', sa.Enum('active', 'expired', 'cancelled', 'claim_pending', 'claim_approved', 'claim_rejected', name='policystatus'), nullable=False),
        sa.Column('claim_amount', sa.Numeric(precision=20, scale=7), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['policyholder_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_policies_id'), 'policies', ['id'], unique=False)
    op.create_index(op.f('ix_policies_policyholder_id'), 'policies', ['policyholder_id'], unique=False)
    op.create_index(op.f('ix_policies_status'), 'policies', ['status'], unique=False)

    op.create_table(
        'claims',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('policy_id', sa.BigInteger(), nullable=False),
        sa.Column('claimant_id', sa.Integer(), nullable=False),
        sa.Column('claim_amount', sa.Numeric(precision=20, scale=7), nullable=False),
        sa.Column('proof', sa.String(length=1000), nullable=False),
        sa.Column('timestamp', sa.BigInteger(), nullable=False),
        sa.Column('approved', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['claimant_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['policy_id'], ['policies.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_claims_id'), 'claims', ['id'], unique=False)
    op.create_index(op.f('ix_claims_policy_id'), 'claims', ['policy_id'], unique=False)
    op.create_index(op.f('ix_claims_claimant_id'), 'claims', ['claimant_id'], unique=False)
    op.create_index(op.f('ix_claims_approved'), 'claims', ['approved'], unique=False)

    op.create_table(
        'transactions',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('policy_id', sa.BigInteger(), nullable=True),
        sa.Column('claim_id', sa.BigInteger(), nullable=True),
        sa.Column('transaction_hash', sa.String(length=64), nullable=False),
        sa.Column('amount', sa.Numeric(precision=20, scale=7), nullable=False),
        sa.Column('transaction_type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['claim_id'], ['claims.id'], ),
        sa.ForeignKeyConstraint(['policy_id'], ['policies.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('transaction_hash')
    )
    op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'], unique=False)
    op.create_index(op.f('ix_transactions_user_id'), 'transactions', ['user_id'], unique=False)
    op.create_index(op.f('ix_transactions_policy_id'), 'transactions', ['policy_id'], unique=False)
    op.create_index(op.f('ix_transactions_claim_id'), 'transactions', ['claim_id'], unique=False)
    op.create_index(op.f('ix_transactions_transaction_hash'), 'transactions', ['transaction_hash'], unique=False)
    op.create_index(op.f('ix_transactions_status'), 'transactions', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_transactions_status'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_transaction_hash'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_claim_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_policy_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_user_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
    op.drop_table('transactions')

    op.drop_index(op.f('ix_claims_approved'), table_name='claims')
    op.drop_index(op.f('ix_claims_claimant_id'), table_name='claims')
    op.drop_index(op.f('ix_claims_policy_id'), table_name='claims')
    op.drop_index(op.f('ix_claims_id'), table_name='claims')
    op.drop_table('claims')

    op.drop_index(op.f('ix_policies_status'), table_name='policies')
    op.drop_index(op.f('ix_policies_policyholder_id'), table_name='policies')
    op.drop_index(op.f('ix_policies_id'), table_name='policies')
    op.drop_table('policies')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_stellar_address'), table_name='users')
    op.drop_table('users')
