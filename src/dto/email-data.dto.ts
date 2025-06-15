// src/email/dto/email-data.dto.ts
export class EmailDataDto {
  recipients: string[];               
  subject: string;                
  mailTemplateName: string;       
  serviceProvider?: string;      
  data?: Record<string, any>;        
  ccList?: string[];      
  bccList?: string[];               
  fromName?: string;  
  fromEmail?: string;               
}