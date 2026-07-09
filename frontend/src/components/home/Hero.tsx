export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#1a0f0f] text-[#fff7e8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(163,54,45,0.4),transparent_60%)] pointer-events-none" />
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#ffd166]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-[#ffb703]/8 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-115">
              <div className="absolute -inset-4 rounded-4xl border border-[#f7d98b]/30" />
              <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-[#240606]/60">
                <img
                  src="https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80"
                  alt="Sri Naveena sweets and bakery display"
                  className="h-105 w-full object-cover sm:h-125"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#2b0707]/80 via-[#2b0707]/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[#f7d98b]/40 bg-[#2b0707]/70 p-4 backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ffd166]">
                    Today’s Special
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-[#fff8e8]">
                        Milk Cake • Gulab Jamun
                      </div>
                      <div className="text-sm text-[#ffe6b1]">
                        Made with traditional recipes
                      </div>
                    </div>
                    <div className="rounded-full bg-[#ffd166] px-3 py-2 text-sm font-semibold text-[#4b110d]">
                      Fresh
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 flex flex-col justify-center lg:order-2">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#f7d98b]/40 bg-[#f7d98b]/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ffe8b8]">
              <span>Freshly baked • festive sweets</span>
            </div>

            <h1 className="mb-2 text-5xl font-black leading-tight text-[#fff4d9] sm:text-6xl lg:text-7xl">
              Sri Naveena
            </h1>
            <h2 className="mb-6 text-4xl font-semibold leading-tight text-[#ffcf70] sm:text-5xl lg:text-6xl">
              Sweets & Bakery
            </h2>

            <p className="mb-4 font-serif text-xl italic text-[#ffe3a8] sm:text-2xl">
              Traditional sweetness, baked fresh every day.
            </p>

            <p className="mb-10 max-w-xl text-base leading-8 text-[#fff2d4]/85 sm:text-lg">
              From rich milk sweets and festive snacks to soft cakes and bakery
              favorites, Sri Naveena brings warmth, flavor, and celebration to
              every occasion.
            </p>

            <div className="mb-10 flex flex-wrap gap-3">
              <div className="flex items-center gap-3 rounded-full border border-[#f7d98b]/30 bg-[#f7d98b]/15 px-5 py-3">
                <div className="text-2xl font-bold text-[#ffe9ae]">100%</div>
                <div className="text-xs uppercase tracking-wider text-[#fff0cb]/80">
                  Handmade
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-[#f7d98b]/30 bg-[#f7d98b]/15 px-5 py-3">
                <div className="text-2xl font-bold text-[#ffe9ae]">Daily</div>
                <div className="text-xs uppercase tracking-wider text-[#fff0cb]/80">
                  Fresh Bakes
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-[#f7d98b]/30 bg-[#f7d98b]/15 px-5 py-3">
                <div className="text-2xl font-bold text-[#ffe9ae]">Festive</div>
                <div className="text-xs uppercase tracking-wider text-[#fff0cb]/80">
                  Favorites
                </div>
              </div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <a
                  href="#featured"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#ffd166] to-[#ffb703] px-7 py-4 text-sm font-bold text-[#4b110d] shadow-lg shadow-[#ffd166]/30 transition hover:scale-105 hover:shadow-xl hover:shadow-[#ffd166]/50"
                >
                  Explore Treats
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-4 bg-[#fff8ef] sm:h-5" />
    </section>
  );
}
