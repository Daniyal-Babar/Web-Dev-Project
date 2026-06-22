import React from 'react';
import './WalletCard.css';

const WalletCard = ({ balance, easypaisaNumber, isVerified }) => {
  const maskNumber = (number) => {
    if (!number) return '*** **** ****';
    const str = String(number);
    return str.slice(0, 5) + '******' + str.slice(-2);
  };

  return (
    <div className="wallet-card">
      <div className="wallet-card__content">
        <div className="wallet-card__balance-section">
          <p className="wallet-card__label">Available Balance</p>
          <h2 className="wallet-card__balance">
            Rs {(balance || 0).toLocaleString()}
            <span className="wallet-card__currency">PKR</span>
          </h2>
          <p className="wallet-card__helper">
            Earnings from completed rentals
          </p>
        </div>

        <div className="wallet-card__divider"></div>

        <div className="wallet-card__easypaisa-section">
          <div className="wallet-card__easypaisa-header">
            <span className="wallet-card__easypaisa-icon">📱</span>
            <span className="wallet-card__easypaisa-label">Easypaisa Account</span>
          </div>
          
          {easypaisaNumber ? (
            <>
              <p className="wallet-card__easypaisa-number">
                {maskNumber(easypaisaNumber)}
              </p>
              <div className="wallet-card__verification">
                {isVerified ? (
                  <span className="wallet-card__badge wallet-card__badge--verified">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="wallet-card__badge wallet-card__badge--pending">
                    ⏳ Pending Verification
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="wallet-card__easypaisa-empty">
              No account linked yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
