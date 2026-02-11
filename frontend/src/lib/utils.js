import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getDaysLeft = (targetDate) => {
  if (!targetDate) return 0;
  
  const end = new Date(targetDate);
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diff = end - now;
  
  // If date has passed, return 0
  if (diff <= 0) return 0;
  
  // Convert to days and round up (so 1.5 days shows as "2 days left")
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
