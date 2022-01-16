from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from game import Game
from validator import Validator
from tokenGenerator import Token
from pydantic import BaseModel

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ValidateBody(BaseModel):
    word: str
    token: str


@app.get("/")
def read_root():
    return "This is the Wordn API"


@app.get("/start")
def start(length: int, category: Optional[str] = "standard"):
    return Game().start(length, category)


@app.post("/validate_word")
def validate_word(validateBody: ValidateBody):
    token = validateBody.token
    word = validateBody.word
    renewedToken = Token().renewToken(token)
    return {"validation": Validator().validateWord(token, word), "token": renewedToken, "tries": Token().getTries(renewedToken)}
