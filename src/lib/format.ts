// Dinar algérien : pas de devise Intl standard fiable partout, on formate à la main.
export function formatDA(value: number): string {
  return `${value.toLocaleString("fr-FR")} DA`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
