import React from 'react';
import { Modal, ModalHeader, ModalFooter, ModalBody, ModalContent } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { NextUIProvider } from "@nextui-org/react";

const ModalError = ({ label, btnValue, isOpen, onOpenChange, onPress, title }) => {
  return (
    <NextUIProvider>
      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
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
              <ModalHeader className="text-xl font-bold flex flex-col gap-1">{ title }</ModalHeader>
              <ModalBody>
                <p className="text-xl">
                  { label }
                </p>
              </ModalBody>
              <ModalFooter>
                <Button className="bg-[#944] rounded-xl shadow-lg shadow-indigo-500/20" onPress={onPress}>
                  { btnValue }
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </NextUIProvider>
  );
};

export default ModalError;