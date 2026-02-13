import { validateOrder } from './validators/OrderValidator';
import { checkInventory, reserveItems } from './InventoryService';
import { processPayment } from './PaymentService';
import { calculateShipping } from './ShippingService';
import { sendOrderConfirmation } from './NotificationService';
import { createOrderRecord, updateOrderStatus } from './database/OrderRepository';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId?: string;
  customerId: string;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
}

export async function processOrder(order: Order): Promise<string> {
  // Step 1: Validate order
  const validationResult = validateOrder(order);
  if (!validationResult.isValid) {
    throw new Error(`Invalid order: ${validationResult.errors.join(', ')}`);
  }

  // Step 2: Check inventory
  const inventoryCheck = await checkInventory(order.items);
  if (!inventoryCheck.available) {
    throw new Error('Items not available');
  }

  // Step 3: Calculate shipping
  const shippingCost = await calculateShipping(
    order.shippingAddress,
    order.items
  );

  // Step 4: Calculate total
  const total = calculateOrderTotal(order.items) + shippingCost;

  // Step 5: Process payment
  const paymentResult = await processPayment({
    amount: total,
    method: order.paymentMethod,
    customerId: order.customerId,
  });

  if (!paymentResult.success) {
    throw new Error('Payment failed');
  }

  // Step 6: Reserve inventory
  await reserveItems(order.items);

  // Step 7: Create order record
  const orderId = await createOrderRecord({
    ...order,
    total,
    shippingCost,
    paymentId: paymentResult.transactionId,
    status: 'confirmed',
  });

  // Step 8: Send confirmation
  await sendOrderConfirmation(order.customerId, orderId);

  // Step 9: Update status
  await updateOrderStatus(orderId, 'processing');

  return orderId;
}

export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export async function cancelOrder(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'confirmed' && order.status !== 'processing') {
    throw new Error('Cannot cancel order in current status');
  }

  // Refund payment
  await refundPayment(order.paymentId);

  // Release inventory
  await releaseItems(order.items);

  // Update status
  await updateOrderStatus(orderId, 'cancelled');

  // Notify customer
  await sendCancellationEmail(order.customerId, orderId);
}

async function getOrderById(orderId: string): Promise<Order | null> {
  // Implementation would query database
  return null;
}

async function refundPayment(paymentId: string): Promise<void> {
  // Implementation would process refund
}

async function releaseItems(items: OrderItem[]): Promise<void> {
  // Implementation would release inventory
}

async function sendCancellationEmail(customerId: string, orderId: string): Promise<void> {
  // Implementation would send email
}
