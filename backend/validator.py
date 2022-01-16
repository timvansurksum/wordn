
from enum import Enum
from tokenGenerator import Token


class Validator:

    def validateWord(self, token, word):
        wordToGuess = Token().getWordFromToken(token)
        validatedDict = {}
        characters = {}
        wordToGuessCharacters = {}

        if len(wordToGuess) != len(word):
            return {}

        for index, char in enumerate(word):
            if char == wordToGuess[index]:
                characters[index] = {'char': char,
                                     'state': CharacterState['Correct']}
                wordToGuessCharacters[index] = {'char': wordToGuess[index],
                                                'state': CharacterState['Correct']}
            else:
                characters[index] = {'char': char,
                                     'state': CharacterState['Wrong']}
                wordToGuessCharacters[index] = {'char': wordToGuess[index],
                                                'state': CharacterState['Wrong']}

        charactersWhichHaveNotBeenGuessedCorrectly = [wordToGuessCharacters[index]['char'] for index in wordToGuessCharacters if wordToGuessCharacters[index]['state'] == CharacterState['Wrong']]
        
        for index, char in enumerate(word):
            if characters[index]['state'] == CharacterState['Wrong'] and char in charactersWhichHaveNotBeenGuessedCorrectly:
                characters[index]['state'] = CharacterState['WrongPosition']

        for position in characters:
            char = characters[position]
            validatedDict[char['char']+str(position)] = char['state'].name
            
        return validatedDict


class CharacterState(Enum):
    Wrong = 1
    Correct = 2
    WrongPosition = 3
