import os
import datetime
import redis
import time
import jwt
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv()

mongoUri = os.getenv('MONGO_URI')
redisHost = os.getenv('REDIS_HOST')
redisPort = os.getenv('REDIS_PORT')
redisPassword = os.getenv('REDIS_PASSWORD')
key = os.getenv('KEY')

app = Flask(__name__)
CORS(app)

uri = mongoUri
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['sessions']

r = redis.Redis(
  host=redisHost,
  port=redisPort,
  password=redisPassword
)

default = """
Atue como um entrevistador de emprego especializado na area da vaga que te mandarei.
Seu papel é avaliar o candidato e decidir se ele é aprovado ou não. Queremos que você seja o mais realista possível.
Diga ao candidato para se apresentar e que você fará um total de 10 perguntas (1 de cada vez) sobre a vaga.
Ao final, você deve dizer se ele foi aprovado ou não e dar uma nota de 0 ate 10 para o desempenho do candidato.
Apos isso, aponte os pontos fortes e fracos do candidato e aonde ele deve focar para determidada vaga.
Leve em consideração o nivel de conhecimento do candidato com base na senioridade da vaga e os conhecimentos necessarios.
Para cada resposta do candidato quero que de uma nota de 0 a 10 no formato NOTA: X, TEXTO: Sua proxima pergunta.
A vaga pede o seguinte: 
"""

#--------------------------------------------------------------------

@app.route('/createSession', methods=['POST'])
def createSession():

  global default

  _username = request.get_json()['username']
  exp = datetime.datetime.utcnow() + datetime.timedelta(hours = 1)
  payload = {'dados': {'username': _username}, 'exp': exp }
  token = jwt.encode(payload, key, algorithm='HS256')
  db.create_collection(token)
  _content = default + request.get_json()['vaga']

  document = {
      'message': {"role": "system", "content": _content},
      'token': token
  }

  db[token].insert_one(document)

  return jsonify({'token': token})

#--------------------------------------------------------------------

@app.route('/handleMessage', methods=['POST'])
def handleMessage():
  data = request.get_json()

  try:
    payload = jwt.decode(data['token'], key, algorithms=['HS256'])
  except:
    return jsonify({'msg': 'Token invalido'})

  _data = '{"token": "' + data['token'] + '", "msg": "' + data['msg'] + '"}'

  r.rpush("messages", _data)
  return jsonify({'response': 'ok!'})

#--------------------------------------------------------------------

async def waitResponse(token):
  print('Procurando no banco de dados...')
  while True:
    collection = db[token]
    time.sleep(5)
    latest_message = collection.find().sort('_id', -1).limit(1)
    latest_message = latest_message[0]
    if latest_message['message']['role'] != 'assistant':
      print('Ultima mensagem do user! Tentando novamente...')
      time.sleep(1)
    else:
      print('Mensagem do LLM encontrada! Enviando para o front...')
      return latest_message['message']['content']


@app.route('/sendResponse', methods=['GET'])
async def sendResponse():
  token = request.args.get('token')
  llm_response = await waitResponse(token)
  print(llm_response)

  return jsonify({'response': llm_response})
  
#--------------------------------------------------------------------

@app.route('/deleteSession', methods=['POST'])
def deleteSession():
  data = request.get_json()
  db[data['token']].drop()
  return jsonify({'response': 'ok!'})

#--------------------------------------------------------------------

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=8080, debug=True)
