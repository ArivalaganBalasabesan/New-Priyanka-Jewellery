import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { productService } from '../services/endpoints';
import { useCart } from '../context/CartContext';
import { FiSearch, FiShoppingBag, FiInfo, FiPlus, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const CatalogPage = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ category: '', material: '' });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const navigate = useNavigate();
    const { loading, execute } = useApi();
    const { addToCart } = useCart();

    useEffect(() => {
        loadProducts();
    }, [search, filters]);

    const loadProducts = async () => {
        try {
            const params = { status: 'active', search };
            if (filters.category) params.category = filters.category;
            if (filters.material) params.material = filters.material;

            const data = await execute(() => productService.getAll(params));
            setProducts(data.data || []);
        } catch (err) { console.error(err); }
    };

    const handleAddToCart = (product) => {
        if (!product.pricing?.finalPrice) {
            toast.warning("Custom quote required for this item.");
            return;
        }
        addToCart(product);
        toast.success(`🎉 Added to your bag!`, { position: "bottom-center", autoClose: 2000 });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

    const getHeroImage = () => {
        if (filters.category === 'Earring') return 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200';
        if (filters.category === 'Ring') return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200';
        return 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=1200';
    };

    return (
        <MainLayout title="Collections">
            <div className="premium-catalog fade-in">
                {/* Luxury Hero Banner */}
                <div className="catalog-hero-banner" style={{
                    backgroundImage: `url(${getHeroImage()})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <span className="product-badge-luxury" style={{ position: 'relative', top: 0, left: 0, marginBottom: 16, display: 'inline-block' }}>
                            Limited Collection
                        </span>
                        <h1>{filters.category ? `${filters.category}s` : 'The Signature Collection'}</h1>
                        <p>Exquisite craftsmanship meets timeless design. Discover pieces that tell your story with elegance and grace.</p>
                        <button className="btn btn-primary" style={{ padding: '14px 30px' }} onClick={() => setSearch('')}>
                            Explore All <FiArrowRight style={{ marginLeft: 8 }} />
                        </button>
                    </div>
                </div>

                {/* Refined Filter Bar */}
                <div className="card catalog-filters" style={{ marginBottom: 40, border: 'none', background: 'var(--bg-tertiary)' }}>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', padding: '10px' }}>
                        <div className="search-bar" style={{ flex: 1, minWidth: '280px', background: '#fff' }}>
                            <FiSearch />
                            <input
                                placeholder="Search by name, gemstone or collection..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <select className="form-control" style={{ width: 170, borderRadius: '30px' }}
                                value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                                <option value="">All Categories</option>
                                {['Ring', 'Necklace', 'Bracelet', 'Earring', 'Pendant', 'Bangle', 'Chain'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <select className="form-control" style={{ width: 150, borderRadius: '30px' }}
                                value={filters.material} onChange={(e) => setFilters({ ...filters, material: e.target.value })}>
                                <option value="">All Metals</option>
                                <option value="gold">Yellow Gold</option>
                                <option value="silver">Pure Silver</option>
                                <option value="platinum">Platinum</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Luxury Grid */}
                {loading && products.length === 0 ? <LoadingSpinner /> : (
                    <div className="luxury-grid">
                        {products.length === 0 ? (
                            <div className="empty-state" style={{ gridColumn: '1/-1', padding: '100px 0' }}>
                                <FiShoppingBag size={48} color="var(--text-muted)" />
                                <h3 style={{ marginTop: 20 }}>Collection Not Found</h3>
                                <p>We couldn't find any pieces matching your current selection.</p>
                            </div>
                        ) : (
                            products.map((product) => (
                                <div key={product._id} className="product-card-premium shadow-hover">
                                    <div className="product-image-container">
                                        <img
                                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=500'}
                                            alt={product.name}
                                        />
                                        <span className="product-badge-luxury">{product.category}</span>
                                        <div className="product-overlay-actions">
                                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleAddToCart(product)}>
                                                <FiPlus /> Add to Bag
                                            </button>
                                            <button className="quick-view-btn" onClick={() => { setSelectedProduct(product); setShowDetailModal(true); }}>
                                                <FiInfo />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="product-details-luxury">
                                        <div>
                                            <h3>{product.name}</h3>
                                            <div className="luxury-meta">{product.material} • {product.weight}g Handcrafted</div>
                                        </div>
                                        <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="product-price-luxury">
                                                {product.pricing ? formatCurrency(product.pricing.finalPrice) : 'By Quote'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Premium Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="" size="lg">
                {selectedProduct && (
                    <div className="luxury-detail-view" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }}>
                        <div className="detail-image-gallery">
                            <img
                                src={selectedProduct.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=800'}
                                alt={selectedProduct.name}
                                style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                            />
                        </div>
                        <div className="detail-info-premium">
                            <div style={{ marginBottom: 24 }}>
                                <small style={{ textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: 2 }}>{selectedProduct.category}</small>
                                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginTop: 8 }}>{selectedProduct.name}</h1>
                                <p style={{ color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.8 }}>{selectedProduct.description || 'This masterfully crafted piece represents the pinnacle of jewelry design, combining traditional techniques with contemporary elegance.'}</p>
                            </div>

                            <div className="detail-specs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15, padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
                                <div><small>Metal</small><br /><strong>{selectedProduct.material}</strong></div>
                                <div><small>Weight</small><br /><strong>{selectedProduct.weight}g</strong></div>
                                <div><small>Purity</small><br /><strong>{selectedProduct.purity}%</strong></div>
                            </div>

                            <div className="price-box-premium" style={{ marginBottom: 32 }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                                    {selectedProduct.pricing ? formatCurrency(selectedProduct.pricing.finalPrice) : 'Price on Request'}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>*Inclusive of all taxes and craftsmanship</p>
                            </div>

                            <div style={{ display: 'flex', gap: 15 }}>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '16px' }} onClick={() => handleAddToCart(selectedProduct)}>
                                    Add to Shopping Bag
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '0 20px' }}>
                                    <FiShoppingBag />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </MainLayout >
    );
};

export default CatalogPage;
