// FILE: src/app/services/email.service.ts

import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class Email {
  // Replace these with your EmailJS credentials
  private serviceId = 'service_xaqclyg'; // e.g., 'service_abc123'
  private processingTemplateId = 'template_blyiido'; // Template for processing status
  private deliveredTemplateId = 'template_1j8vprn'; // Template for delivered status
  private publicKey = 'IMhb5vqmYYTRkuaid'; // Your EmailJS public key

  constructor() {
    // Initialize EmailJS
    emailjs.init(this.publicKey);
  }

  /**
   * Send email when order status changes to "processing"
   */
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
        templateParams
      );

      console.log('Processing email sent successfully');
    } catch (error) {
      console.error('Error sending processing email:', error);
      throw error;
    }
  }

  /**
   * Send email when order status changes to "delivered"
   */
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
        templateParams
      );

      console.log('Delivered email sent successfully');
    } catch (error) {
      console.error('Error sending delivered email:', error);
      throw error;
    }
  }
}