import os
import random


class Dataset:

    def split_dataset(self, category):
        path = os.path.abspath(f"datasets/{category}.txt")
        words = open(path, 'r')
        words = words.read().split('\n')

        word_length_dictionairy = {}
        for word in words:
            word_length = len(word)
            if word_length < 9 and word_length > 3:
                if word_length in word_length_dictionairy.keys():
                    word_length_dictionairy[word_length].append(word)
                else:
                    word_length_dictionairy[word_length] = [word]

        folder_path = os.path.abspath("datasets")
        for word_length, word_list in word_length_dictionairy.items():
            words_length_file = open(f"{folder_path}/length_sets/{category}_{word_length}.txt", 'w')
            
            line_seperated_word_list = '\n'.join(word_list)
            
            words_length_file.write(line_seperated_word_list)
            words_length_file.close()

    def getRandomWord(self, requested_category="standard", length=5):
        if (length > 3) and length < 9:
            categories = os.listdir('datasets')
            for category in categories:
                if (category.find(requested_category) + 1):
                    path = os.path.abspath(
                        f"datasets/length_sets/{requested_category}_{length}.txt")
                    data = open(path, 'r')
                    data = data.read().split('\n')
                    return random.choice(data).lower()
        else:
            return 'error wrong word length'

    def getCategories(self):
        categories = os.listdir('datasets')
        clean_categories = []
        for category in categories:
            if category.endswith('.txt'):
                clean_categories.append(category.split('.')[0])
        return clean_categories

    def checkWord(self, word: str):
        word_length = len(word)
        if word_length > 3 and word_length < 9:
            categories = self.getCategories()

            for category in categories:
                path = os.path.abspath(
                    f"datasets/{category}.txt")
                data = open(path, 'r')
                data = data.read().split('\n')
                for word_check in data:
                    if word_check.lower().startswith(word.lower()):
                        return True
            return False
        return False


# dataset = Dataset()
# word = 'verft'
# print(word, dataset.checkWord(word))
