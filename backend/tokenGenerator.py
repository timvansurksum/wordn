import jwt
import os
from dotenv import load_dotenv


class Token:
    def getSecret(self):
        load_dotenv()
        return os.getenv('SECRET')

    def getToken(self, payload: dict):
        return jwt.encode(payload, self.getSecret(), algorithm="HS256")

    def decodeToken(self, token):
        try:
            return jwt.decode(token, self.getSecret(), algorithms="HS256")
        except:
            return {}

    def saveWordInTokenAndGetToken(self, word):
        return self.getToken({"word": word, "tries": len(word)+1})

    def getWordFromToken(self, token):
        decodedToken = self.decodeToken(token)
        if "word" in decodedToken:
            return decodedToken["word"]
        else:
            return ""

    def renewToken(self, token):
        decodedToken = self.decodeToken(token)

        if "tries" in decodedToken:
            decodedToken["tries"] -= 1

        return self.getToken(decodedToken)

    def getTries(self, token):
        decodedToken = self.decodeToken(token)
        if "tries" in decodedToken:
            return decodedToken["tries"]
        else:
            return 0
