import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class Email {
  private serviceId = 'service_xaqclyg'; 
  private processingTemplateId = 'template_blyiido'; 
  private deliveredTemplateId = 'template_1j8vprn'; 
  private contactTemplateId = 'template_vy0l68d'; 
  private publicKey = 'IMhb5vqmYYTRkuaid'; 

  constructor() {
    emailjs.init(this.publicKey);
  }


  async sendProcessingEmail(
    customerEmail: string,
    customerName: string,
    orderId: string,
    orderTotal: number
  ): Promise<void> {
    try {
      const templateParams = {
        to_email: customerEmail,
        to_name: customerName,
        order_id: orderId,
        order_total: orderTotal.toFixed(2),
        status: 'Processing'
      };

      await emailjs.send(
        this.serviceId,
        this.processingTemplateId,
        templateParams,
        this.publicKey
      );

      console.log('Processing email sent successfully');
    } catch (error) {
      console.error('Error sending processing email:', error);
      throw error;
    }
  }

  async sendDeliveredEmail(
    customerEmail: string,
    customerName: string,
    orderId: string,
    orderTotal: number
  ): Promise<void> {
    try {
      const templateParams = {
        to_email: customerEmail,
        to_name: customerName,
        order_id: orderId,
        order_total: orderTotal.toFixed(2),
        status: 'Delivered'
      };

      await emailjs.send(
        this.serviceId,
        this.deliveredTemplateId,
        templateParams,
        this.publicKey
      );

      console.log('Delivered email sent successfully');
    } catch (error) {
      console.error('Error sending delivered email:', error);
      throw error;
    }
  }

  async sendContactInquiry(
    name: string,
    email: string,
    subject: string,
    message: string
  ): Promise<void> {
    try {
      const templateParams = {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message,
        to_email: 'alcotimeinfo@gmail.com'
      };

      await emailjs.send(
        this.serviceId,
        this.contactTemplateId,
        templateParams,
        this.publicKey
      );

      console.log('Contact inquiry email sent successfully');
    } catch (error) {
      console.error('Error sending contact inquiry email:', error);
      throw error;
    }
  }
}