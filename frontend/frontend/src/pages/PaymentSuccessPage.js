import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/endpoints';
import { FiCheckCircle, FiClock, FiArrowLeft, FiPackage, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
                    setError('Payment verification failed. Please contact support.');
                }
            } catch (err) {
                console.error(err);
                const message = err.response?.data?.message || 'Could not verify payment. Please contact support.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    const downloadBill = () => {
        if (!paymentData) return;

        const doc = new jsPDF();

        // Logo and Header
        doc.setFontSize(22);
        doc.setTextColor(212, 175, 55); // Gold color
        doc.text("New Priyanka Jewellery", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("123 Gold Market, Jewelry District", 14, 28);
        doc.text("Cityville, State 12345", 14, 33);
        doc.text("Phone: +91 98765 43210 | Email: contact@priyankajewellery.com", 14, 38);

        // Bill Title
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text("PAYMENT RECEIPT", 14, 50);

        // Customer & Order Info
        doc.setFontSize(11);
        doc.text(`Receipt No: REC-${paymentData.type === 'order' ? paymentData.orderNumber : paymentData.saleId.slice(-6).toUpperCase()}`, 14, 60);
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 66);

        const customerName = paymentData.type === 'order' ? paymentData.order?.customerId?.name : paymentData.sale?.customerId?.name;
        doc.text(`Customer Name: ${customerName || 'Valued Customer'}`, 120, 60);
        doc.text(`Status: PAID`, 120, 66);

        // Table Data
        let tableBody = [];
        if (paymentData.type === 'order') {
            const order = paymentData.order || {};
            tableBody.push([
                `Custom Order: ${order.orderNumber || paymentData.orderNumber}`,
                order.material || 'N/A',
                "1",
                `Rs. ${paymentData.amountPaid.toLocaleString('en-IN')}`,
                `Rs. ${paymentData.amountPaid.toLocaleString('en-IN')}`
            ]);
        } else if (paymentData.type === 'cart' && paymentData.sale) {
            paymentData.sale.items.forEach(item => {
                tableBody.push([
                    item.productName,
                    '-',
                    item.quantity.toString(),
                    `Rs. ${item.unitPrice.toLocaleString('en-IN')}`,
                    `Rs. ${item.itemTotal.toLocaleString('en-IN')}`
                ]);
            });
        }

        autoTable(doc, {
            startY: 75,
            head: [['Description', 'Material/Details', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            headStyles: { fillColor: [212, 175, 55], textColor: 255 },
            theme: 'grid'
        });

        // Totals
        const finalY = doc.lastAutoTable?.finalY || 100;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total Amount Paid: Rs. ${paymentData.amountPaid.toLocaleString('en-IN')}`, 14, finalY + 15);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Thank you for shopping with New Priyanka Jewellery!", 105, 280, { align: 'center' });
        doc.text("This is a computer-generated receipt and does not require a signature.", 105, 285, { align: 'center' });

        doc.save(`Receipt_${paymentData.type === 'order' ? paymentData.orderNumber : paymentData.saleId.slice(-6)}.pdf`);
    };

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
                        <span className="payment-label">Order/Receipt ID</span>
                        <span className="payment-value payment-value-highlight">
                            {paymentData?.type === 'order' ? paymentData?.orderNumber : paymentData?.saleId?.slice(-8).toUpperCase() || '—'}
                        </span>
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
                        <li>We'll carefully prepare your item(s) for delivery or crafting</li>
                        <li>You'll receive email updates containing tracking information</li>
                        <li>Track your order status anytime from your personalized dashboard</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="payment-actions">
                    <button onClick={downloadBill} className="payment-btn payment-btn-primary">
                        <FiDownload /> Download Bill
                    </button>
                    <Link to="/user-dashboard" className="payment-btn payment-btn-secondary">
                        <FiPackage /> Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
