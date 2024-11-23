"use client";

import { NextUIProvider } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";
import { useEffect, useState } from 'react';
import { Input } from "@nextui-org/react";
import { Button, ButtonGroup } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import { CircularProgress } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import ModalError from "../components/ModalError";


export default function Page() {

  const router = useRouter()

  const username = localStorage.getItem('username')
  const token = localStorage.getItem('token')
  const vaga = localStorage.getItem('vaga')
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [allMessages, setAllMessages] = useState(['Olá! Seja bem-vindo à entrevista. Por favor, comece se apresentando, contando um pouco sobre a sua experiência e como você chegou até aqui.']);
  const [nota, setNota] = useState(0);
  const [isOpen, setIsOpen] = useState(false);


  const handleExit = () => {
    setIsOpen(true);
  }

  const goHome = () => {
    router.push('/')
  }


  const fetchLLMResponse = async () => {
    try {
      const response = await fetch('http://localhost:8080/sendResponse?token=' + token);
      const data = await response.json();
      console.log(data)

      const notaMatch = data.response.match(/NOTA:\s*(\d+)/);
      if (notaMatch) {
        const notaValue = parseInt(notaMatch[1], 10);
        setNota(notaValue);
        data.response = data.response.replace(notaMatch[0], '').replace(', TEXTO:', '');;
      }

      setAllMessages(prevMessages => [...prevMessages, data.response]);
    } catch (error) {
      console.error('Erro ao buscar resposta:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const _msgs = localStorage.getItem('allMessages');
    if (!_msgs) {
      localStorage.setItem('allMessages', JSON.stringify(allMessages));
    }
  }, [allMessages, setAllMessages]);

  useEffect(() => {
    const _msgs = localStorage.getItem('allMessages');
    if (_msgs) {
      const _array = JSON.parse(_msgs);
      console.log(_array)
      setAllMessages(_array);
    }
  }, []);

  const handleClick = () => {
    setLoading(true)
    fetch('http://localhost:8080/handleMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'token': token, 'msg': message }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setAllMessages(prevMessages => [...prevMessages, message]);
        setTimeout(() => {
          fetchLLMResponse();
        }, 2000);
        console.log(allMessages)
        setMessage('')
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
      });
  };

  return (
    <NextUIProvider className="bg-[#292f46] w-screen h-screen flex pb-10 flex-col justify-between">
      <div className="flex m-10 gap-10">
        <h1 className="text-white text-4xl font-bold w-11/12">
          <span style={{ color: '#fff' }}>{username},</span> esta na hora da entrevista!
        </h1>
        <CircularProgress
          size="lg"
          value={nota * 10}
          color="success"
          showValueLabel={true}
          className="text-white scale-[2]"
        />
        <div className="flex gap-4 flex-col">
        <Tooltip content={vaga} className="w-auto">
          <Button color="primary">Detalhes da vaga</Button>
        </Tooltip>
          <Button color="danger" onClick={handleExit}>Encerrar a entrevista</Button>
        </div>
      </div>

      <Divider className="my-4" />

      <div className="mx-10 flex-1 overflow-y-auto">
        {allMessages.map((msg, index) => (
          <div key={index} className='my-5'>
            <p className="text-white text-xl">
              <span className="font-bold">{index % 2 === 0 ? 'Entrevistador' : username}:</span> {msg}
            </p>
            <Divider className="my-4" />
          </div>
        ))}
      </div>

      <div className="mx-10 mt-auto">
        <div className="flex gap-10">
          <Input
            type="text"
            label="Digite sua mensagem"
            className="w-11/12 text-2xl"
            size="lg"
            variant="flat"
            value={message}
            onValueChange={setMessage}
            isDisabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleClick();
              }
            }}
          />
          <Button
            color="primary"
            variant="shadow"
            className="h-auto w-1/12 font-bold text-xl"
            onClick={handleClick}
          >
            Enviar
          </Button>
        </div>
      </div>

      <ModalError label="Deseja sair?" title="Encerrar entrevista" btnValue="sair" isOpen={isOpen} onOpenChange={setIsOpen} onPress={goHome} />
      
    </NextUIProvider>
  )
}