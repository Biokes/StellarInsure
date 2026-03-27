# StellarInsure Error Codes

This document lists the standardized error codes used by the StellarInsure backend. All error responses follow the same structure:

```json
{
  "error_code": "AUTH_001",
  "message": "Detailed error message for humans",
  "details": null
}
```

## Authentication Errors (AUTH_*)

| Error Code | Class | Description |
|------------|-------|-------------|
| `AUTH_001` | `InvalidSignatureError` | The provided Stellar wallet signature is invalid or malformed. |
| `AUTH_002` | `UserAlreadyExistsError` | A user with this Stellar address or email is already registered. |
| `AUTH_003` | `TokenExpiredError` | The JWT token has expired or is otherwise invalid. |
| `AUTH_004` | `UserNotFoundError` | The requested user could not be found in the system. |
| `AUTH_005` | `NotAuthenticatedError` | The request requires authentication but no valid token was provided. |

## Policy Errors (POLICY_*)

| Error Code | Class | Description |
|------------|-------|-------------|
| `POLICY_001` | `PolicyNotFoundError` | The requested insurance policy was not found. |
| `POLICY_002` | `InvalidPolicyTimeRangeError` | The policy end time must be greater than the start time. |
| `POLICY_003` | `PolicyNotEligibleForClaimError` | The policy is currently outside its claim window or already paid out. |

## Claim Errors (CLAIM_*)

| Error Code | Class | Description |
|------------|-------|-------------|
| `CLAIM_001` | `ClaimNotFoundError` | The requested claim record was not found. |
| `CLAIM_002` | `InsufficientCoverageError` | The claim amount requested exceeds the remaining coverage on the policy. |

## Storage Errors (STORAGE_*)

| Error Code | Class | Description |
|------------|-------|-------------|
| `STORAGE_001` | `FileNotFoundStorageError` | The requested file does not exist in the storage system. |
| `STORAGE_002` | `InvalidStorageTokenError` | The secure storage access token is invalid, expired, or tampered with. |

## Generic Errors (GEN_*)

| Error Code | Class | Description |
|------------|-------|-------------|
| `GEN_001` | `UnexpectedError` | An unhandled server-side error occurred. |
| `GEN_002` | `ValidationError` | The request payload failed validation (e.g., missing fields, wrong types). |
