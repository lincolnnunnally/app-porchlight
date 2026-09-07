import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[transform,background-color,opacity] duration-fast ease-out-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-gold text-night hover:bg-gold-2",
        ghost:
          "border border-line bg-transparent text-ink hover:bg-panel",
        teal: "bg-teal text-night hover:opacity-90",
        danger: "border border-line text-danger hover:bg-panel",
        paper: "bg-paper text-paper-ink hover:bg-gold-2",
      },
      size: {
        sm: "min-h-10 px-3.5 text-sm",
        md: "min-h-11 px-4.5 text-sm",
        lg: "min-h-12 px-5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
