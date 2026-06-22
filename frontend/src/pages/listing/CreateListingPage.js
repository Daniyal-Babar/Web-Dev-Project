/**
 * CreateListingPage - Main component for creating rental listings
 * Manages multi-step wizard state, form data, and auto-save functionality
 * Mobile-first responsive design with live preview on larger screens
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepProgress from './components/StepProgress';
import CategoryStep from './components/CategoryStep';
import DetailsStep from './components/DetailsStep';
import PricingStep from './components/PricingStep';
import MediaStep from './components/MediaStep';
import LocationStep from './components/LocationStep';
import ListingPreview from './components/ListingPreview';
import './CreateListingPage.css';

const STEPS = [
  { id: 1, name: 'Category', component: CategoryStep },
  { id: 2, name: 'Details', component: DetailsStep },
  { id: 3, name: 'Pricing', component: PricingStep },
  { id: 4, name: 'Photos', component: MediaStep },
  { id: 5, name: 'Location', component: LocationStep }
];

const CreateListingPage = () => {
  // Current step state (1-5)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Main form data state
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    details: {},
    price: '',
    priceUnit: 'day',
    securityDeposit: 0,
    availability: [],
    images: [],
    coverImageIndex: 0,
    location: {
      address: '',
      city: '',
      coordinates: { lat: null, lng: null }
    },
    rules: [],
    damagePolicy: '',
    lostItemPolicy: ''
  });

  // Validation errors for current step
  const [errors, setErrors] = useState({});
  
  // Draft save status
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'

  /**
   * Load draft from localStorage on component mount
   */
  useEffect(() => {
    const savedDraft = localStorage.getItem('listingDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => parsed.formData || prev);
        setCurrentStep(parsed.currentStep || 1);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Auto-save draft to localStorage whenever formData changes
   * Debounced to prevent excessive saves
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('listingDraft', JSON.stringify({
          formData,
          currentStep,
          lastSaved: new Date().toISOString()
        }));
        setSaveStatus('saved');
      } catch (error) {
        console.error('Error saving draft:', error);
        setSaveStatus('error');
      }
    }, 1000);

    setSaveStatus('saving');
    return () => clearTimeout(timer);
  }, [formData, currentStep]);

  /**
   * Update form data for specific field
   */
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Validate current step before proceeding
   */
  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1: // Category
        if (!formData.category) {
          newErrors.category = 'Please select a category';
        }
        break;
      
      case 2: // Details
        if (!formData.title || formData.title.trim().length < 3) {
          newErrors.title = 'Title must be at least 3 characters';
        }
        if (!formData.description || formData.description.trim().length < 20) {
          newErrors.description = 'Description must be at least 20 characters';
        }
        break;
      
      case 3: // Pricing
        if (!formData.price || parseFloat(formData.price) <= 0) {
          newErrors.price = 'Please enter a valid price';
        }
        break;
      
      case 4: // Media
        if (formData.images.length === 0) {
          newErrors.images = 'Please upload at least one photo';
        }
        break;
      
      case 5: // Location
        if (!formData.location.address) {
          newErrors.location = 'Please enter a location';
        }
        if (!formData.damagePolicy || formData.damagePolicy.trim().length < 10) {
          newErrors.damagePolicy = 'Please provide a damage policy (at least 10 characters)';
        }
        if (!formData.lostItemPolicy || formData.lostItemPolicy.trim().length < 10) {
          newErrors.lostItemPolicy = 'Please provide a lost item policy (at least 10 characters)';
        }
        break;
      
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Navigate to next step
   */
  const handleNext = () => {
    if (validateStep() && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Navigate to previous step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Save listing as draft (server-side)
   */
  const handleSaveDraft = async () => {
    try {
      setSaveStatus('saving');
      const response = await fetch('http://localhost:5000/api/listings/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, isDraft: true })
      });

      if (response.ok) {
        setSaveStatus('saved');
        alert('Draft saved successfully!');
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('error');
      alert('Error saving draft. Please try again.');
    }
  };

  /**
   * Publish listing (final submission)
   */
  const handlePublish = async () => {
    if (!validateStep()) return;

    // Debug: Log current formData state
    console.log('Current formData before publish:', {
      damagePolicy: formData.damagePolicy ? `${formData.damagePolicy.substring(0, 30)}...` : 'MISSING',
      lostItemPolicy: formData.lostItemPolicy ? `${formData.lostItemPolicy.substring(0, 30)}...` : 'MISSING',
      damagePolicyLength: formData.damagePolicy?.length || 0,
      lostItemPolicyLength: formData.lostItemPolicy?.length || 0
    });

    // Validate all required fields before transforming
    if (!formData.category || !formData.title || !formData.description || 
        !formData.price || !formData.location.address || formData.images.length === 0) {
      alert('Please complete all required fields before publishing.');
      return;
    }

    // Validate policy fields - check for existence and minimum length
    const damagePolicyTrimmed = (formData.damagePolicy || '').trim();
    const lostItemPolicyTrimmed = (formData.lostItemPolicy || '').trim();

    if (!damagePolicyTrimmed || damagePolicyTrimmed.length < 10) {
      alert(`Please provide a damage policy (at least 10 characters). Current length: ${damagePolicyTrimmed.length}`);
      setCurrentStep(5); // Go to location step
      setErrors({ damagePolicy: 'Please provide a damage policy (at least 10 characters)' });
      return;
    }

    if (!lostItemPolicyTrimmed || lostItemPolicyTrimmed.length < 10) {
      alert(`Please provide a lost item policy (at least 10 characters). Current length: ${lostItemPolicyTrimmed.length}`);
      setCurrentStep(5); // Go to location step
      setErrors({ lostItemPolicy: 'Please provide a lost item policy (at least 10 characters)' });
      return;
    }

    try {
      // Transform frontend data format to match backend schema
      const transformedData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategory: formData.category, // Use category as subCategory for now, can be enhanced later
        // Transform pricing
        pricing: {
          amount: parseFloat(formData.price),
          currency: 'PKR',
          pricingModel: formData.priceUnit === 'day' ? 'daily' : 
                       formData.priceUnit === 'hour' ? 'hourly' :
                       formData.priceUnit === 'week' ? 'weekly' :
                       formData.priceUnit === 'month' ? 'monthly' : 'daily'
        },
        // Transform specifications (from details)
        specifications: formData.details || {},
        // Transform images - store base64 data URLs directly in database
        images: formData.images.map((img, index) => {
          // Use preview (base64 data URL) if available, otherwise use existing URL
          const imageUrl = img.preview || img.url || '';
          
          // Log image info for debugging
          if (imageUrl) {
            const isBase64 = imageUrl.startsWith('data:image/');
            console.log(`Image ${index}: ${isBase64 ? 'Base64' : 'URL'}, length: ${imageUrl.length}`);
          } else {
            console.warn(`Image ${index} has no URL or preview`);
          }
          
          return {
            url: imageUrl,
            publicId: img.publicId || `listing-${Date.now()}-${index}`,
            uploadedAt: new Date()
          };
        }),
        // Transform location
        location: {
          address: formData.location.address,
          city: formData.location.city || 'Unknown',
          province: formData.location.province || 'Unknown',
          coordinates: formData.location.coordinates.lng && formData.location.coordinates.lat
            ? [formData.location.coordinates.lng, formData.location.coordinates.lat]
            : [0, 0], // [longitude, latitude]
          serviceRadius: 10
        },
        // Transform availability (set default dates if not provided)
        availability: {
          availableFrom: formData.availability?.availableFrom || new Date(),
          availableUntil: formData.availability?.availableUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          bookedDates: []
        },
        // Add required safety policies - use the trimmed values we validated
        damagePolicy: damagePolicyTrimmed,
        lostItemPolicy: lostItemPolicyTrimmed
      };

      // Debug: Log the data being sent (full policies for debugging)
      console.log('Publishing listing - transformedData:', {
        title: transformedData.title,
        category: transformedData.category,
        damagePolicy: transformedData.damagePolicy,
        lostItemPolicy: transformedData.lostItemPolicy,
        damagePolicyLength: transformedData.damagePolicy.length,
        lostItemPolicyLength: transformedData.lostItemPolicy.length,
        images: transformedData.images.length + ' images'
      });

      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transformedData)
      });

      const responseData = await response.json();

      if (response.ok) {
        localStorage.removeItem('listingDraft');
        alert('Listing published successfully!');
        // Redirect to homepage
        window.location.href = '/';
      } else {
        // Show actual error message from backend
        const errorMessage = responseData.message || 'Failed to publish listing';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error publishing listing:', error);
      alert(`Error publishing listing: ${error.message || 'Please try again.'}`);
    }
  };

  // Get current step component
  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="create-listing-page">
      {/* Header with step progress */}
      <div className="listing-header">
        <div className="container">
          <h1>List Your Item for Rent</h1>
          <StepProgress 
            steps={STEPS} 
            currentStep={currentStep}
            onStepClick={(step) => {
              // Allow clicking on completed steps
              if (step < currentStep) {
                setCurrentStep(step);
              }
            }}
          />
          
          {/* Draft save status indicator */}
          <div className={`save-status save-status--${saveStatus}`}>
            {saveStatus === 'saving' && '💾 Saving...'}
            {saveStatus === 'saved' && '✓ Draft saved'}
            {saveStatus === 'error' && '⚠ Save failed'}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="listing-content">
        <div className="container">
          <div className="listing-grid">
            
            {/* Step content with animation */}
            <div className="step-container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="step-content"
                >
                  <CurrentStepComponent
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                    onNext={handleNext}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="step-navigation">
                {currentStep > 1 && (
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleBack}
                  >
                    ← Back
                  </button>
                )}
                
                <div className="nav-right">
                  {currentStep < STEPS.length ? (
                    <>
                      <button 
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleSaveDraft}
                      >
                        Save Draft
                      </button>
                      <button 
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNext}
                      >
                        Next →
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleSaveDraft}
                      >
                        Save Draft
                      </button>
                      <button 
                        type="button"
                        className="btn btn-success"
                        onClick={handlePublish}
                      >
                        🎉 Publish Listing
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Live preview - tablet and desktop only */}
            <div className="preview-container">
              <ListingPreview formData={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;

