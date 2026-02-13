import { getUserEmail, getUserPreferences } from './database/UserRepository';
import { formatEmailTemplate } from './templates/EmailFormatter';
import { sendEmail } from './email/EmailClient';
import { logNotification } from './database/NotificationRepository';

export async function sendOrderConfirmation(
  customerId: string,
  orderId: string
): Promise<void> {
  // Step 1: Get customer email
  const email = await getUserEmail(customerId);
  if (!email) {
    throw new Error('Customer email not found');
  }

  // Step 2: Get order details
  const orderDetails = await getOrderDetails(orderId);

  // Step 3: Format email
  const emailContent = formatEmailTemplate('order-confirmation', {
    orderId,
    ...orderDetails,
  });

  // Step 4: Send email
  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderId}`,
    html: emailContent,
  });

  // Step 5: Log notification
  await logNotification({
    customerId,
    type: 'order_confirmation',
    referenceId: orderId,
    timestamp: new Date(),
  });
}

export async function sendPaymentReceipt(
  customerId: string,
  transactionId: string,
  amount: number
): Promise<void> {
  const email = await getUserEmail(customerId);
  if (!email) return;

  const emailContent = formatEmailTemplate('payment-receipt', {
    transactionId,
    amount,
    timestamp: new Date(),
  });

  await sendEmail({
    to: email,
    subject: `Payment Receipt - ${transactionId}`,
    html: emailContent,
  });

  await logNotification({
    customerId,
    type: 'payment_receipt',
    referenceId: transactionId,
    timestamp: new Date(),
  });
}

export async function sendLowStockAlert(
  productId: string,
  currentQuantity: number
): Promise<void> {
  // Get admin emails
  const adminEmails = await getAdminEmails();

  const emailContent = formatEmailTemplate('low-stock-alert', {
    productId,
    currentQuantity,
  });

  for (const email of adminEmails) {
    await sendEmail({
      to: email,
      subject: `Low Stock Alert - ${productId}`,
      html: emailContent,
    });
  }
}

export async function sendShippingUpdate(
  customerId: string,
  orderId: string,
  status: string,
  trackingNumber?: string
): Promise<void> {
  const email = await getUserEmail(customerId);
  if (!email) return;

  const preferences = await getUserPreferences(customerId);
  if (!preferences.emailNotifications) return;

  const emailContent = formatEmailTemplate('shipping-update', {
    orderId,
    status,
    trackingNumber,
  });

  await sendEmail({
    to: email,
    subject: `Shipping Update - ${orderId}`,
    html: emailContent,
  });

  await logNotification({
    customerId,
    type: 'shipping_update',
    referenceId: orderId,
    timestamp: new Date(),
  });
}

async function getOrderDetails(orderId: string): Promise<any> {
  // Implementation
  return {};
}

async function getAdminEmails(): Promise<string[]> {
  // Implementation
  return ['admin@example.com'];
}
