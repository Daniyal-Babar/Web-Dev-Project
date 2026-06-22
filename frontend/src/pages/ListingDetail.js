/**
 * Listing Detail Page Component
 * 
 * Displays:
 * - Full listing information
 * - Image gallery
 * - Owner information and reviews
 * - Booking calendar
 * - Booking form
 * - Similar items
 * - Reviews section (only if owner has paid account)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import BookingForm from '../components/BookingForm';
import ReviewSection from '../components/ReviewSection';
import OwnerCard from '../components/OwnerCard';
import './ListingDetail.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch listing details and reviews
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        
        // Get listing details
        const listingRes = await axios.get(`/api/listings/${id}`);
        
        // Handle different response structures
        let listingData = null;
        if (listingRes.data) {
          // Check for nested listing property
          listingData = listingRes.data.listing || listingRes.data;
          
          // If it's a success response with listing
          if (listingRes.data.success && listingRes.data.listing) {
            listingData = listingRes.data.listing;
          }
        }
        
        // Set listing if we found it
        if (listingData && (listingData._id || listingData.id || listingData.title)) {
          setListing(listingData);
          setReviewsVisible(listingRes.data?.reviewsVisible || false);

          // Get reviews if visible (non-blocking)
          if (listingRes.data?.reviewsVisible) {
            try {
              const reviewsRes = await axios.get(`/api/reviews/listing/${id}`);
              setReviews(reviewsRes.data?.reviews || reviewsRes.data || []);
            } catch (reviewError) {
              console.warn('Could not fetch reviews (non-critical):', reviewError);
              // Don't fail the whole page if reviews fail
            }
          }
        } else {
          // Only set error if we truly didn't get a listing
          console.error('Invalid listing data received:', listingRes.data);
          setError('Listing data format is invalid');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        // Extract error message from response
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to load listing details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setError('Invalid listing ID');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="loading-page">Loading listing details...</div>;
  }

  // Only show error page if we have an actual error AND no listing data
  // This allows partial data to still display
  if (error && !listing && !loading) {
    return (
      <div className="error-page">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="error-content">
            <h2>Listing Not Found</h2>
            <p>{error || 'The listing you are looking for does not exist or has been removed.'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/browse')}
            >
              Browse Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we don't have listing data yet, show loading
  if (!listing && !error) {
    return <div className="loading-page">Loading listing details...</div>;
  }

  // If we still don't have listing after loading, show error
  if (!listing) {
    return (
      <div className="error-page">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="error-content">
            <h2>Listing Not Found</h2>
            <p>{error || 'The listing you are looking for does not exist or has been removed.'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/browse')}
            >
              Browse Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="listing-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="listing-detail-content">
          {/* Image Gallery */}
          {listing.images && listing.images.length > 0 && (
            <div className="listing-gallery">
              <ImageGallery images={listing.images} />
            </div>
          )}

          <div className="listing-main">
            {/* Listing Info */}
            <section className="listing-info">
              <div className="listing-header">
                <h1>{listing.title}</h1>
                <div className="listing-meta">
                  {listing.category && <span className="category">{listing.category}</span>}
                  <span className="views">👁️ {listing.views || 0} views</span>
                </div>
              </div>

              {/* Location */}
              {listing.location && (
                <div className="listing-location">
                  <span>📍 {listing.location.address || ''}, {listing.location.city || ''}</span>
                </div>
              )}

              {/* Pricing */}
              {listing.pricing && (
                <div className="listing-pricing">
                  <h2>
                    Rs {listing.pricing.amount?.toLocaleString() || 0} 
                    {listing.pricing.pricingModel && (
                      <span className="period">/ {listing.pricing.pricingModel}</span>
                    )}
                  </h2>
                </div>
              )}

              {/* Description */}
              <div className="listing-description">
                <h3>About This Item</h3>
                <p>{listing.description}</p>
              </div>

              {/* Specifications */}
              {listing.specifications && Object.keys(listing.specifications).length > 0 && (
                <div className="specifications">
                  <h3>Details</h3>
                  <div className="specs-grid">
                    {Object.entries(listing.specifications).map(([key, value]) => (
                      <div key={key} className="spec">
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Policies */}
              {(listing.damagePolicy || listing.lostItemPolicy) && (
                <div className="safety-section">
                  <h3>Safety & Policies</h3>
                  {listing.damagePolicy && (
                    <div className="policy">
                      <strong>Damage Policy:</strong>
                      <p>{listing.damagePolicy}</p>
                    </div>
                  )}
                  {listing.lostItemPolicy && (
                    <div className="policy">
                      <strong>Lost Item Policy:</strong>
                      <p>{listing.lostItemPolicy}</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Owner Card */}
            <aside className="listing-sidebar">
              {listing.owner && <OwnerCard owner={listing.owner} />}

              {/* Booking Form */}
              <BookingForm 
                listing={listing}
                onBookingSuccess={() => navigate('/my-bookings')}
              />

              {/* Report Listing */}
              <button className="btn-report">
                Report This Listing
              </button>
            </aside>
          </div>

          {/* Reviews Section */}
          {reviewsVisible && reviews.length > 0 && (
            <section className="reviews-section">
              <h2>Customer Reviews</h2>
              <ReviewSection 
                reviews={reviews}
                listingId={id}
              />
            </section>
          )}

          {reviewsVisible && reviews.length === 0 && (
            <section className="no-reviews">
              <p>No reviews yet. Be the first to review!</p>
            </section>
          )}

          {!reviewsVisible && (
            <section className="reviews-locked">
              <p>💎 Reviews are only shown for verified, paid seller accounts</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
