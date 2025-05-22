"use client"

import { Star, StarHalf } from "lucide-react";

interface RatingStarsProps {
    rating: number;
    size?: number;
}
  
const RatingStars = ({ rating, size = 10 }: RatingStarsProps) => {
const fullStars = Math.floor(rating);
const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

return (
    <div className="flex text-secondary" style={{ gap: 2 }}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} fill="currentColor" size={size} />
      ))}
      {hasHalfStar && <StarHalf key="half" fill="currentColor" size={size} />}
    </div>
);
};

export default RatingStars;
  