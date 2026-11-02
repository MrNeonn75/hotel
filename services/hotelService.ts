import { mockHotels } from '@/data/hotels';
import { Hotel } from '@/types/hotel';

const getRandomDelay = (min = 400, max = 700): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const delay = (ms?: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms ?? getRandomDelay()));
};

export const hotelService = {
  /**
   * Bütün otellərin siyahısını qaytarır.
   * Loading vəziyyətlərini test etmək üçün 400-700ms süni gecikmə ilə işləyir.
   */
  async getHotels(): Promise<Hotel[]> {
    await delay();
    return [...mockHotels];
  },

  /**
   * Verilmiş ID üzrə tək otel obyektini qaytarır.
   */
  async getHotelById(id: string): Promise<Hotel | undefined> {
    await delay();
    const found = mockHotels.find((hotel) => hotel.id === id);
    return found ? { ...found } : undefined;
  },

  /**
   * Verilmiş ID siyahısı üzrə otelləri qaytarır (Favoritlər və tarixçə üçün).
   */
  async getHotelsByIds(ids: string[]): Promise<Hotel[]> {
    await delay();
    const idSet = new Set(ids);
    return mockHotels
      .filter((hotel) => idSet.has(hotel.id))
      .map((hotel) => ({ ...hotel }));
  },
};

export default hotelService;

