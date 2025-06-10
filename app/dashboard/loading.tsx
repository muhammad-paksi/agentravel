import {Card, Skeleton} from "@heroui/react";

export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-1/3 rounded-lg bg-default-200" />
      <Skeleton className="h-64 w-full rounded-lg bg-default-300" />
      <Skeleton className="h-8 w-1/2 rounded-lg bg-default-200" />
    </div>
  );
}
