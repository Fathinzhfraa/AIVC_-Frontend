const steps = [
  {
    number: 1,
    bgColor: "bg-primary",
    textColor: "text-on-primary",
    title: "Sourcing Beans",
    description:
      "We partner directly with farmers, prioritizing high-altitude origins and sustainable practices over generic commodity beans.",
    image:
      "/images/process-beans.jpg",
  },
  {
    number: 2,
    bgColor: "bg-tertiary",
    textColor: "text-on-tertiary",
    title: "Expert Roasting",
    description:
      "Our vintage drum roaster brings out the specific architectural flavor profile of each batch, avoiding burnt bitterness.",
    image:
      "/images/process-roasting.jpg",
  },
  {
    number: 3,
    bgColor: "bg-secondary",
    textColor: "text-on-secondary",
    title: "Perfect Brewing",
    description:
      "Rigorous baristas, calibrated equipment, and filtered water ensure a hard-hitting, pure coffee experience every time.",
    image:
      "/images/process-brewing.jpg",
  },
];

export default function ProcessSection() {
  return (
    <section className="w-full bg-surface-container-low border-y-2 border-on-background py-xl relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#1a1c1c 2px, transparent 2px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="max-w-7xl mx-auto px-gutter relative z-10">
        <div className="text-center mb-lg">
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg uppercase text-on-background inline-block bg-primary-fixed px-4 border-2 border-on-background neu-shadow">
            Our Process
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-2xl mx-auto">
            From high-altitude farms to the cup in your hand, we control every
            raw variable to ensure a consistently brutal, brilliant extraction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg relative">
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-on-background -z-10 border-t-2 border-dashed border-on-background" />
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`bg-surface border-2 border-on-background neu-shadow flex flex-col relative z-10 ${
                index > 0 ? "mt-md md:mt-0" : ""
              }`}
            >
              <div className="h-40 overflow-hidden border-b-2 border-on-background">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover grayscale-[20%] hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 ${step.bgColor} ${step.textColor} border-2 border-on-background rounded-full flex items-center justify-center font-headline-md text-headline-md -mt-10 mb-3 neu-shadow`}
                >
                  {step.number}
                </div>
                <h3 className="font-headline-sm text-headline-sm uppercase mb-2">
                  {step.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
