// Language.js
import { useState, useEffect, useRef } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import './Language.css';

export default function Language() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const translateElementRef = useRef(null);
  const dropdownRef = useRef(null);
  const isInitialized = useRef(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
  ];

  useEffect(() => {
    // Initialize Google Translate
    const initializeTranslate = () => {
      if (translateElementRef.current && window.google && window.google.translate && !isInitialized.current) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,ur',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
        isInitialized.current = true;
      }
    };

    // Load Google Translate script if not already loaded
    if (!window.google || !window.google.translate) {
      // Define the callback function globally
      window.googleTranslateElementInit = initializeTranslate;

      // Check if script is already being loaded
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    } else {
      // If already loaded, initialize immediately
      setTimeout(initializeTranslate, 100);
    }

    // Check initial language from cookie
    const cookieLang = document.cookie.match(/googtrans=([^;]+)/);
    if (cookieLang) {
      const langCode = cookieLang[1].split('/').pop();
      if (langCode === 'ur') {
        setCurrentLang('ur');
        document.body.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ur');
      }
    }

    // Function to hide Google Translate banner
    const hideBannerElements = () => {
      // Hide banner frame
      const bannerFrame = document.querySelector('.goog-te-banner-frame');
      if (bannerFrame) {
        bannerFrame.style.display = 'none';
        bannerFrame.style.visibility = 'hidden';
        bannerFrame.style.height = '0';
        bannerFrame.style.width = '0';
        bannerFrame.style.overflow = 'hidden';
        bannerFrame.style.position = 'absolute';
        bannerFrame.style.top = '-9999px';
      }

      // Hide banner
      const banner = document.querySelector('.goog-te-banner');
      if (banner) {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
      }

      // Hide skip translate link
      const skipTranslate = document.querySelector('.skiptranslate');
      if (skipTranslate) {
        skipTranslate.style.display = 'none';
        skipTranslate.style.visibility = 'hidden';
      }

      // Remove top margin/padding that Google Translate adds
      if (document.body.style.marginTop || document.body.style.paddingTop) {
        document.body.style.marginTop = '0';
        document.body.style.paddingTop = '0';
      }

      // Hide any iframes from Google Translate (except the script loader)
      const iframes = document.querySelectorAll('iframe[src*="translate.google.com"]');
      iframes.forEach(iframe => {
        if (iframe.src && iframe.src.includes('translate.google.com') && !iframe.src.includes('element.js')) {
          iframe.style.display = 'none';
          iframe.style.visibility = 'hidden';
          iframe.style.height = '0';
          iframe.style.width = '0';
        }
      });
    };

    // Hide banner continuously
    const hideBanner = setInterval(hideBannerElements, 100);

    // Also use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(() => {
      hideBannerElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Listen for language changes from Google Translate
    const checkLanguage = setInterval(() => {
      const cookieLang = document.cookie.match(/googtrans=([^;]+)/);
      
      if (cookieLang) {
        const langCode = cookieLang[1].split('/').pop();
        if (langCode === 'ur' && currentLang !== 'ur') {
          setCurrentLang('ur');
          document.body.setAttribute('dir', 'rtl');
          document.documentElement.setAttribute('dir', 'rtl');
          document.documentElement.setAttribute('lang', 'ur');
        } else if ((langCode === 'en' || !langCode) && currentLang !== 'en') {
          setCurrentLang('en');
          document.body.setAttribute('dir', 'ltr');
          document.documentElement.setAttribute('dir', 'ltr');
          document.documentElement.setAttribute('lang', 'en');
        }
      }
    }, 500);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      clearInterval(hideBanner);
      clearInterval(checkLanguage);
      observer.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentLang, isOpen]);

  const changeLanguage = (langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    // Set Google Translate cookie
    if (langCode === 'ur') {
      document.cookie = `googtrans=/en/ur; path=/; max-age=31536000`;
    } else {
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }

    // Try to trigger Google Translate programmatically
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      // Trigger change event
      const changeEvent = new Event('change', { bubbles: true });
      select.dispatchEvent(changeEvent);
      
      // Also try clicking the select to trigger Google's handler
      setTimeout(() => {
        select.click();
        // Then select the option
        const options = select.options;
        for (let i = 0; i < options.length; i++) {
          if (options[i].value === langCode) {
            select.selectedIndex = i;
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);
            break;
          }
        }
      }, 100);
    }

    // Reload page to apply translation (Google Translate needs this)
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="icon-button language-toggle"
        aria-label="Change language"
        aria-expanded={isOpen}
        type="button"
      >
        <Languages size={22} />
        <span className="language-label">{currentLanguage.nativeName}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>
      
      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`language-option ${currentLang === lang.code ? 'active' : ''}`}
              type="button"
            >
              <span className="language-name">{lang.nativeName}</span>
              <span className="language-code">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Google Translate Element - Hidden but functional */}
      <div 
        id="google_translate_element" 
        ref={translateElementRef}
        className="google-translate-container"
      />
    </div>
  );
}

