from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from .config import get_settings
from .routes import auth_router, policies_router, claims_router, storage_router
from .errors import StellarInsureError
from .schemas import ErrorResponse

settings = get_settings()

tags_metadata = [
    {
        "name": "authentication",
        "description": "Operations for user login, registration, and token management using Stellar wallets.",
    },
    {
        "name": "policies",
        "description": "Manage insurance policies, create new ones, and list existing policies.",
    },
    {
        "name": "claims",
        "description": "Submit and track insurance claims against active policies.",
    },
    {
        "name": "storage",
        "description": "Secure access to uploaded proof documents.",
    },
]

app = FastAPI(
    title="StellarInsure API",
    description="""
Automated parametric insurance protocol on Stellar.
    
This API provides endpoints for:
* **Wallet Authentication**: Secure login using Stellar cryptographic signatures.
* **Policy Management**: Creating and tracking insurance policies.
* **Claims Processing**: Submitting claims with automated or manual verification.
* **Secure Storage**: Accessing sensitive proof documents via signed URLs.
    """,
    version="1.0.0",
    openapi_tags=tags_metadata,
    contact={
        "name": "StellarInsure Team",
        "url": "https://stellarinsure.io",
        "email": "support@stellarinsure.io",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(policies_router)
app.include_router(claims_router)
app.include_router(storage_router)

@app.exception_handler(StellarInsureError)
async def stellar_insure_error_handler(request: Request, exc: StellarInsureError):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            detail=exc.detail
        ).dict()
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=f"HTTP_{exc.status_code}",
            detail=exc.detail
        ).dict()
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error_code="VAL_001",
            detail=str(exc.errors())
        ).dict()
    )

@app.get("/", summary="Root endpoint", description="Returns a simple welcome message.")
async def root():
    return {"message": "Welcome to StellarInsure API"}

@app.get("/health", summary="Health check", description="Checks the health status of the API service.")
async def health():
    return {"status": "healthy"}
