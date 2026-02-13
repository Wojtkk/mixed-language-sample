import { getProductById, updateProductQuantity } from './database/ProductRepository';
import { createReservation, releaseReservation } from './database/ReservationRepository';
import { sendLowStockAlert } from './NotificationService';

export interface InventoryItem {
  productId: string;
  quantity: number;
}

export interface InventoryCheckResult {
  available: boolean;
  unavailableItems: string[];
}

export async function checkInventory(
  items: InventoryItem[]
): Promise<InventoryCheckResult> {
  const unavailableItems: string[] = [];

  for (const item of items) {
    const product = await getProductById(item.productId);

    if (!product) {
      unavailableItems.push(item.productId);
      continue;
    }

    if (product.quantity < item.quantity) {
      unavailableItems.push(item.productId);
    }
  }

  return {
    available: unavailableItems.length === 0,
    unavailableItems,
  };
}

export async function reserveItems(items: InventoryItem[]): Promise<string> {
  // Step 1: Validate inventory
  const check = await checkInventory(items);
  if (!check.available) {
    throw new Error(`Items unavailable: ${check.unavailableItems.join(', ')}`);
  }

  // Step 2: Create reservation
  const reservationId = await createReservation({
    items,
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  // Step 3: Update quantities
  for (const item of items) {
    await updateProductQuantity(item.productId, -item.quantity);

    // Step 4: Check if low stock
    const product = await getProductById(item.productId);
    if (product && product.quantity < product.lowStockThreshold) {
      await sendLowStockAlert(item.productId, product.quantity);
    }
  }

  return reservationId;
}

export async function releaseItems(items: InventoryItem[]): Promise<void> {
  for (const item of items) {
    await updateProductQuantity(item.productId, item.quantity);
  }
}

export async function fulfillOrder(items: InventoryItem[]): Promise<void> {
  // Items already reserved, just mark as fulfilled
  for (const item of items) {
    await markItemFulfilled(item.productId, item.quantity);
  }
}

export async function restockProduct(
  productId: string,
  quantity: number
): Promise<void> {
  // Step 1: Validate product
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Step 2: Update quantity
  await updateProductQuantity(productId, quantity);

  // Step 3: Log restock
  await logRestockEvent(productId, quantity);

  // Step 4: Notify if back in stock
  if (product.quantity === 0) {
    await notifyBackInStock(productId);
  }
}

async function markItemFulfilled(
  productId: string,
  quantity: number
): Promise<void> {
  // Implementation
}

async function logRestockEvent(productId: string, quantity: number): Promise<void> {
  // Implementation
}

async function notifyBackInStock(productId: string): Promise<void> {
  // Implementation
}
