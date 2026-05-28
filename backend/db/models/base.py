"""
SQLAlchemy declarative base, engine factory, and session factory.
All models import Base from here.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/caresync")


class Base(DeclarativeBase):
    pass


def get_engine(url: str = DATABASE_URL):
    return create_engine(url, pool_pre_ping=True)


def get_session_factory(engine=None):
    if engine is None:
        engine = get_engine()
    return sessionmaker(bind=engine, autocommit=False, autoflush=False)
