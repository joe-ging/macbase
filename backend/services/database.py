
from sqlalchemy import create_engine, Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./grandmaster_mac.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    event = Column(String, index=True)
    site = Column(String)
    date = Column(String) # Storing as string YYYY.MM.DD standard in chess
    round = Column(String)
    white = Column(String, index=True)
    black = Column(String, index=True)
    result = Column(String)
    eco = Column(String)
    opening = Column(String, nullable=True)  # Opening name from PGN header
    white_elo = Column(Integer, nullable=True)
    black_elo = Column(Integer, nullable=True)
    pgn = Column(Text) # storing the full PGN text for analysis
    twic_issue = Column(Integer, index=True) # To track which issue this came from
    is_commented = Column(Integer, default=0, index=True) # 0 = no, 1 = yes
    is_personal = Column(Integer, default=0, index=True) # 1 = user analyzed this game

class ExcludedIssue(Base):
    __tablename__ = "excluded_issues"
    id = Column(Integer, primary_key=True, index=True)
    twic_issue = Column(Integer, unique=True, index=True)

class RepertoireFolder(Base):
    __tablename__ = "repertoire_folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, nullable=True) # For nested folders
    color = Column(String, default='neon-lime') # UI color
    created_at = Column(String) # ISO date string

class RepertoireGame(Base):
    __tablename__ = "repertoire_games"

    id = Column(Integer, primary_key=True, index=True)
    folder_id = Column(Integer, ForeignKey("repertoire_folders.id"), index=True)
    title = Column(String)
    white = Column(String, nullable=True)
    black = Column(String, nullable=True)
    white_elo = Column(String, nullable=True)
    black_elo = Column(String, nullable=True)
    event = Column(String, nullable=True)
    pgn = Column(Text)
    fen = Column(String) # Thumbnail FEN or position FEN for flashcards
    is_flashcard = Column(Integer, default=0) # 1 if it's a flashcard (single position)
    arrows_json = Column(Text, nullable=True) # JSON array of arrows for persistent overlay: [{from: 'e2', to: 'e4', color: 'G'}]
    orientation = Column(String, default='white') # Added to remember perspective
    tags = Column(String, nullable=True) # Comma separated tags (e.g., 'Opening:B01,Tactic')
    created_at = Column(String)

def init_db():
    Base.metadata.create_all(bind=engine)
