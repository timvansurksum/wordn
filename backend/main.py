from typing import Optional

from fastapi import FastAPI
from game import Game

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/start")
def start(length: int, category: str):
    return Game().start(length, category)


@app.post("/validate_word")
def read_item(word: str, token: str):
    return {"k0": "Status", "u1": "Status", "t2": "Status"}
