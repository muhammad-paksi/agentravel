import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // "animate-pulse", // Dihapus jika animasi CSS 'pulse' sudah digabungkan di .blinking-glass-skeleton
        "rounded-md",
        "blinking-glass-skeleton", // Terapkan kelas glassmorphism berkedip di sini
        className // className dari props tetap di akhir untuk override jika perlu
      )}
      {...props}
    />
  );
}

export { Skeleton };