import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopLayout from '../layouts/ShopLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { productService } from '../services/endpoints';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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
    const { isAuthenticated } = useAuth();

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
        if (!isAuthenticated()) {
            toast.info("Please login to purchase items.", { position: "bottom-center" });
            navigate('/login');
            return;
        }
        if (!product.pricing?.finalPrice) {
            toast.warning("Custom quote required for this item.");
            return;
        }
        addToCart(product);
        toast.success(`🎉 Added to your bag!`, { position: "bottom-center", autoClose: 2000 });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount || 0);

    const getHeroImage = () => {
        if (filters.category === 'Earring') return 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
        if (filters.category === 'Ring') return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
        if (filters.category === 'Necklace') return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2078&q=80';
        return 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
    };

    return (
        <ShopLayout>
            <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingBottom: '60px' }}>
                {/* Modern Luxury Split Hero Banner */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    minHeight: '75vh',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', // Very soft tailwind green-50
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '60px',
                    boxShadow: '0 4px 30px rgba(0,0,0,0.03)'
                }}>
                    <div style={{
                        flex: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '0 8%',
                        zIndex: 2,
                        background: 'transparent'
                    }}>
                        <span style={{
                            color: 'var(--primary)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            fontSize: '0.85rem',
                            marginBottom: '20px',
                            display: 'block'
                        }}>
                            ✨ 2026 Collection
                        </span>
                        <h1 style={{
                            color: 'var(--text-primary)',
                            fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                            fontFamily: 'Playfair Display, serif',
                            marginBottom: '24px',
                            lineHeight: 1.1,
                            fontWeight: 600
                        }}>
                            {filters.category ? `Elegant ${filters.category}s` : 'Adorn Your True Beauty'}
                        </h1>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.15rem',
                            marginBottom: '40px',
                            maxWidth: '500px',
                            lineHeight: 1.6
                        }}>
                            Discover our exclusive, handcrafted collection of fine jewelry. From dazzling diamonds to pure gold, find the perfect piece that speaks to your soul at New Priyanka Jewellery.
                        </p>
                        <div style={{ display: 'flex' }}>
                            <button
                                style={{
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    padding: '16px 40px',
                                    borderRadius: '0',
                                    border: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.3s ease',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase'
                                }}
                                onClick={() => window.scrollTo({ top: window.innerHeight * 0.75, behavior: 'smooth' })}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-dark)'; e.currentTarget.style.paddingLeft = '50px'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.paddingLeft = '40px'; }}
                            >
                                Shop Collection <FiArrowRight />
                            </button>
                        </div>
                    </div>

                    <div style={{
                        flex: '1.2',
                        position: 'relative',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <img
                            src={getHeroImage()}
                            alt="Fine Jewelry"
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                            }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #ffffff 0%, transparent 15%)' }}></div>
                        {/* A very subtle green gradient on top to match the left side */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(240, 253, 244, 1) 0%, rgba(240, 253, 244, 0) 25%)' }}></div>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', padding: '0 8%', maxWidth: '1400px', margin: '0 auto' }}>
                        {products.length === 0 ? (
                            <div className="empty-state" style={{ gridColumn: '1/-1', padding: '100px 0', border: 'none', background: 'transparent' }}>
                                <FiShoppingBag size={48} color="#ccc" />
                                <h3 style={{ marginTop: 20, fontFamily: 'Playfair Display, serif', color: '#333' }}>Collection Not Found</h3>
                                <p style={{ color: '#666' }}>We couldn't find any pieces matching your current selection.</p>
                            </div>
                        ) : (
                            products.map((product) => (
                                <div key={product._id} style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}
                                >
                                    <div style={{ position: 'relative', height: '320px', backgroundColor: '#f9f9f9', overflow: 'hidden' }} onClick={() => { setSelectedProduct(product); setShowDetailModal(true); }}>
                                        <img
                                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=500'}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <span style={{ position: 'absolute', top: 15, left: 15, background: 'rgba(255,255,255,0.9)', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-primary)' }}>
                                            {product.category}
                                        </span>
                                    </div>
                                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <div style={{ marginBottom: '15px', flexGrow: 1 }} onClick={() => { setSelectedProduct(product); setShowDetailModal(true); }}>
                                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{product.name}</h3>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{product.material} • {product.weight}g Handcrafted</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f0f0f0' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {product.pricing ? formatCurrency(product.pricing.finalPrice) : 'By Quote'}
                                            </span>
                                            <button
                                                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                                            >
                                                <FiShoppingBag /> Add
                                            </button>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '40px', backgroundColor: '#fff' }}>
                        <div>
                            <img
                                src={selectedProduct.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=800'}
                                alt={selectedProduct.name}
                                style={{ width: '100%', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                            />
                        </div>
                        <div style={{ padding: '10px 0' }}>
                            <div style={{ marginBottom: 24 }}>
                                <small style={{ textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: 2 }}>{selectedProduct.category}</small>
                                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', marginTop: 8, color: 'var(--text-primary)' }}>{selectedProduct.name}</h1>
                                <p style={{ color: '#555', marginTop: 16, lineHeight: 1.8 }}>{selectedProduct.description || 'This masterfully crafted piece represents the pinnacle of jewelry design, combining traditional techniques with contemporary elegance.'}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15, padding: '20px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: 24, textAlign: 'center' }}>
                                <div><small style={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Metal</small><br /><strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.material}</strong></div>
                                <div><small style={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Weight</small><br /><strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.weight}g</strong></div>
                                <div><small style={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Purity</small><br /><strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.purity}%</strong></div>
                            </div>

                            <div style={{ marginBottom: 32 }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {selectedProduct.pricing ? formatCurrency(selectedProduct.pricing.finalPrice) : 'Price on Request'}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>*Inclusive of all taxes and craftsmanship</p>
                            </div>

                            <button
                                style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px', fontSize: '1rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                                onClick={() => handleAddToCart(selectedProduct)}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                            >
                                <FiShoppingBag size={20} /> Add to Shopping Bag
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </ShopLayout>
    );
};

export default CatalogPage;
