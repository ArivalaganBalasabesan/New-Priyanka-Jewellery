import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiXCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

const PaymentCancelPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="payment-page">
            <div className="payment-card payment-cancel-card">
                {/* Cancel Icon */}
                <div className="payment-icon payment-icon-cancel">
                    <FiXCircle />
                </div>

                <h2>Payment Cancelled</h2>
                <p className="payment-subtitle">
                    Your payment was not completed. Don't worry — no charges were made to your account.
                </p>

                {/* Info */}
                <div className="payment-info-box">
                    <p>💡 Your order is still saved. You can try paying again from your dashboard whenever you're ready.</p>
                </div>

                {/* Actions */}
                <div className="payment-actions">
                    <Link to="/user-dashboard" className="payment-btn payment-btn-primary">
                        <FiArrowLeft /> Back to Dashboard
                    </Link>
                    <Link to="/ai-design" className="payment-btn payment-btn-secondary">
                        <FiRefreshCw /> Design New Jewelry
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelPage;
