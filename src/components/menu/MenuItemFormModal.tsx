/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { VariantEditor } from "./VariantEditor";
import {
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useUploadMenuItemImageMutation,
} from "@/features/menu/menuItemApi";
import { useGetMenuCategoriesQuery } from "@/features/menu/menuApi";
import { useGetMenuExtrasQuery } from "@/features/menu/menuExtraApi";
import { useToast } from "@/features/toast/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import type { MenuItem, MenuItemVariant } from "@/types/menuItem";

interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null; // null = création
}

export function MenuItemFormModal({
  isOpen,
  onClose,
  item,
}: MenuItemFormModalProps) {
  const isEditing = item !== null;
  const { data: categories } = useGetMenuCategoriesQuery();
  const { data: extras } = useGetMenuExtrasQuery();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [variants, setVariants] = useState<MenuItemVariant[]>([
    { combination: {}, price: 0 },
  ]);
  const [removableIngredients, setRemovableIngredients] = useState("");
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createItem, { isLoading: isCreating }] = useCreateMenuItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateMenuItemMutation();
  const [uploadImage, { isLoading: isUploading }] =
    useUploadMenuItemImageMutation();
  const toast = useToast();
  const isLoading = isCreating || isUpdating || isUploading;

  // Réinitialise le formulaire à chaque ouverture — évite qu'un item édité
  // laisse des traces dans le formulaire de création suivant.
  useEffect(() => {
    if (!isOpen) return;
    setName(item?.name ?? "");
    setDescription(item?.description ?? "");
    setCategoryId(
      typeof item?.category === "object"
        ? item.category._id
        : (item?.category ?? ""),
    );
    // Normalise `combination` dès le chargement : les produits antérieurs au
    // dashboard peuvent l'avoir absent en base, ce qui casserait VariantEditor
    // et renverrait des variantes invalides au backend à l'enregistrement.
    setVariants(
      (item?.variants ?? [{ combination: {}, price: 0 }]).map((variant) => ({
        combination: variant.combination ?? {},
        price: variant.price,
      })),
    );
    setRemovableIngredients(item?.removableIngredients?.join(", ") ?? "");
    setSelectedExtraIds(
      (item?.availableExtras ?? []).map((e) =>
        typeof e === "object" ? e._id : e,
      ),
    );
    setAvailable(item?.available ?? true);
    setImageFile(null);
    setImagePreview(item?.imageUrl ?? null);
    setError(null);
  }, [isOpen, item]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Libère l'aperçu précédent s'il s'agissait déjà d'un blob local, pour ne
    // pas accumuler des object URLs jamais révoquées.
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function toggleExtra(id: string) {
    setSelectedExtraIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Choisis une catégorie");
      return;
    }
    if (variants.some((v) => !v.price || v.price <= 0)) {
      setError("Chaque variante doit avoir un prix positif");
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      category: categoryId,
      variants,
      availableExtras: selectedExtraIds,
      removableIngredients: removableIngredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      available,
    };

    try {
      // Deux temps si une image est fournie : le produit doit exister avant
      // qu'on puisse uploader son image (route /upload/menu-item-image/:id).
      const savedItem = isEditing
        ? await updateItem({ id: item._id, body: payload }).unwrap()
        : await createItem(payload).unwrap();

      if (imageFile) {
        await uploadImage({ id: savedItem._id, file: imageFile }).unwrap();
      }

      toast.success(isEditing ? "Produit mis à jour" : "Produit créé");
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Modifier le produit" : "Nouveau produit"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" form="menu-item-form" isLoading={isLoading}>
            {isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </>
      }
    >
      <form
        id="menu-item-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
              {imagePreview ? (
                // <img> volontaire ici : imagePreview peut être une blob: URL
                // (aperçu local avant upload), que next/image ne sait pas
                // servir — seuls les chemins locaux ou remotePatterns déclarés
                // sont acceptés par son loader.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="icon-[mdi--image-outline] text-3xl text-foreground/30" />
                </div>
              )}
            </div>
            <label className="cursor-pointer text-xs font-semibold text-primary hover:underline">
              Choisir une image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <Input
              id="name"
              label="Nom du produit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Select
              id="category"
              label="Catégorie"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="Choisir une catégorie"
              options={(categories ?? []).map((c) => ({
                value: c._id,
                label: c.name,
              }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-semibold text-foreground"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="rounded-xl border border-border-subtle bg-surface px-3.5 py-2.5 text-foreground outline-none focus:border-primary"
          />
        </div>

        <VariantEditor variants={variants} onChange={setVariants} />

        <Input
          id="removable"
          label="Ingrédients retirables (séparés par des virgules)"
          value={removableIngredients}
          onChange={(e) => setRemovableIngredients(e.target.value)}
          placeholder="Oignons, Tomates, Cornichons"
        />

        {extras && extras.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Extras disponibles
            </label>
            <div className="flex flex-wrap gap-1.5">
              {extras.map((extra) => (
                <button
                  key={extra._id}
                  type="button"
                  onClick={() => toggleExtra(extra._id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedExtraIds.includes(extra._id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border-subtle text-foreground/60"
                  }`}
                >
                  {extra.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Switch
          checked={available}
          onChange={setAvailable}
          label="Produit disponible à la vente"
        />

        {error && <p className="text-sm text-accent-bordeaux">{error}</p>}
      </form>
    </Modal>
  );
}
