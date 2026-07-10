import { Link } from "react-router-dom";
import { asset } from "../lib/asset";

export default function Hero() {
  return (
    <section className="w-full max-w-7xl mx-auto px-gutter py-xl md:py-[120px] flex flex-col md:flex-row items-center gap-lg">
      <div className="flex-1 space-y-md z-10">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background uppercase relative inline-block">
          Crafting Your <br />
          <span className="bg-tertiary-fixed px-2 border-2 border-on-background inline-block mt-2 neu-shadow">
            Perfect Cup
          </span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
          Experience the raw, architectural energy of carefully sourced beans
          roasted to perfection. No pretense, just exceptional coffee.
        </p>
        <div className="pt-sm flex gap-sm flex-wrap">
          <Link
            to="#menu"
            className="bg-primary text-on-primary border-2 border-on-background neu-shadow px-8 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none inline-block"
          >
            VIEW MENU
          </Link>
          <Link
          to = "#story" className="bg-surface text-on-background border-2 border-on-background neu-shadow px-8 py-3 font-label-bold text-label-bold uppercase transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
            OUR STORY
          </Link>
        </div>
      </div>
      <div className="flex-1 w-full relative h-[320px] md:h-[520px]">
        <div className="absolute inset-0 overflow-hidden translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4">
          <div className="absolute inset-0 bg-secondary-container border-2 border-on-background neu-shadow">
            <img
              alt="Perfect Cup of Coffee"
              className="w-full h-full object-cover grayscale-[20%] contrast-125 hover:scale-105 transition-transform duration-700"
              src={asset("/images/autentics-cafe.jpeg")}
            />
          </div>
        </div>
        <div className="absolute -bottom-3 -left-3 bg-primary text-on-primary border-2 border-on-background px-4 py-2 font-label-bold text-label-bold uppercase neu-shadow z-20 hidden md:block">
          Since 2026
        </div>
      </div>
    </section>
  );
}
