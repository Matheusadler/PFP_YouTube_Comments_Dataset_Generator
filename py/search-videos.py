"""
Autor: Matheus Adler
Este script é responsável por buscar os videos no youtube dado um título de busca, salvar uma lista com os links dos videos que serão usados no script extract-comments.py
e retornar a quantidade de videos encontrados.
"""
# bibliotecas utilizadas nesse script
import os # biblioteca para manipulação de arquivos
import argparse # biblioteca para manipulação de argumentos
import numpy as np # biblioteca para manipulação numérica

from youtubesearchpython import * # importa o módulo que busca os videos no youtube


def YoutubeSearch(query_string):
    """
    Esta função recebe como entrada uma string de busca e retorna uma lista com os links dos videos encontrados.
    
    [Argumentos]
        query_string: string da busca a ser realizada no youtube.
      
    [Retorno]        
        [list] video_list: lista com os links dos videos encontrados.
    
    """    
    customSearch = CustomSearch(query_string, VideoSortOrder.uploadDate, limit=15) # busca os videos no youtube 
    i = 0
    excpt = 0 # variável que armazera a quantidade de exceções
    video_list = [] # lista que armazena os videos
    while(excpt < 10): # loop que busca os videos até que tenha 10 exceções
        try: # tenta buscar os videos
            for i in range(15): # loop que busca os videos em uma página da busca
                video_list.append(customSearch.result()['result'][i]['link']) # adiciona o link do video na lista
        except: # se der exceção, incrementa a variável excpt
            excpt += 1

        customSearch.next() # próxima página da busca

    return video_list # retorna a lista de videos


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Busca videos no youtube") # cria o parser
    parser.add_argument("--path-destiny", type=str, required=True) # cria o argumento path-destiny
    parser.add_argument("--query-string", type=str, required=True) # cria o argumento query-string
    
    args = parser.parse_args() # parseia os argumentos
    
    if os.path.exists("text_crawled.csv"): # verifica se o arquivo text_crawled.csv já existe
        os.remove("text_crawled.csv") # se existir, remove o arquivo para que não haja conflito com o arquivo que será criado
        
    if os.path.exists("video_list.npy"): # verifica se o arquivo video_list.npy já existe
        os.remove("video_list.npy") # se existir, remove o arquivo para que não haja conflito com o arquivo que será criado
        
    if os.path.exists("count.txt"): # verifica se o arquivo count.txt já existe
        os.remove("count.txt") # se existir, remove o arquivo para que não haja conflito com o arquivo que será criado
        
    if os.path.exists("count_preprocessing.txt"): # verifica se o arquivo count_preprocessing.txt já existe
        os.remove("count_preprocessing.txt") # se existir, remove o arquivo para que não haja conflito com o arquivo que será criado
        
    video_list = YoutubeSearch(args.query_string) # chama a função YoutubeSearch e armazena o resultado na variável video_list
    np.save('video_list.npy', video_list) # salva a lista de videos em um arquivo numpy
    print(len(video_list)) # imprime a quantidade de videos para que o Javascript possa saber quantos videos serão buscados
