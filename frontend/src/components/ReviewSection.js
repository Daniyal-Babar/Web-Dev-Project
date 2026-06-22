import React from 'react';

const ReviewSection = ({ reviews = [] }) => {
  if (!reviews.length) {
    return <div>No reviews yet.</div>;
  }

  return (
    <div className="reviews">
      {reviews.map((review, idx) => (
        <div key={idx} className="review">
          <p><strong>{review.author || 'Anonymous'}</strong></p>
          <p>{review.comment || review.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewSection;
