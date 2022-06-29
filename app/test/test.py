"""
Autor: Matheus Adler
Este script é responsável por realizar testes de unidade nos módulos do sistema.

"""
import sys # importa a biblioteca sys para uso do argumento de entrada
import unittest # importa a biblioteca unittest para uso dos métodos de teste

import warnings # importa a biblioteca warnings para ocultar avisos

sys.path.append('../') # adiciona o diretório pai ao path
    
from py import search_videos, extract_comments, preprocessing_comments # importa os scripts usados como módulos para o teste

class Test(unittest.TestCase):
    def test_search_videos(self):
        """
        Teste da função de busca dos vídeos
        """
        video_list = type(search_videos.YoutubeSearch("string de busca")).__name__
        print("Retorno esperado da função de busca dos vídeos [list]: " + video_list)
        self.assertEqual(video_list, "list")

    def test_crawler(self):
        """
        Teste da função de extrair os comentários
        """
        warnings.filterwarnings("ignore") # ignora os avisos
        comments = extract_comments.crawler("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        print("Retorno esperado da função de extrair os comentários [True]: " + str(comments))
        self.assertEqual(comments, True)
    
    def test_text_cleaner(self):
        """
        Teste da função de preprocessamento dos comentários
        """
        comment_preprocessed = preprocessing_comments.text_cleaner()
        print("Retorno esperado da função de pré-processamento dos comentários [True]: " + str(comment_preprocessed))
        self.assertEqual(comment_preprocessed, True)

if __name__ == '__main__':
    unittest.main()