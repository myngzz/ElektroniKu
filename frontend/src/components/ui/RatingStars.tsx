import { Star } from'lucide-react';

interface RatingStarsProps {
 rating: number;
 maxRating?: number;
 size?:'sm' |'md' |'lg';
 interactive?: boolean;
 onChange?: (rating: number) => void;
}

export default function RatingStars({
 rating,
 maxRating = 5,
 size ='md',
 interactive = false,
 onChange,
}: RatingStarsProps) {
 const sizeClasses = {
 sm:'w-3 h-3',
 md:'w-4 h-4',
 lg:'w-6 h-6',
 };

 return (
 <div className="flex items-center gap-0.5">
 {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
 <Star
 key={star}
 className={`${sizeClasses[size]} transition-colors ${
 star <= Math.round(rating)
 ?'text-yellow-400 fill-yellow-400'
 :'text-gray-200'
 } ${interactive ?'cursor-pointer hover:text-yellow-400 hover:fill-yellow-400' :''}`}
 onClick={() => interactive && onChange?.(star)}
 />
 ))}
 </div>
 );
}
