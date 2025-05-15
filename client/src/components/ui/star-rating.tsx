import { Star } from "lucide-react";

export interface StarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function StarRating({
  value = 0,
  max = 5,
  size = "md",
  readonly = true,
  onChange,
  className = "",
}: StarRatingProps) {
  // Size mapping
  const sizeMap = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Generate stars
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const isFilled = i <= value;
    stars.push(
      <Star
        key={i}
        className={`${sizeMap[size]} ${
          isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        } ${!readonly ? "cursor-pointer" : ""} transition-colors`}
        onClick={() => {
          if (!readonly && onChange) {
            onChange(i);
          }
        }}
        data-rating={i}
      />
    );
  }

  return (
    <div className={`flex ${className}`}>
      {stars}
    </div>
  );
}