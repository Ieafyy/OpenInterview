"use client";

import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalFooter, ModalBody, ModalContent } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { NextUIProvider } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import { Textarea } from "@nextui-org/input";
import { motion } from 'framer-motion';


export default function Home() {

  const router = useRouter()

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [vaga, setVaga] = useState('');

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setLoading(true)
    fetch('http://localhost:8080/createSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'username': username, 'vaga': vaga }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        localStorage.setItem('vaga', vaga);
        setIsModalVisible(false);
        router.push('/chat')
        setLoading(false)
      })
      .catch((error) => {
        console.log(error)
        setIsModalVisible(false)
        setErrorModal(true)
        setLoading(false)
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setErrorModal(false)
  };


  const deleteSession = async (_token) => {
    try {
      const response = await fetch('http://localhost:8080/deleteSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'token': _token }),
      });
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  useEffect(() => {

    const _msgs = localStorage.getItem('allMessages');
    const _token = localStorage.getItem('token');

    if (_token) {
      deleteSession(_token)
    }

    if (_msgs) {
      localStorage.removeItem('allMessages');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }

    

    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#222';
      ctx.font = `${fontSize}px arial`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return (
    <NextUIProvider>
      <style jsx global>{`
        body {
          margin: 0;
          overflow-x: hidden;
        }
      `}</style>

      <canvas id="matrix" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}></canvas>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Arial, sans-serif', color: '#fff', fontSize: '4em', fontWeight: 'bold' }}>
          Se prepare para qualquer <span style={{ color: '#044' }}>entrevista!</span>
        </h1>
        <Button className="bg-white mt-10 text-2xl px-10 py-10 rounded-xl" onClick={showModal} >
          Marcar entrevista!
        </Button>
      </div>

      <Modal
        backdrop="opaque"
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "bg-[#953] dark:bg-[#292f46] text-[#bbb]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
        className="bg-slate-200 rounded-xl"
        isOpen={isModalVisible}
        onOpenChange={setIsModalVisible}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold">Iniciar login</ModalHeader>
              <ModalBody>
                <p className="text-xl">Digite um nome de usuario: </p>
                <Input
                  type="text"
                  placeholder="Nome de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />

                {username !== '' && (
                  <motion.div>
                    <p className="text-xl mt-5">Agora coloque aqui a vaga da sua entrevista: </p>
                    <Textarea
                      placeholder="Anuncio da vaga..."
                      value={vaga}
                      onValueChange={setVaga}
                    />
                  </motion.div>
                )}

              </ModalBody>
              <ModalFooter>
                <Button color="danger" className="bg-red-600 text-white rounded-xl" variant="light" onPress={handleCancel}>
                  Close
                </Button>
                <Button color="primary" className="bg-blue-600 text-white rounded-xl" onPress={handleOk} isLoading={loading}>
                  Vamos lá!
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        backdrop="opaque"
        isOpen={errorModal}
        onOpenChange={setErrorModal}
        radius="lg"
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "bg-[#953] dark:bg-[#922822] text-[#fff]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
        className="rounded-xl"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="text-xl font-bold flex flex-col gap-1">Erro :(</ModalHeader>
              <ModalBody>
                <p className="text-xl">
                  Tivemos um problema ao acessar as informações, tente novamente mais tarde
                </p>
              </ModalBody>
              <ModalFooter>
                <Button className="bg-[#944] rounded-xl shadow-lg shadow-indigo-500/20" onPress={handleCancel}>
                  Fechar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>





    </NextUIProvider>
  );
}
