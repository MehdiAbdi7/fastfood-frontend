"use client";

import { useGetMenuItemsQuery } from "@/features/menu/menuApi";

const Page = () => {
  const { data: menuItems, isLoading, isError, error } = useGetMenuItemsQuery();

  if (isLoading) return <div className="p-8">Chargement du menu...</div>;

  if (isError) {
    console.error(error);
    return (
      <div className="p-8 text-accent-bordeaux">
        Erreur lors du chargement du menu. Vérifie que le backend tourne et que
        CORS_ORIGIN est bien configuré.
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Commande</h1>
      <p className="mb-4 text-sm text-foreground/60">
        {menuItems?.length ?? 0} produit(s) récupéré(s) depuis le backend
      </p>
      <ul className="flex flex-col gap-2">
        {menuItems?.map((item) => (
          <li
            key={item._id}
            className="rounded-lg border border-primary/20 p-3"
          >
            {item.name} — {item.variants[0]?.price ?? "?"} DA
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
