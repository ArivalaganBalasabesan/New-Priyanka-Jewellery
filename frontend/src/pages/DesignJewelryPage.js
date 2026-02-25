import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { aiService, orderService } from '../services/endpoints';
import MainLayout from '../layouts/MainLayout';
import { toast } from 'react-toastify';
import { FiDownload, FiMessageSquare, FiLoader, FiX, FiCalendar, FiEdit3, FiCheck, FiCpu, FiLayers } from 'react-icons/fi';

const DesignJewelryPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [designData, setDesignData] = useState(null);
    const [displayUrl, setDisplayUrl] = useState(null);

    // Quote Modal State
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteSubmitted, setQuoteSubmitted] = useState(false);
    const [quoteNotes, setQuoteNotes] = useState('');
    const [preferredDate, setPreferredDate] = useState('');

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${process.env.REACT_APP_API_URL}${url}`;
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setDesignData(null);
            setDisplayUrl(null);
            setQuoteSubmitted(false);
            const response = await aiService.generate(data);
            if (response.data && response.data.success) {
                const result = response.data.data;
                setDesignData(result);

                setImageLoading(true);

                const aiUrl = getImageUrl(result.generatedImageURL);
                const fallbackUrl = result.fallbackImageURL;

                const img = new Image();
                const timeout = setTimeout(() => {
                    img.src = '';
                    setDisplayUrl(fallbackUrl);
                    setImageLoading(false);
                    toast.success('Design created!');
                }, 30000);

                img.onload = () => {
                    clearTimeout(timeout);
                    setDisplayUrl(aiUrl);
                    setImageLoading(false);
                    toast.success('🎨 AI design generated!');
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    setDisplayUrl(fallbackUrl);
                    setImageLoading(false);
                    toast.success('Design created!');
                };
                img.src = aiUrl;
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate design. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestQuote = async () => {
        if (!designData) return;

        try {
            setQuoteLoading(true);
            await orderService.requestQuote({
                jewelryType: designData.jewelryType,
                metalType: designData.metalType,
                stoneType: designData.stoneType,
                prompt: designData.prompt,
                designImageUrl: displayUrl,
                specialInstructions: quoteNotes,
                preferredDate: preferredDate || undefined,
            });
            setQuoteSubmitted(true);
            toast.success('🎉 Quote request submitted! Our team will contact you soon.');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to submit quote. Please try again.');
        } finally {
            setQuoteLoading(false);
        }
    };

    // Get minimum date for the picker (tomorrow)
    const getMinDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    return (
        <MainLayout title="AI Jewelry Designer">
            <div className="ai-designer-container">
                <div className="ai-content-grid">
                    {/* Left: Design Form */}
                    <div className="ai-form-card card shadow-sm">
                        <div className="ai-card-header">
                            <FiEdit3 className="ai-header-icon" />
                            <div>
                                <h3>Create Your Vision</h3>
                                <p>Describe your perfect jewelry piece</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="ai-form">
                            <div className="form-group mb-4">
                                <label className="form-label">Jewelry Type</label>
                                <div className="ai-selection-grid">
                                    {['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Pendant'].map((type) => (
                                        <label key={type} className="ai-selector-chip">
                                            <input
                                                type="radio"
                                                value={type}
                                                {...register('jewelryType', { required: true })}
                                                defaultChecked={type === 'Ring'}
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group mb-4">
                                <label className="form-label">Metal Preference</label>
                                <div className="ai-selection-grid">
                                    {['Gold', 'Rose Gold', 'White Gold', 'Platinum', 'Silver'].map((metal) => (
                                        <label key={metal} className="ai-selector-chip">
                                            <input
                                                type="radio"
                                                value={metal}
                                                {...register('metalType', { required: true })}
                                                defaultChecked={metal === 'Gold'}
                                            />
                                            <span>{metal}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group mb-4">
                                <label className="form-label">Gemstone</label>
                                <div className="ai-selection-grid">
                                    {['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'None'].map((stone) => (
                                        <label key={stone} className="ai-selector-chip">
                                            <input
                                                type="radio"
                                                value={stone}
                                                {...register('stoneType', { required: true })}
                                                defaultChecked={stone === 'Diamond'}
                                            />
                                            <span>{stone}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Design Style & Details</label>
                                <textarea
                                    className="form-control ai-textarea"
                                    placeholder="E.g., vintage art deco with floral patterns, minimalist modern geometric, royal antique style..."
                                    rows="4"
                                    {...register('styleDescription', { required: 'Please describe your style' })}
                                ></textarea>
                                {errors.styleDescription && <span className="form-error">{errors.styleDescription.message}</span>}
                            </div>

                            <button
                                type="submit"
                                className={`ai-submit-btn ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><FiLoader className="ai-spin" /> Generating Magic...</>
                                ) : (
                                    <><FiCpu /> Generate Design</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right: Preview & Actions */}
                    <div className="ai-preview-card card shadow-sm">
                        {!displayUrl && !loading && (
                            <div className="ai-preview-empty">
                                <div className="ai-empty-icon-wrap">
                                    <FiLayers />
                                </div>
                                <h4>Ready to visualize?</h4>
                                <p>Fill in the details and our AI will craft a unique high-resolution design for you.</p>
                            </div>
                        )}

                        {(displayUrl || loading) && (
                            <div className="ai-preview-content">
                                <div className={`ai-image-container ${imageLoading ? 'image-loading' : ''}`}>
                                    {displayUrl && (
                                        <img
                                            src={displayUrl}
                                            alt="AI Generated Jewelry"
                                            className="ai-generated-image"
                                            onError={(e) => {
                                                if (designData?.fallbackImageURL && e.target.src !== designData.fallbackImageURL) {
                                                    e.target.src = designData.fallbackImageURL;
                                                }
                                            }}
                                        />
                                    )}
                                    {imageLoading && (
                                        <div className="ai-image-overlay">
                                            <div className="ai-pulse-ring"></div>
                                            <p>Optimizing visuals...</p>
                                        </div>
                                    )}
                                </div>

                                {designData && !imageLoading && (
                                    <div className="ai-result-actions fade-in">
                                        <div className="ai-result-info">
                                            <h4>{designData.jewelryType}</h4>
                                            <p>{designData.metalType} • {designData.stoneType}</p>
                                        </div>
                                        <div className="ai-button-group">
                                            <a
                                                href={displayUrl}
                                                download={`jewelry-design-${Date.now()}.jpg`}
                                                className="ai-action-btn ai-download-btn"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FiDownload /> Save Design
                                            </a>
                                            <button
                                                onClick={() => setShowQuoteModal(true)}
                                                className={`ai-action-btn ai-quote-btn ${quoteSubmitted ? 'success' : ''}`}
                                                disabled={quoteSubmitted}
                                            >
                                                {quoteSubmitted ? (
                                                    <><FiCheck /> Quote Requested</>
                                                ) : (
                                                    <><FiMessageSquare /> Request Quote</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quote Request Modal */}
            {showQuoteModal && (
                <div className="quote-modal-overlay" onClick={() => setShowQuoteModal(false)}>
                    <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="quote-modal-header">
                            <h3>📋 Request a Quote</h3>
                            <button className="quote-close-btn" onClick={() => setShowQuoteModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="quote-modal-body">
                            {/* Design Summary */}
                            <div className="quote-design-summary">
                                <div className="quote-design-thumb">
                                    <img src={displayUrl} alt="Design" />
                                </div>
                                <div className="quote-design-details">
                                    <h4>{designData?.jewelryType} — {designData?.metalType}</h4>
                                    <p>Gemstone: {designData?.stoneType}</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="quote-form-group">
                                <label><FiCalendar /> Preferred Delivery Date</label>
                                <input
                                    type="date"
                                    className="quote-input"
                                    min={getMinDate()}
                                    value={preferredDate}
                                    onChange={(e) => setPreferredDate(e.target.value)}
                                />
                                <span className="quote-hint">Leave blank for standard delivery (~14 days)</span>
                            </div>

                            <div className="quote-form-group">
                                <label><FiEdit3 /> Special Instructions</label>
                                <textarea
                                    className="quote-textarea"
                                    rows="3"
                                    placeholder="Any specific requirements, ring size, chain length, engraving text, etc."
                                    value={quoteNotes}
                                    onChange={(e) => setQuoteNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="quote-info-box">
                                <p>💡 Our team will review your design and send you a detailed quote with pricing. You'll be contacted via email.</p>
                            </div>
                        </div>

                        <div className="quote-modal-footer">
                            <button
                                className="quote-cancel-btn"
                                onClick={() => setShowQuoteModal(false)}
                                disabled={quoteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="quote-submit-btn"
                                onClick={handleRequestQuote}
                                disabled={quoteLoading}
                            >
                                {quoteLoading ? (
                                    <><FiLoader className="ai-spin" /> Submitting...</>
                                ) : (
                                    <>📨 Submit Quote Request</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default DesignJewelryPage;
