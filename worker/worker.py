import os
import redis
import time
import json
import asyncio
from dotenv import load_dotenv
from openai import OpenAI
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv()

mongoUri = os.getenv('MONGO_URI')
openAiKey = os.getenv('OPENAI_API_KEY')
redisHost = os.getenv('REDIS_HOST')
redisPort = os.getenv('REDIS_PORT')
redisPassword = os.getenv('REDIS_PASSWORD')

uri = mongoUri
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['sessions']
ia = OpenAI(api_key=openAiKey)

r = redis.Redis(
    host=redisHost,
    port=redisPort,
    password=redisPassword
)

try:
    client.admin.command('ping')
    print("MongoDB conectado com sucesso!")
except Exception as e:
    print(f"Erro ao conectar ao MongoDB: {e}")

async def iaGen(message, messages):
  completion = ia.chat.completions.create(
      model="gpt-4o-mini",
      messages=messages
  )
  resposta = completion.choices[0].message.content
  print(resposta)
  return resposta

async def getMessages(token):
  documents = db[token].find()
  _msgs = []
  for doc in documents:
    _msgs.append(doc['message'])
  return _msgs



async def process_messages():
    while True:
        try:
            _msg = r.rpop('messages')
            if _msg:
                _msg = json.loads(_msg.decode('utf-8'))

                document = {
                  'message': {"role": "user", "content": _msg['msg']},
                  'token': _msg['token']
                }

                db[_msg['token']].insert_one(document)
                print(f'Mensagem inserida no MongoDB!')

                messages = await getMessages(_msg['token'])
                response = await iaGen(_msg['msg'], messages)

                document = {
                  'message': {"role": "assistant", "content": response},
                  'token': _msg['token']
                }

                db[_msg['token']].insert_one(document)
                print(f'Mensagem inserida no MongoDB!')

            else:
                print('Aguardando mensagens...')
                await asyncio.sleep(5)

        except Exception as e:
            print(f"Erro ao processar a mensagem: {e}")
            await asyncio.sleep(5)

async def main():
    await process_messages()

if __name__ == "__main__":
    asyncio.run(main())
