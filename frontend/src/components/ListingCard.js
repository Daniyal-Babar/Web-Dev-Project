import React from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

const ListingCard = ({ listing }) => {
  if (!listing) return null;

  // Get listing ID - MongoDB uses _id, but sometimes it's returned as id
  const listingId = listing._id || listing.id;
  
  // Don't render link if no valid ID
  if (!listingId) {
    console.warn('ListingCard: Listing missing ID', listing);
  }

  // Derive a safe image URL for the cover/thumbnail
  const getImageUrl = (listing) => {
    const placeholder = 'https://via.placeholder.com/300x200?text=Listing';

    if (!listing) return placeholder;

    // Prefer an explicit cover / thumbnail field if it exists
    if (listing.coverImage) return listing.coverImage;
    if (listing.thumbnail) return listing.thumbnail;

    const images = listing.images;
    if (!Array.isArray(images) || images.length === 0) {
      return placeholder;
    }

    const firstImage = images[0];

    // New schema: image objects with a url field
    if (firstImage && typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }

    // Legacy / simple case: array of URL strings (including data URLs)
    if (typeof firstImage === 'string') {
      // Guard against accidentally stringified objects like "[object Object]"
      if (firstImage.startsWith('http') || firstImage.startsWith('data:image/')) {
        return firstImage;
      }
      return placeholder;
    }

    return placeholder;
  };

  return (
    <div className="listing-card">
      <div className="listing-card__media">
        <img
          src={getImageUrl(listing)}
          alt={listing.title}
        />
      </div>
      <div className="listing-card__body">
        <h3>{listing.title}</h3>
        <p className="listing-card__meta">{listing.category} · {listing.location?.city}</p>
        <p className="listing-card__price">Rs {listing.pricing?.amount || 0}</p>
        {listingId ? (
          <Link to={`/listing/${listingId}`}>View Details</Link>
        ) : (
          <span className="listing-card__disabled">View Details (Unavailable)</span>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
