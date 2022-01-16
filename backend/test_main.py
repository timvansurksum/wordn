from fastapi.testclient import TestClient
from game import Game
from tokenGenerator import Token
from validator import Validator
from main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == "This is the Wordn API"


def test_start():
    response = client.get("/start?length=5")
    assert response.status_code == 200


def test_validate_word_empty():
    token = Game().start(5, "standard")
    word = ""
    renewedToken = Token().renewToken(token)

    Validator().validateWord(token, word)
    response = client.post(
        "/validate_word",
        json={"token": token, "word": word},
    )

    assert response.status_code == 200
    assert response.json() == {"validation": Validator().validateWord(
        token, word), "token": renewedToken, "tries": Token().getTries(renewedToken)}


def test_validate_word():
    token = Game().start(5, "standard")
    word = "tests"
    renewedToken = Token().renewToken(token)

    Validator().validateWord(token, word)
    response = client.post(
        "/validate_word",
        json={"token": token, "word": word},
    )

    assert response.status_code == 200
    assert response.json() == {"validation": Validator().validateWord(
        token, word), "token": renewedToken, "tries": Token().getTries(renewedToken)}
