export default function Footer() {
  return (
    <footer className="bg-surface-container-highest text-primary font-body-md text-body-md w-full border-t-2 border-on-background">
      <div className="max-w-7xl mx-auto px-gutter py-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg border-b-2 border-on-background pb-lg mb-lg">
          <div>
            <div className="font-headline-sm text-headline-sm text-on-surface uppercase mb-2">
              AUTENTIC&apos;S
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Crafting your perfect cup since 2020. No pretense, just exceptional coffee.
            </p>
          </div>
          <div>
            <h4 className="font-label-bold text-label-bold uppercase text-on-background mb-3">
              Lokasi
            </h4>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
             Indonesia<br />
              
            </p>
          </div>
          <div>
            <h4 className="font-label-bold text-label-bold uppercase text-on-background mb-3">
              Jam Operasional
            </h4>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Senin - Jumat: 07.00 - 22.00<br />
              Sabtu - Minggu: 08.00 - 23.00
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="text-on-surface-variant font-medium text-center md:text-left text-sm">
            &copy; 2026 Autentic&apos;s Cafe. Roasted with passion.
          </div>
          <ul className="flex gap-md">
            <li>
              <a
                href="#"
                className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-bold uppercase text-sm"
              >
                INSTAGRAM
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-bold uppercase text-sm"
              >
                FACEBOOK
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-bold uppercase text-sm"
              >
                CONTACT US
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
