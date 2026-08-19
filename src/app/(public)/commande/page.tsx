import { OrderMenu } from "@/components/publicOrder/OrderMenu";

export const metadata = {
  title: "Commander — Niwa Food",
  description:
    "Composez votre commande Niwa Food : sur place, à emporter ou en livraison à Kouba et Chéraga.",
};

export default function CommandePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-32 pt-24 sm:px-6 sm:pt-28">
      <header className="mb-6 flex flex-col gap-1.5">
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-accent-green">
          Notre carte
        </span>
        <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Composez votre commande
        </h1>
        <p className="text-sm text-foreground/60">
          Sur place, à emporter ou en livraison. Vous choisirez à la fin.
        </p>
      </header>

      <OrderMenu />
    </div>
  );
}
