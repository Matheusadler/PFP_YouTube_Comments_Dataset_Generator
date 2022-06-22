# bibliotecas utilizadas nesse script
import os
import re
import time
import json
import requests
import numpy as np
import pandas as pd

from tqdm import tqdm

import warnings
warnings.filterwarnings("ignore")


USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36' # agente dos navegadores
FILE_NAME = 'text_crawled.csv' # nome do arquivo que será salvo com os comentários
COMMENT_LIMIT = 10000 # limite de comentários a serem extraidos
YT_CFG_RE = r'ytcfg\.set\s*\(\s*({.+?})\s*\)\s*;' # regex para extrair o json de configuração
YT_INITIAL_DATA_RE = r'(?:window\s*\[\s*["\']ytInitialData["\']\s*\]|ytInitialData)\s*=\s*({.+?})\s*;\s*(?:var\s+meta|</script|\n)' # regex para realizar a busca no html

def regex_search(text, pattern, group=1, default=None): # função para extrair informações do html
    match = re.search(pattern, text) 
    return match.group(group) if match else default


def ajax_request(session, endpoint, ytcfg, retries=5, sleep=20): # função para realizar requisições ajax
    url = 'https://www.youtube.com' + endpoint['commandMetadata']['webCommandMetadata']['apiUrl'] # url da requisição

    data = {'context': ytcfg['INNERTUBE_CONTEXT'],
            'continuation': endpoint['continuationCommand']['token']} # dados da requisição

    for _ in range(retries): # loop para tentar realizar a requisição
        response = session.post(url, params={'key': ytcfg['INNERTUBE_API_KEY']}, json=data) # requisição
        if response.status_code == 200: # se a requisição for bem sucedida
            return response.json() # retorna o json da requisição
        if response.status_code in [403, 413]: # se a requisição for 403 ou 413
            return {} # retorna um json vazio
        else: # se a requisição não for bem sucedida
            time.sleep(sleep) # espera um tempo antes de tentar novamente


def download_comments(YOUTUBE_VIDEO_URL, language=None, sleep=0.1): # função para extrair os comentários
    session = requests.Session() # cria uma sessão
    session.headers['User-Agent'] = USER_AGENT # define o agente do navegador
    response = session.get(YOUTUBE_VIDEO_URL) # requisição

    if 'uxe=' in response.request.url: # se a requisição for bem sucedida
        session.cookies.set('CONSENT', 'YES+cb', domain='.youtube.com') # define o cookie do youtube
        response = session.get(YOUTUBE_VIDEO_URL) # requisição

    html = response.text # html da página
    ytcfg = json.loads(regex_search(html, YT_CFG_RE, default='')) # extrai o json de configuração
    if not ytcfg: # se o json de configuração não for encontrado
        return  # não foi possível extrair a configuração
    if language: # se o idioma for especificado
        ytcfg['INNERTUBE_CONTEXT']['client']['hl'] = language # define o idioma da página

    data = json.loads(regex_search(html, YT_INITIAL_DATA_RE, default='')) # extrai o json inicial

    section = next(search_dict(data, 'itemSectionRenderer'), None) # extrai a seção de comentários
    renderer = next(search_dict(section, 'continuationItemRenderer'), None) if section else None # extrai o renderer
    if not renderer: # se o renderer não for encontrado
        # provavelmente é por que os comentários estão desabilitados
        return

    continuations = [renderer['continuationEndpoint']] # adiciona o endpoint do renderer à lista de continuações
    while continuations: 
        continuation = continuations.pop() # pega o último endpoint da lista de continuações
        response = ajax_request(session, continuation, ytcfg) # requisição ajax

        if not response: # se a requisição não for bem sucedida
            break 
        if list(search_dict(response, 'externalErrorMessage')): # se houver um erro
            raise RuntimeError('Error returned from server: ' + next(search_dict(response, 'externalErrorMessage'))) 

        actions = list(search_dict(response, 'reloadContinuationItemsCommand')) + \
                  list(search_dict(response, 'appendContinuationItemsAction')) # extrai as ações
        for action in actions: # para cada ação
            for item in action.get('continuationItems', []): # para cada item
                if action['targetId'] == 'comments-section': # se for um comentário
                    continuations[:0] = [ep for ep in search_dict(item, 'continuationEndpoint')] # continuações do processo para comentários e respostas.
                if action['targetId'].startswith('comment-replies-item') and 'continuationItemRenderer' in item: # se for uma resposta
                    continuations.append(next(search_dict(item, 'buttonRenderer'))['command']) # processa o botão 'Mostrar mais respostas'

        for comment in reversed(list(search_dict(response, 'commentRenderer'))): # para cada comentário
            yield {'text': ''.join([c['text'] for c in comment['contentText'].get('runs', [])]), # extrai o texto do comentário
                   'time': comment['publishedTimeText']['runs'][0]['text'], # extrai o tempo do comentário
                   'author': comment.get('authorText', {}).get('simpleText', ''), # extrai o nome do autor
                   'channel': comment['authorEndpoint']['browseEndpoint'].get('browseId', '')} # extrai o canal 

        time.sleep(sleep) # espera um tempo antes de tentar novamente

def search_dict(partial, search_key): # função para procurar um dicionário
    stack = [partial] # adiciona o dicionário à pilha
    while stack: # enquanto houver elementos na pilha
        current_item = stack.pop() # pega o último elemento da pilha
        if isinstance(current_item, dict): # se for um dicionário
            for key, value in current_item.items(): # para cada chave e valor
                if key == search_key: # se a chave for a procurada
                    yield value # retorna o valor
                else: # se não for a procurada
                    stack.append(value) # adiciona o valor à pilha
        elif isinstance(current_item, list): # se for uma lista
            for value in current_item: # para cada valor
                stack.append(value) # adiciona o valor à pilha

def main(url): # função principal
    df_comment = pd.DataFrame() # cria um dataframe para os comentários
    try: 
        youtube_url = url # define a url do vídeo
        limit = COMMENT_LIMIT # define o limite de comentários

        count = 0 # contador de comentários

        for comment in download_comments(youtube_url): # para cada comentário

            df_comment = df_comment.append(comment, ignore_index=True) # adiciona o comentário ao dataframe
            df_comment['link'] = youtube_url # adiciona a url do vídeo ao dataframe

            count += 1 # incrementa o contador de comentários

            if limit and count >= limit: # se o limite de comentários for atingido
                break

        if not os.path.isfile(FILE_NAME): # se o arquivo não existir
            df_comment.to_csv(FILE_NAME, encoding='utf-8', index=False) # salva o dataframe como csv
        else:  # caso contrário, existe então acrescenta sem escrever o cabeçalho
            df_comment.to_csv(FILE_NAME, mode='a', encoding='utf-8', index=False, header=False)

    except Exception as e: # se houver algum erro
        print('Error:', str(e)) # imprime o erro


if __name__ == '__main__':
    video_list = np.load('video_list.npy') # carrega a lista de vídeos
    
    progressbar = 0 # contador de progresso
    for video_link in tqdm(video_list): 
        main(video_link) # chama a função principal para cada vídeo
        with open('count.txt', 'a') as f: # abre o arquivo para escrita de progresso da barra
            f.write(str(progressbar) + '\n')
        progressbar += 1
    
    df = pd.read_csv(FILE_NAME) # carrega o dataframe para enviar a quantidade de comentários para o JavaScript
    print(len(df))
        
        
        
        