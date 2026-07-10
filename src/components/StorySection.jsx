export default function StorySection() {
  return (
    <section id="story" className="w-full max-w-7xl mx-auto px-gutter py-xl">
      <div className="flex justify-between items-end mb-lg border-b-2 border-on-background pb-sm">
        <h2 className="font-headline-md text-headline-md uppercase text-on-background">
          Our Story
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="flex flex-col gap-lg">
          <div className="bg-surface border-2 border-on-background neu-shadow neu-card p-6 md:p-8">
            <div className="w-12 h-12 bg-primary flex items-center justify-center border-2 border-on-background mb-4">
              <span
                className="material-symbols-outlined text-on-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                coffee
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm uppercase mb-3">
              Awal Mula
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
             Authentic Cafe merupakan kafe dengan konsep modern dan estetik yang menghadirkan pengalaman bersantai dalam suasana nyaman. Menyajikan beragam pilihan kopi, minuman non-kopi, serta makanan berkualitas, Authentic Cafe menjadi destinasi yang cocok untuk bekerja, berkumpul, maupun menikmati waktu sendiri dengan suasana yang menenangkan.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Setiap sudut Autentic Cafe dirancang dengan penuh perhatian terhadap
              detail — perpaduan sempurna antara nuansa industrial yang hangat
              dengan sentuhan artistik modern. Bukan sekadar tempat minum kopi,
              tapi ruang untuk berkarya, berdiskusi, dan menemukan inspirasi.
            </p>
          </div>
          <div className="relative h-64 md:h-72 overflow-hidden border-2 border-on-background neu-shadow">
            <img
              src="/images/story-interior.jpg"
              alt="Autentic Cafe Interior"
              className="w-full h-full object-cover grayscale-[20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-3 left-3 text-white font-label-bold text-label-bold uppercase bg-black/60 px-2 py-1 border border-white/30">
              Autentic Cafe
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-lg">
          <div className="relative h-64 md:h-72 overflow-hidden border-2 border-on-background neu-shadow">
            <img
              src="/images/story-coffee-art.jpg"
              alt="Coffee Art"
              className="w-full h-full object-cover grayscale-[20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-3 left-3 text-white font-label-bold text-label-bold uppercase bg-black/60 px-2 py-1 border border-white/30">
              Crafted with Love
            </span>
          </div>
          <div className="bg-surface border-2 border-on-background neu-shadow neu-card p-6 md:p-8">
            <div className="w-12 h-12 bg-tertiary flex items-center justify-center border-2 border-on-background mb-4">
              <span
                className="material-symbols-outlined text-on-tertiary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                emoji_people
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm uppercase mb-3">
              Filosofi Kami
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Kami percaya bahwa secangkir kopi yang baik adalah awal dari
              percakapan yang bermakna. Dengan menghadirkan beragam pilihan kopi
              dan non-kopi serta makanan modern, Autentic Cafe menjadi tempat di
              mana setiap orang bisa menemukan favoritnya.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Biji kopi pilihan dari petani lokal, teknik brewing yang konsisten,
              dan pelayanan yang tulus — itulah komitmen kami. Karena di Autentic
              Cafe, setiap tegukan adalah cerita.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
