"""
Autor: Matheus Adler
Este script é responsável por realizar testes de unidade nos módulos do sistema.

"""
import sys
import unittest

import warnings 

sys.path.append('../')
    
from py import search_videos, extract_comments, preprocessing_comments

class Test(unittest.TestCase):
    def test_search_videos(self):
        """
        Teste da função de busca dos vídeos
        """
        video_list = type(search_videos.YoutubeSearch("string de busca")).__name__
        self.assertEqual(video_list, "list")

    def test_crawler(self):
        """
        Teste da função de extrair os comentários
        """
        warnings.filterwarnings("ignore") # ignora os avisos
        comments = extract_comments.crawler("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        self.assertEqual(comments, True)
    
    def test_text_cleaner(self):
        """
        Teste da função de preprocessamento dos comentários
        """
        comment_preprocessed = preprocessing_comments.text_cleaner()
        self.assertEqual(comment_preprocessed, True)
        
    
    
        
        
        
    
    
        

if __name__ == '__main__':
    unittest.main()