'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const reviewerName = review.profiles?.name || review.userName || 'Anonymous';

  return (
    <Card className="card-premium">
      <div className="flex items-start gap-4 mb-4">
        <Avatar>
          {review.profiles?.avatar_url ? (
            <AvatarImage src={review.profiles.avatar_url} alt={reviewerName} />
          ) : null}
          <AvatarFallback className="bg-primary text-white">
            {reviewerName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold">{reviewerName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{formatDate(review.created_at)}</span>
          </div>
        </div>
      </div>

      {review.review_text && (
        <p className="text-foreground leading-relaxed mb-4">{review.review_text}</p>
      )}

      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review ${index + 1}`}
              className="w-full aspect-square object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default ReviewCard;
