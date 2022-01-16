import jwt
import os
from dotenv import load_dotenv
from dataset import Dataset


class Game:
    def start(self, length: int, category: str):
        dataset = Dataset()
        word = dataset.getRandomWord(category, length)
        return self.saveWordInTokenAndGetToken(word)

    def getSecret(self):
        load_dotenv()
        return os.getenv('SECRET')

    def getToken(self, payload: dict):
        return jwt.encode(payload, self.getSecret(), algorithm="HS256")

    def decodeToken(self, token):
        return jwt.decode(token, self.getSecret(), algorithms="HS256")
    
    def saveWordInTokenAndGetToken(self, word):
        return self.getToken({"word":word})
    
    def getWordFromToken(self, token):
        decodedToken = self.decodeToken(token)
        if "word" in decodedToken:
            return decodedToken["word"]
        else:
            return ""
