import MenuSection from "../components/MenuSection";

export default function MenuPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-background pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-gutter">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-[40px] text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
            restaurant_menu
          </span>
          <h1 className="font-display-lg tracking-tighter text-display-lg-mobile md:text-headline-md uppercase text-on-background">
            Menu Pesanan
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Pilih menu favorit kamu dan mulai pesan
          </p>
        </div>
      </div>
      <MenuSection />
    </div>
  );
}
