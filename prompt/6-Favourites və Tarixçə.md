store/favoritesStore.ts: Zustand + persist (AsyncStorage). favoriteIds[], toggleFavorite(id), isFavorite(id). Bütün ürək düymələri (HotelCard, detallar, favourites) bu store-dan istifadə etsin.

Favourites ekranı: başlıq "Favoritlərim" və sayğac. getHotelsByIds ilə otelləri HotelCard-larla göstər. Kartdan ürəyi söndürəndə kart animasiya ilə siyahıdan çıxsın (reanimated layout animation). Boşdursa: böyük ürək illüstrasiyası, "Hələ favorit otel yoxdur" və "Otellərə bax" düyməsi.

store/historyStore.ts: Zustand + persist. bookings[], addBooking(), cancelBooking(id).
Tarixçə ekranı: rezervasiyalar ən yenisi yuxarıda. Hər kartda: otel şəkli (kiçik, solda), ad, tarixlər (12 Okt - 14 Okt), qonaq sayı, yekun qiymət, status badge-i (Təsdiqlənib - yaşıl, Ləğv edilib - boz). Karta basanda otel detalına keçid. Təsdiqlənmiş rezervasiya üçün "Ləğv et" düyməsi (təsdiq dialoqu ilə). Boşdursa empty state.