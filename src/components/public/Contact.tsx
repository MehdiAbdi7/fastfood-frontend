import Image from "next/image";

const LOCATIONS = [
  {
    name: "Kouba",
    phone: "0552 52 00 76",
    address: "Kouba, Alger",
  },
  {
    name: "Chéraga",
    phone: "0549 18 97 27",
    address: "Chéraga, Alger",
  },
];

export function Contact() {
  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden px-6 py-10"
    >
      {/* Décoration — tout en dessous */}
      <Image
        src="/deco-fastfood2.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="pointer-events-none -z-20 hidden -scale-x-100 -scale-y-100 object-cover object-top lg:block"
      />

      {/* Fondu — au-dessus de la déco, en dessous du contenu */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-linear-to-r from-background/10 via-background/5 to-background/5 dark:from-background/10 dark:via-background/10 dark:to-background/10"
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <span className="font-heading text-sm font-bold uppercase tracking-wide text-accent-green">
            Nous trouver
          </span>
          <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
            Deux adresses, un seul régal
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {LOCATIONS.map((location) => (
            <div
              key={location.name}
              className="flex flex-col gap-4 rounded-3xl bg-primary/5 p-6 shadow-food-sm sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="icon-[mdi--map-marker] text-3xl text-accent-green" />
                <h3 className="font-heading text-xl font-bold text-primary">
                  {location.name}
                </h3>
              </div>

              <p className="text-foreground/80">{location.address}</p>

              <a
                href={`tel:${location.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 font-semibold text-accent-green hover:underline"
              >
                <span className="icon-[mdi--phone] text-xl" />
                {location.phone}
              </a>

              <div className="mt-2 flex items-start gap-2 text-sm text-foreground/70">
                <span className="icon-[mdi--clock-outline] mt-0.5 text-lg" />
                <div>
                  <p>Lun – Jeu, Sam – Dim : 11h00 – 00h30</p>
                  <p>Vendredi : 18h00 – 00h30</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-sm text-foreground/70">Suivez-nous</p>
          <a
            href="https://www.instagram.com/niwafood/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary transition-transform duration-300 hover:scale-110"
            aria-label="Niwa Food sur Instagram"
          >
            <span className="icon-[mdi--instagram] text-2xl" />
          </a>
        </div>
      </div>
    </section>
  );
}
