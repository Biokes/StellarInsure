from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
from .config import get_settings

settings = get_settings()

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/stellarinsure"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
