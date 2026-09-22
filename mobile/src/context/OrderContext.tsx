import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Offer, OperatorCode, PaymentMethod } from '../types';

interface OrderContextType {
  selectedOffer: Offer | null;
  recipientNumber: string;
  operatorCode: OperatorCode;
  paymentMethod: PaymentMethod;
  setSelectedOffer: (offer: Offer | null) => void;
  setRecipientNumber: (number: string) => void;
  setOperatorCode: (code: OperatorCode) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCheckout: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [recipientNumber, setRecipientNumber] = useState<string>('01712345678');
  const [operatorCode, setOperatorCode] = useState<OperatorCode>('gp');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');

  const clearCheckout = () => {
    setSelectedOffer(null);
    setRecipientNumber('');
  };

  return (
    <OrderContext.Provider
      value={{
        selectedOffer,
        recipientNumber,
        operatorCode,
        paymentMethod,
        setSelectedOffer,
        setRecipientNumber,
        setOperatorCode,
        setPaymentMethod,
        clearCheckout,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
