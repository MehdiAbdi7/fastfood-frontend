"use client";

import { useState } from "react";
import { UserFormModal } from "@/components/users/UserFormModal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "@/features/auth/authApi";
import { useAuth } from "@/features/auth/useAuth";
import { useToast } from "@/features/toast/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { STORE_LABELS } from "@/types/store";
import type { User } from "@/types/user";

// La restriction admin vit désormais dans (dashboard)/utilisateurs/layout.tsx,
// donc côté serveur : le HTML de cette page n'est jamais envoyé à un employé.
export default function UtilisateursPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const toast = useToast();

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  async function handleDelete() {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser._id).unwrap();
      toast.success("Compte supprimé");
      setDeletingUser(null);
    } catch (err) {
      // Le backend refuse : suppression de soi-même, ou dernier admin restant
      toast.error(getApiErrorMessage(err, "Impossible de supprimer ce compte"));
    }
  }

  if (isLoading) return <SkeletonGrid count={6} />;

  if (isError) {
    return (
      <EmptyState
        icon="icon-[mdi--cloud-off-outline]"
        title="Impossible de charger l'équipe"
        description="Vérifie ta connexion, puis recharge la page."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          icon="icon-[mdi--account-plus-outline]"
          onClick={() => setIsCreating(true)}
        >
          Nouveau compte
        </Button>
      </div>

      {!users || users.length === 0 ? (
        <EmptyState icon="icon-[mdi--account-group-outline]" title="Aucun compte" />
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => {
            const isSelf = user._id === currentUser?._id;
            return (
              <div
                key={user._id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-heading text-sm font-bold text-primary">
                    {user.firstname[0]}
                    {user.lastname[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {user.firstname} {user.lastname}
                      {isSelf && (
                        <span className="ml-1.5 text-xs text-foreground/40">
                          (vous)
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      user.role === "admin"
                        ? "bg-accent-mustard/15 text-accent-mustard"
                        : "bg-accent-green/15 text-accent-green"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "Employé"}
                  </span>
                  {user.store && (
                    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground/60">
                      {STORE_LABELS[user.store]}
                    </span>
                  )}

                  <button
                    onClick={() => setEditingUser(user)}
                    aria-label="Modifier"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 hover:bg-surface-2 hover:text-foreground"
                  >
                    <span className="icon-[mdi--pencil-outline] text-base" />
                  </button>
                  {!isSelf && (
                    <button
                      onClick={() => setDeletingUser(user)}
                      aria-label="Supprimer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 hover:bg-accent-bordeaux/10 hover:text-accent-bordeaux"
                    >
                      <span className="icon-[mdi--trash-can-outline] text-base" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UserFormModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        user={null}
      />
      <UserFormModal
        isOpen={editingUser !== null}
        onClose={() => setEditingUser(null)}
        user={editingUser}
      />
      <ConfirmDialog
        isOpen={deletingUser !== null}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title={`Supprimer le compte de ${deletingUser?.firstname} ?`}
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
