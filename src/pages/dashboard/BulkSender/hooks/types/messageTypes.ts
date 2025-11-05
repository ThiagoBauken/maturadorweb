
export interface MessageSentiment {
  positive: number;
  negative: number;
  neutral: number;
}

export interface MessageActivity {
  id: string;
  sessionId: string;
  phoneNumber: string;
  sessionName?: string;
  messages: WhatsAppMessage[];
  lastActivity: string;
}

export interface WhatsAppMessage {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  status: "pending" | "failed" | "sent" | "delivered" | "read";
  direction: "inbound" | "outbound";
  sentiment?: "positive" | "negative" | "neutral";
  isReply?: boolean;
  media?: {
    type: "image" | "video" | "audio" | "document";
    url: string;
  };
}

export interface SendingConfig {
  useRandomInterval: boolean;
  minInterval: number;
  maxInterval: number;
}
