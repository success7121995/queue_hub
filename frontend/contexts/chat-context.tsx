"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface ChatContextType {
  isOpen: boolean;
  selectedChat: string | null;
  openChat: (userId: string) => void;
  closeChat: () => void;
  setSelectedChat: (userId: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const openChat = useCallback((userId: string) => {
    setSelectedChat(userId || null);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setSelectedChat(null);
  }, []);

  const handleSetSelectedChat = useCallback((userId: string | null) => {
    setSelectedChat(userId);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        selectedChat,
        openChat,
        closeChat,
        setSelectedChat: handleSetSelectedChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}; 