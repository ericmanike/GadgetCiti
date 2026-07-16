import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0 align-middle",
        className
      )}
      {...props}
    />
  );
}

export { Spinner };
