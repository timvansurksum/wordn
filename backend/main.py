from typing import Optional

from fastapi import FastAPI
from game import Game
from validator import Validator

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/start")
def start(length: int, category: str):
    return Game().start(length, category)


@app.post("/validate_word")
def validateWord(word: str, token: str):
    return Validator().validateWord(token, word)    
