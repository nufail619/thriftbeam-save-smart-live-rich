import { api } from "@/lib/api";

export type ContactPayload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export const contactApi = {
  send: (payload: ContactPayload) => api.post("/contact", payload),
};
