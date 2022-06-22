# bibliotecas utilizadas nesse script
import re
import os
import nltk
import string
import argparse
import pandas as pd

from youtubesearchpython import *
from nltk.corpus import stopwords

import warnings
warnings.filterwarnings("ignore")

FILE_NAME = 'text_crawled.csv' # nome do arquivo que tem os comentarios extraidos

def deEmojify(text): # remove emojis
    regrex_pattern = re.compile("[" 
                                u"\U0001F600-\U0001F64F"  # emojis
                                u"\U0001F300-\U0001F5FF"  # símbolos e pictogramas
                                u"\U0001F680-\U0001F6FF"  # símbolos de transporte e mapa
                                u"\U0001F1E0-\U0001F1FF"  # sinalizadores (iOS)
                                u"\U00002500-\U00002BEF"  # caracter chinês
                                u"\U00002702-\U000027B0"
                                u"\U00002702-\U000027B0"
                                u"\U000024C2-\U0001F251"
                                u"\U0001f926-\U0001f937"
                                u"\U00010000-\U0010ffff"
                                u"\u2640-\u2642"
                                u"\u2600-\u2B55"
                                u"\u200d"
                                u"\u23cf"
                                u"\u23e9"
                                u"\u231a"
                                u"\ufe0f" 
                                u"\u3030"
                                "]+", re.UNICODE)
    return regrex_pattern.sub(r'', text) 


def text_cleaner(): # função principal que faz o preprocessamento dos comentarios
    df = pd.read_csv(FILE_NAME) # le o arquivo csv com os comentarios
    df.columns = ['text', 'published time', 'author', 'id channel', 'link'] # renomeia as colunas
    progressbar = 0 # contador para a barra de progresso
    messages = [] # lista que vai armazenar os comentarios
    for i in range(df.shape[0]): # percorre todos os comentarios
        if df['text'][i] == None: # se o comentario for nulo
            messages.append(None) # adiciona None na lista
            continue

        comment = deEmojify(df['text'][i])                                              # remove os emojis
        comment = comment.replace(u'\ufffd', '8')                                       # Substitui o símbolo ASCII '�' por '8'
        comment = comment.translate(str.maketrans("","", string.punctuation))           # remove pontuação
        comment = comment.rstrip('\n')                                                  # remove quebras de linha
        comment = comment.lower()                                                       # deixa todo o texto em minusculo
        
        comment = re.sub('\W_',' ', comment)                                            # remove caracteres especiais e deixa apenas palavras
        comment = re.sub("\S*\d\S*"," ", comment)                                       # remove números e palavras concatenadas com números
        comment = re.sub("\S*@\S*\s?"," ", comment)                                     # remove e-mails e menções (palavras com @)
        comment = re.sub(r'http\S+', '', comment)                                       # remove URLs com http
        comment = re.sub(r'www\S+', '', comment)                                        # remove URLs com www
        comment = re.sub(r'kkk\S+', '', comment)                                        # remove comentários com "kkk"
        comment = re.sub(r'\W*\b\w{1,2}\b', '', comment)                                # remove strings com menos de 2 letras
        comment = re.sub(r'\W*\b\w{21,}\b', '', comment)                                # remove strings com mais de 20 letras
        tokens = nltk.word_tokenize(comment)                                            # tokenização
        tokens = [w for w in tokens if not w.lower() in stopwords.words("portuguese")]  # remove stopwords (palavras que não são importantes) em português
        tokens = [w for w in tokens if not w.lower() in stopwords.words("english")]     # remove stopwords (palavras que não são importantes) em inglês
        comment = " ".join(tokens)                                                      # junta todos os tokens em uma string
        comment = comment.strip()                                                       # remove espaços em branco
        comment = comment.split()                                                       # divide uma string em uma lista
        comment = ' '.join(comment)                                                     # junta em uma string

        if len(comment.split(" ")) > 1:                                                 # se o comentario tiver mais de uma palavra
            messages.append(comment)                                                    # adiciona o comentario na lista
        else:                                                                           # se o comentario tiver apenas uma palavra
            messages.append(None)                                                       # adiciona None na lista
        
        with open('count_preprocessing.txt', 'a') as f:                                 # abre o arquivo para escrita de progresso da barra
            f.write(str(progressbar) + '\n')
        progressbar += 1

    df['text'] = messages # adiciona a lista de comentarios na coluna text
    df = df.mask(df.eq(None)).dropna() # remove os comentarios que não foram preprocessados
    df = df.reset_index() # reseta o index
    df = df.drop(labels='index', axis=1) # remove a coluna index
    
    df.to_csv('text_preprocessed.csv', encoding='utf-8', index=False) # salva o arquivo csv com os comentarios preprocessados
    


if __name__ == '__main__':
    text_cleaner() # chama a função principal

    parser = argparse.ArgumentParser(description="Busca videos no youtube") # cria o parser
    parser.add_argument("--path-destiny", type=str, required=True) # cria o argumento path-destiny
    parser.add_argument("--query-string", type=str, required=True) # cria o argumento query-string
    
    args = parser.parse_args() # parseia os argumentos
    
    file_name = args.query_string.replace(" ", "_") # substitui os espaços por underlines para o nome do arquivo
    
    df_clean = pd.read_csv('text_preprocessed.csv') # le o arquivo csv com os comentarios preprocessados
    df_crawled = pd.read_csv('text_crawled.csv') # le o arquivo csv com os comentarios extraidos do youtube
    
    if os.path.exists(f"{args.path_destiny}/{file_name}_crawled.csv"): # se o arquivo já existir
        os.remove(f"{args.path_destiny}/{file_name}_crawled.csv") # remove o arquivo
    
    df_crawled.to_csv(f"{args.path_destiny}/{file_name}_crawled.csv", encoding='utf-8', index=False) # e salva o arquivo csv com os comentarios extraidos do youtube
    
    if os.path.exists(f"{args.path_destiny}/{file_name}_preprocessed.csv"): # se o arquivo já existir
        os.remove(f"{args.path_destiny}/{file_name}_preprocessed.csv") # remove o arquivo
        
    df_clean.to_csv(f"{args.path_destiny}/{file_name}_preprocessed.csv", encoding='utf-8', index=False) # e salva o arquivo csv com os comentarios preprocessados
    