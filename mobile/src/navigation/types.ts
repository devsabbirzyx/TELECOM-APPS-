import { Offer, Order } from '../types';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  OtpVerification: { phone_number: string; isLogin?: boolean };
  ChangePassword: undefined;
  PasswordChangedSuccess: undefined;

  MainTabs: undefined;

  OfferDetails: { offer: Offer };
  Checkout: { offer: Offer };
  PaymentProcessing: { orderId: string; paymentMethod: string; order?: Order };
  BkashGateway: { orderId: string; amount: number; invoiceNumber: string; offer?: Offer; recipientNumber?: string };
  NagadGateway: { orderId: string; amount: number; invoiceNumber: string; offer?: Offer; recipientNumber?: string };
  PaymentSuccess: { order: Order };
  PaymentFailed: {
    reason?: string;
    orderId?: string;
    offer?: Offer;
    recipientNumber?: string;
    paymentMethod?: string;
  };

  EditProfile: undefined;
  SavedNumbers: undefined;
  AddSavedNumber: undefined;
  ReferEarn: undefined;
  HelpSupport: undefined;
  LiveChat: { ticketId?: string };
  Notifications: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  OffersTab: { initialCategory?: string } | undefined;
  DriveOffersTab: undefined;
  WalletTab: undefined;
  ProfileTab: undefined;
};
