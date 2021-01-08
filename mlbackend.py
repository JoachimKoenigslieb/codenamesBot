#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Dec 23 13:21:38 2020

@author: joachim
"""


import gensim.downloader as api


def get_wordlist():
    with open('./most-common-nouns-english.csv') as file:
        data = file.readlines()
        return [w.strip().split(',')[0] for w in data[1:]]

def get_model():
    info = api.info()  # show info about available models/datasets
    model = api.load("glove-twitter-25")  # download the model and return as object ready for use
    return model

