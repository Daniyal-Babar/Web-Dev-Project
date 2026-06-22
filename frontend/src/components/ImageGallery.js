import React from 'react';

const ImageGallery = ({ images = [] }) => {
  if (!images.length) {
    return <div className="image-gallery">No images available.</div>;
  }

  // Handle images as array of objects or array of strings
  const getImageUrl = (image) => {
    return typeof image === 'object' ? image.url : image;
  };

  return (
    <div className="image-gallery">
      {images.map((image, idx) => (
        <img key={idx} src={getImageUrl(image)} alt={`Listing ${idx + 1}`} />
      ))}
    </div>
  );
};

export default ImageGallery;
