/**
 * Süni şəbəkə gecikməsi köməkçisi (300-600ms)
 * Real server çağırışları və asinxron yüklənmə vəziyyətlərini simulyasiya edir.
 */
export async function delay(minMs = 300, maxMs = 600): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

