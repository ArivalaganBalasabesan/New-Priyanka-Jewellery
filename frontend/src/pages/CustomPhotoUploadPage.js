import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { orderService } from '../services/endpoints';
import MainLayout from '../layouts/MainLayout';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiImage, FiSettings, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const CustomPhotoUploadPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [base64Image, setBase64Image] = useState('');
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));

            const reader = new FileReader();
            reader.onloadend = () => {
                setBase64Image(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        if (!base64Image) {
            toast.error("Please upload an image of the jewelry piece!");
            return;
        }

        try {
            setLoading(true);

            // Step 1: Securely upload the image to the local server
            const uploadRes = await orderService.uploadCustomImage({ base64Image });
            const savedImageUrl = uploadRes.data.url || uploadRes.data.data?.url;

            // Step 2: Submit the exact details to Admin Queue
            await orderService.requestQuote({
                jewelryType: data.jewelryType,
                metalType: data.metalType,
                stoneType: data.stoneType,
                specialInstructions: data.specialInstructions,
                designImageUrl: savedImageUrl,
                prompt: 'Custom Client Photo Upload' // Distinct flag
            });

            toast.success("Details successfully sumbitted to the Admin Team for Pricing!");
            setTimeout(() => {
                navigate('/user-dashboard');
            }, 2000);

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to submit quote. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout title="Upload Custom Design">
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
                <div className="card shadow-sm" style={{ padding: '30px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: 60, height: 60, margin: '0 auto 15px',
                            background: 'var(--primary-light)', color: 'var(--primary)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem'
                        }}>
                            <FiImage />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>Submit Your Exact Design</h2>
                        <p className="text-muted">
                            Upload a photo of a specific jewelry piece you want us to craft in real life. Our expert administrators will review the photo and provide an exact quotation.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* 1. File Upload Dropzone */}
                        <div className="form-group mb-4">
                            <label className="form-label" style={{ fontWeight: 600 }}>1. Upload Reference Photo</label>
                            <div style={{
                                border: '2px dashed var(--border)', borderRadius: '12px',
                                padding: '40px 20px', textAlign: 'center', background: 'var(--bg-secondary)',
                                cursor: 'pointer', position: 'relative'
                            }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        opacity: 0, cursor: 'pointer'
                                    }}
                                />
                                {previewImage ? (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }} />
                                        <p style={{ marginTop: '15px', color: 'var(--primary)', fontWeight: 600 }}>
                                            <FiUploadCloud /> Click to change image
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <FiUploadCloud style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }} />
                                        <h5>Drag and drop an image, or click to browse</h5>
                                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Supports JPG, PNG, WEBP (Max 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Specs */}
                        <div className="row">
                            <div className="col-md-4 mb-4">
                                <label className="form-label" style={{ fontWeight: 600 }}><FiSettings /> Category</label>
                                <select className="form-control" {...register('jewelryType', { required: true })}>
                                    <option value="Ring">Ring</option>
                                    <option value="Necklace">Necklace</option>
                                    <option value="Earrings">Earrings</option>
                                    <option value="Bracelet">Bracelet</option>
                                    <option value="Pendant">Pendant</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-4">
                                <label className="form-label" style={{ fontWeight: 600 }}>Desired Metal</label>
                                <select className="form-control" {...register('metalType', { required: true })}>
                                    <option value="Gold">22k Yellow Gold</option>
                                    <option value="White Gold">18k White Gold</option>
                                    <option value="Rose Gold">18k Rose Gold</option>
                                    <option value="Platinum">Platinum</option>
                                    <option value="Silver">Silver</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-4">
                                <label className="form-label" style={{ fontWeight: 600 }}>Gemstone</label>
                                <select className="form-control" {...register('stoneType', { required: true })}>
                                    <option value="None">None (Solid Metal)</option>
                                    <option value="Diamond">Diamond</option>
                                    <option value="Ruby">Ruby</option>
                                    <option value="Emerald">Emerald</option>
                                    <option value="Sapphire">Sapphire</option>
                                </select>
                            </div>
                        </div>

                        {/* 3. Instructions */}
                        <div className="form-group mb-4">
                            <label className="form-label" style={{ fontWeight: 600 }}>3. Additional Details & Instructions</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="E.g., I need a size 7. Can we make the band slightly thicker than shown in the photo? I want the exact same design but inside my budget of approx LKR 100,000."
                                {...register('specialInstructions', { required: 'Please provide instructions' })}
                            ></textarea>
                            {errors.specialInstructions && <span className="text-danger" style={{ fontSize: '0.85rem' }}>{errors.specialInstructions.message}</span>}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px', fontSize: '1.1rem', fontWeight: 600 }}
                            disabled={loading || !base64Image}
                        >
                            {loading ? (
                                <><FiLoader className="ai-spin" style={{ marginRight: 8 }} /> Uploading & Processing...</>
                            ) : (
                                <><FiCheckCircle style={{ marginRight: 8 }} /> Submit for Admin Pricing</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default CustomPhotoUploadPage;
