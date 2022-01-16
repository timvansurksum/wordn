import codecs
import os
import random



class Dataset:

    def getRandomWord(self, category = "standard", length = 5):
        datasets = os.listdir('datasets')
        for dataset in datasets:
            if (dataset.find(category) + 1):
                path = os.path.abspath(f"datasets/{dataset}")
                data = open(path, 'r')
                data = data.read().split('\n')
                return random.choice(data)
    
    def getCategories(self):
        return []
    
dataset = Dataset()
print(dataset.getRandomWord())