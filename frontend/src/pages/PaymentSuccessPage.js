import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/endpoints';
import { FiCheckCircle, FiClock, FiArrowLeft, FiPackage, FiAlertTriangle } from 'react-icons/fi';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');

    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setError('No payment session found');
                setLoading(false);
                return;
            }

            try {
                const response = await paymentService.verifyPayment(sessionId);
                if (response.data?.success) {
                    setPaymentData(response.data.data);
                } else {
                    setError('Payment verification failed');
                }
            } catch (err) {
                console.error(err);
                setError('Could not verify payment. Please contact support.');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="payment-page">
                <div className="payment-card">
                    <div className="payment-loading">
                        <div className="ai-loading-ring"></div>
                        <h3>Verifying your payment...</h3>
                        <p>Please wait while we confirm your transaction</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-page">
                <div className="payment-card payment-error-card">
                    <div className="payment-icon payment-icon-warning">
                        <FiAlertTriangle />
                    </div>
                    <h2>Payment Verification Issue</h2>
                    <p className="payment-detail">{error}</p>
                    <Link to="/user-dashboard" className="payment-btn payment-btn-primary">
                        <FiArrowLeft /> Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="payment-card payment-success-card">
                {/* Success Animation */}
                <div className="payment-icon payment-icon-success">
                    <FiCheckCircle />
                </div>

                <h2>Payment Successful! 🎉</h2>
                <p className="payment-subtitle">Your order has been confirmed and is now being processed</p>

                {/* Payment Details */}
                <div className="payment-details-box">
                    <div className="payment-detail-row">
                        <span className="payment-label">Order Number</span>
                        <span className="payment-value payment-value-highlight">{paymentData?.orderNumber || '—'}</span>
                    </div>
                    <div className="payment-detail-row">
                        <span className="payment-label">Amount Paid</span>
                        <span className="payment-value payment-value-amount">
                            ₹{paymentData?.amountPaid?.toLocaleString('en-IN') || '0'}
                        </span>
                    </div>
                    <div className="payment-detail-row">
                        <span className="payment-label">Status</span>
                        <span className="payment-badge payment-badge-success">
                            <FiCheckCircle /> Paid
                        </span>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="payment-next-steps">
                    <h4><FiClock /> What happens next?</h4>
                    <ul>
                        <li>Our artisans will begin crafting your custom jewelry</li>
                        <li>You'll receive email updates on your order progress</li>
                        <li>Track your order status in your dashboard</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="payment-actions">
                    <Link to="/user-dashboard" className="payment-btn payment-btn-primary">
                        <FiPackage /> View My Orders
                    </Link>
                    <Link to="/ai-design" className="payment-btn payment-btn-secondary">
                        Design Another Piece
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
