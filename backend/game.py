from dataset import Dataset
from tokenGenerator import Token

class Game:
    def start(self, length: int, category: str):
        dataset = Dataset()
        word = dataset.getRandomWord(category, length)
        return Token().saveWordInTokenAndGetToken(word)
