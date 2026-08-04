import Image from "next/image";
import Link from "next/link";

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
      className="relative isolate overflow-hidden px-6 sm:px-8 py-16 sm:py-24 bg-linear-to-br from-background via-background to-primary "
    >
      <div className="mx-auto max-w-6xl rounded-4xl shadow-[0_0_30px_5px_rgba(217,169,77,0.45)] shadow-primary backdrop-blur-md px-8 py-6 bg-primary/60 dark:bg-primary/30 border border-foreground">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <span className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
            Où nous trouver
          </span>
          <h2 className="font-heading text-3xl font-bold text-accent-green sm:text-4xl">
            Deux adresses, un seul régal
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {LOCATIONS.map((location) => (
            <div
              key={location.name}
              className="flex flex-col gap-4 rounded-3xl bg-primary/70 backdrop-blur-2xl p-6 shadow-food-sm sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="icon-[mdi--map-marker] text-3xl text-accent-green" />
                <h3 className="font-heading text-xl font-bold text-foreground">
                  {location.name}
                </h3>
              </div>

              <p className="text-background">{location.address}</p>

              <a
                href={`tel:${location.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 font-semibold text-foreground hover:underline"
              >
                <span className="icon-[mdi--phone] text-xl" />
                {location.phone}
              </a>

              <div className="mt-2 flex items-start gap-2 text-sm text-background">
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
          <p className="text-sm teontext-background">Suivez-nous</p>
          <div className="flex justify-center items-center gap-2">
            <Link
              href="https://www.facebook.com/niwafood"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700/30 transition-transform duration-300 hover:scale-110"
              aria-label="Niwa Food sur facebook"
            >
              <span className="icon-[mdi--facebook] bg-blue-700 text-2xl"></span>
            </Link>
            <Link
              href="https://www.instagram.com/niwafood/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/20 transition-transform duration-300 hover:scale-110"
              aria-label="Niwa Food sur Instagram"
            >
              <span className="icon-[line-md--instagram] bg-rose-600 text-2xl"></span>
            </Link>
            <Link
              href="https://www.tiktok.com/@niwafood"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/80 transition-transform duration-300 hover:scale-110"
              aria-label="Niwa Food sur Tiktok"
            >
              <span className="icon-[line-md--tiktok] bg-white text-2xl"></span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
