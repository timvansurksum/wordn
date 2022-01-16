import codecs
import os
import random



class Dataset:

    def split_dataset(self, category):
        path = os.path.abspath(f"datasets/{category}.txt")
        words = open(path, 'r')
        linesep = os.linesep
        words = words.read().split('\n')
        
        word_length_dictionairy = {}
        for word in words:
            word_length = len(word)
            if word_length in word_length_dictionairy.keys():
                word_length_dictionairy[word_length].append(word)
            else:
                word_length_dictionairy[len(word)] = []
        for word_length_key in word_length_dictionairy.keys():
            folder_path = os.path.abspath("datasets")
            words_length_file = open(f"{folder_path}/{category}_{word_length_key}.txt", 'w')
            words = ''
            for word in word_length_dictionairy[word_length_key]:
                words_length_file.write(f'{word}\n')



    def getRandomWord(self, requested_category = "standard", length = 5):
        if (length > 3) and length < 9:
            categories = os.listdir('datasets')
            for category in categories:
                if (category.find(requested_category) + 1):
                    path = os.path.abspath(f"datasets/{requested_category}_{length}.txt")
                    data = open(path, 'r')
                    data = data.read().split('\n')
                    return random.choice(data).lower()
        else:
            return 'error wrong word length'
    
    def getCategories(self):
        return []