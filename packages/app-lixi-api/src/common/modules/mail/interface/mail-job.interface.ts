export interface MailJobInterface {
  to: string;
  slug: string;
  subject: string;
  context: any;
  attachments?: any;
}

export interface MailJobData {
  payload: MailJobInterface;
  type: string;
}