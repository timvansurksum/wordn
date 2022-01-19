import os
from dotenv import load_dotenv
from dataset import Dataset
from tokenGenerator import Token
load_dotenv()
show_word_in_logs = os.getenv('SHOW_WORD_IN_LOGS', False)

class Game:
    def start(self, length: int, category: str):
        dataset = Dataset()
        word = dataset.getRandomWord(category, length)

        if (show_word_in_logs == 'true'):
            print(f'new word for user is: {word}')
            
        return Token().saveWordInTokenAndGetToken(word)
