import React, { useState, useRef, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { LuUpload } from 'react-icons/lu';
import { PiCamera } from 'react-icons/pi';
import { IoMdTime } from 'react-icons/io';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './SignUp.css';

const SignUp = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [isVerificationPending, setIsVerificationPending] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [selfiePhoto, setSelfiePhoto] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [formData, setFormData] = useState({
        businessName: '',
        ownerFullName: '',
        commerceNumber: '',
        nin: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        importLicense: null,
        commercialRegister: null,
        idFront: null,
        idBack: null,
        selfiePhoto: null
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (field, file) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const photoData = canvasRef.current.toDataURL('image/jpeg');
            setSelfiePhoto(photoData);
            setFormData(prev => ({ ...prev, selfiePhoto: photoData }));
            stopCamera();
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // Cleanup camera stream on component unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="step-content">
                        
                        <div className="inputs-grid">
                            <Input
                                label="Business Name"
                                placeholder="Enter business name"
                                value={formData.businessName}
                                onChange={(e) => handleChange('businessName', e.target.value)}
                            />
                            <Input
                                label="Owner Full Name"
                                placeholder="Enter owner's full name"
                                value={formData.ownerFullName}
                                onChange={(e) => handleChange('ownerFullName', e.target.value)}
                            />
                            <Input
                                label="Register Commerce Number"
                                placeholder="Enter commerce number"
                                value={formData.commerceNumber}
                                onChange={(e) => handleChange('commerceNumber', e.target.value)}
                            />
                            <Input
                                label="NIN (National Identification Number)"
                                placeholder="Enter NIN"
                                value={formData.nin}
                                onChange={(e) => handleChange('nin', e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="step-content">
                       
                        <div className="inputs-grid">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                            <Input
                                label="Phone"
                                type="tel"
                                placeholder="+213 XXX XX XX XX"
                                inputMode="tel"
                                maxLength={17}
                                pattern="^\+213\s?\d{3}\s?\d{2}\s?\d{2}\s?\d{2}$"
                                title="Phone must match +213 XXX XX XX XX"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="step-content">
                        <div className="file-uploads-grid">
                            <div className="file-upload-field">
                                <label htmlFor="importLicense" className="file-label">Import License</label>
                                <div className="file-input-wrapper">
                                    <input
                                        id="importLicense"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange('importLicense', e.target.files[0])}
                                        className="file-input"
                                    />
                                    <div className="upload-content">
                                        <LuUpload size={32} className="upload-icon" />
                                        <span className="upload-text">Click to upload</span>
                                    </div>
                                </div>
                                {formData.importLicense && <span className="file-name">{formData.importLicense.name}</span>}
                            </div>
                            <div className="file-upload-field">
                                <label htmlFor="commercialRegister" className="file-label">Commercial Register</label>
                                <div className="file-input-wrapper">
                                    <input
                                        id="commercialRegister"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange('commercialRegister', e.target.files[0])}
                                        className="file-input"
                                    />
                                    <div className="upload-content">
                                        <LuUpload size={32} className="upload-icon" />
                                        <span className="upload-text">Click to upload</span>
                                    </div>
                                </div>
                                {formData.commercialRegister && <span className="file-name">{formData.commercialRegister.name}</span>}
                            </div>
                            <div className="file-upload-field">
                                <label htmlFor="idFront" className="file-label">ID Front</label>
                                <div className="file-input-wrapper">
                                    <input
                                        id="idFront"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange('idFront', e.target.files[0])}
                                        className="file-input"
                                    />
                                    <div className="upload-content">
                                        <LuUpload size={32} className="upload-icon" />
                                        <span className="upload-text">Click to upload</span>
                                    </div>
                                </div>
                                {formData.idFront && <span className="file-name">{formData.idFront.name}</span>}
                            </div>
                            <div className="file-upload-field">
                                <label htmlFor="idBack" className="file-label">ID Back</label>
                                <div className="file-input-wrapper">
                                    <input
                                        id="idBack"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange('idBack', e.target.files[0])}
                                        className="file-input"
                                    />
                                    <div className="upload-content">
                                        <LuUpload size={32} className="upload-icon" />
                                        <span className="upload-text">Click to upload</span>
                                    </div>
                                </div>
                                {formData.idBack && <span className="file-name">{formData.idBack.name}</span>}
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="step-content">
                        <div className="selfie-header">
                            <h2 className="selfie-title">Live Selfie Verification</h2>
                            <p className="selfie-subtitle">Please capture a clear photo of yourself</p>
                        </div>
                        
                        <div className="camera-container">
                            {cameraActive ? (
                                <div className="camera-wrapper">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="video-feed"
                                    />
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                    <div className="camera-controls">
                                        <Button 
                                            variant="outline" 
                                            onClick={stopCamera}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={capturePhoto}>
                                            Take Photo
                                        </Button>
                                    </div>
                                </div>
                            ) : selfiePhoto ? (
                                <div className="photo-preview">
                                    <div className="success-message">
                                        <FiCheckCircle size={32} className="success-icon" />
                                        <span className="success-text">Selfie captured successfully</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="camera-input-wrapper">
                                    <button 
                                        className="camera-button"
                                        onClick={startCamera}
                                    >
                                        <div className="camera-content">
                                            <PiCamera size={40} className="camera-icon" />
                                            <span className="camera-text">Click to open camera</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-header">
                <h1 className="signup-main-title">Importer</h1>
                <p className="signup-subtitle">Register your business account</p>
            </div>

            <Card className="signup-card">
                {!isVerificationPending && (
                    <div className="step-indicator">
                        {[1, 2, 3, 4].map((s) => {
                            const labels = ['Register', 'Credential', 'Documents', 'Selfie'];
                            const isActive = step === s;
                            const isCompleted = step > s;
                            return (
                                <div key={s} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                    <div className={`step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                        {isCompleted ? (
                                            <FiCheckCircle size={24} />
                                        ) : (
                                        s
                                        )}
                                    </div>
                                    <div className={`step-label ${isActive ? 'active' : ''}`}>{labels[s - 1]}</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {isVerificationPending ? (
                    <div className="verification-pending">
                        <div className="verification-content">
                            <IoMdTime size={62} className="verification-icon" />
                            <h2 className="verification-title">Verification Pending</h2>
                            <p className="verification-subtitle">Your documents are being reviewed. This usually takes 24-48 hours.</p>
                        </div>
                    </div>
                ) : (
                    renderStep()
                )}

                {!isVerificationPending && (
                    <div className="step-actions">
                        {step > 1 && (
                            <Button variant="outline" onClick={prevStep}>Back</Button>
                        )}
                        {step < 4 ? (
                            <Button onClick={nextStep}>Continue to {['Credential', 'Documents', 'Selfie'][step - 1]}</Button>
                        ) : (
                            <Button 
                                onClick={() => setIsVerificationPending(true)}
                                disabled={!selfiePhoto}
                            >
                                Submit for Verification
                            </Button>
                        )}
                    </div>
                )}

            </Card>
                <div className="login-redirect">
                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(); }}>Login here</a>
                </div>
        </div>
    );
};


export default SignUp;
