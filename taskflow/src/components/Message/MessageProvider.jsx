import React, { createContext, useContext } from "react";
import { message } from "antd";

// Create context
const MessageContext = createContext(null);

// Provider component
export const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  // Reusable function to trigger messages
  const showMessage = (type, content) => {
    messageApi.open({ type, content });
  };

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the message function
export const useMessage = () => {
  return useContext(MessageContext);
};
