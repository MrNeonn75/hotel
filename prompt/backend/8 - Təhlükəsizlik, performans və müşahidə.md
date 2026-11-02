1) Rate limiting (slowapi və ya redis ilə): public endpoint-lər üçün 120 sorğu/dəqiqə/IP, POST /bookings üçün 10/dəqiqə/device.
2) Giriş məlumatlarının təmizlənməsi (strip, max length) bütün schema-larda; specialRequests max 500 simvol.
3) Bütün SQL sorğuları parametrləşdirilmiş olsun (raw string birləşdirmə olmasın), yoxla.
4) Həssas sahələrin (phone, email, documentNumber) loglarda maskalanması üçün logging filter.
5) GZip middleware, hotels siyahısı üçün ETag/Cache-Control (60 saniyə), DB connection pool ayarları.
6) /health (liveness) və /health/ready (DB yoxlaması) ayrılsın.
7) Sentry inteqrasiyası üçün hazır (DSN .env-də ixtiyari).
8) GitHub Actions workflow: ruff, pytest (postgres service ilə), docker build.