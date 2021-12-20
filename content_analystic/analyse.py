# Import module
from nudenet import *
import json, sys


# this script will analyse the content of the picture in argument
classifier = NudeClassifier()
els = list(classifier.classify(sys.argv[1]).items()) 
json_object = json.dumps(els[0][1], indent = 4)


# print the res for send this to the deno master script
print(json_object)