# PR Description: StellarInsure Enhancements

This Pull Request addresses several frontend features, backend monitoring, and contract-level improvements to enhance the reliability and usability of the StellarInsure protocol.

## Changes:

### Smart Contracts
- **Improved Claim Payout Logic**: Implemented contract balance verification before processing payouts.
- **Treasury Tracking**: Added storage support for tracking total premiums collected and total payouts distributed.
- **Enhanced Events**: Introduced `PayoutEvent` for better transparency during token transfers.
- **Error Handling**: Added `InsufficientContractBalance` error to handle treasury shortfalls.
- **Treasury Queries**: Added `get_treasury_stats` method to monitor protocol health.
- **Upgradeability (#24)**: Added version tracking to contract storage and an `upgrade(new_wasm_hash)` function restricted to the contract administrator.

### Frontend Enhancements
- **Trigger Condition Builder**: Replaced free-text trigger input with a rule-based condition builder for threshold selection.
- **Premium Estimate Panel**: Added a reusable estimation panel with breakdown details and recalculation states.
- **Validation Error Summary**: Implemented a top-level validation summary component that anchors to invalid fields for better UX.
- **Transaction History View (#42)**: Created a new history page with filtering, pagination, and Stellar Explorer integration.
- **Onboarding Flow (#46)**: Developed persistent interactive steps guiding users on connecting wallets and creating policies.

### Backend Logging and Monitoring (#13)
- **Structured JSON Logging**: Improved searchability in production.
- **Request-Response Middleware**: Tracking API performance and errors.
- **Sentry SDK Integration**: Real-time error reports and profiling.
- **Health Check**: Added live dependency checks (e.g., Database connectivity).

## Fixes:
- Fixes: #20
- Fixes: #74
- Fixes: #76
- Fixes: #84
- Fixes: #42
- Fixes: #46
- Fixes: #13
- Fixes: #24

## Checklist:
- [x] Contract logic verified for balance safety and upgradeability.
- [x] Frontend components match the premium design system.
- [x] Responsive behavior validated for mobile/desktop.
- [x] New events and storage keys integrated.
- [x] Backend logs are structured and searchable.
