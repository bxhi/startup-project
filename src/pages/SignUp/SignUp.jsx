import React, { useState, useRef, useEffect } from 'react';
import { FiCheckCircle, FiX, FiShield } from 'react-icons/fi';
import { LuUpload } from 'react-icons/lu';
import { PiCamera } from 'react-icons/pi';
import { IoMdTime } from 'react-icons/io';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import authService from '../../api/authService';
import './SignUp.css';

const SignUp = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [isVerificationPending, setIsVerificationPending] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [selfiePhoto, setSelfiePhoto] = useState(null);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [userId, setUserId] = useState(null);
    const [errorSteps, setErrorSteps] = useState([]); // Track steps with errors
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

    const validateFormData = (data, selfie) => {
        let errors = [];
        let errSteps = [];

        // Step 1 Validation
        if (!data.businessName?.trim()) {
            errors.push('Business Name is required.');
            errSteps.push(1);
        }
        if (!data.ownerFullName?.trim()) {
            errors.push('Owner Full Name is required.');
            errSteps.push(1);
        }
        if (!data.commerceNumber?.trim()) {
            errors.push('Register Commerce Number is required.');
            errSteps.push(1);
        }
        if (!data.nin?.trim()) {
            errors.push('NIN is required.');
            errSteps.push(1);
        } else if (data.nin.length !== 18) {
            errors.push('NIN must be exactly 18 digits.');
            errSteps.push(1);
        }

        // Step 2 Validation
        if (!data.email?.trim()) {
            errors.push('Email is required.');
            errSteps.push(2);
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            errors.push('Email format is invalid.');
            errSteps.push(2);
        }
        if (!data.phone?.trim() || data.phone === '+213 ') {
            errors.push('Phone number is required.');
            errSteps.push(2);
        } else {
            const digits = data.phone.replace(/\D/g, '').slice(3); // Remove +213
            if (digits.length !== 9) {
                errors.push('Phone number must have 9 digits after the prefix.');
                errSteps.push(2);
            }
        }
        if (!data.password) {
            errors.push('Password is required.');
            errSteps.push(2);
        } else if (data.password !== data.confirmPassword) {
            errors.push('Passwords do not match.');
            errSteps.push(2);
        }

        // Step 3 Validation
        if (!data.idFront) {
            errors.push('ID Front image is required.');
            errSteps.push(3);
        }
        if (!data.importLicense) {
            errors.push('Import License is required.');
            errSteps.push(3);
        }
        if (!data.commercialRegister) {
            errors.push('Commercial Register is required.');
            errSteps.push(3);
        }

        // Step 4 Validation
        if (!selfie) {
            errors.push('Selfie photo is required.');
            errSteps.push(4);
        }

        return {
            errors,
            errSteps: [...new Set(errSteps)]
        };
    };

    const isStepValid = (stepNumber) => {
        const { errSteps } = validateFormData(formData, selfiePhoto);
        // A step is valid if it's not in the errorSteps and all fields for that step are filled
        if (errSteps.includes(stepNumber)) return false;

        switch (stepNumber) {
            case 1: return formData.businessName && formData.ownerFullName && formData.commerceNumber && formData.nin;
            case 2: return formData.email && formData.phone && formData.password && formData.password === formData.confirmPassword;
            case 3: return formData.idFront && formData.importLicense && formData.commercialRegister;
            case 4: return !!selfiePhoto;
            default: return false;
        }
    };

    const handleChange = (field, value) => {
        let newValue = value;
        if (field === 'nin' || field === 'commerceNumber') {
            newValue = value.replace(/\D/g, '');
            if (field === 'nin') newValue = newValue.slice(0, 18);
        }

        if (field === 'phone') {
            // Formatting: XXX XX XX XX
            const digits = value.replace(/\D/g, '').slice(0, 9);
            let formatted = '';
            if (digits.length > 0) {
                formatted += digits.slice(0, 3);
                if (digits.length > 3) formatted += ' ' + digits.slice(3, 5);
                if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
                if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
            }
            newValue = formatted;
        }

        const newFormData = { ...formData, [field]: newValue };
        setFormData(newFormData);

        // Real-time validation for error display only if errors already exist
        if (error && Array.isArray(error) && error.length > 0) {
            const { errors, errSteps } = validateFormData(newFormData, selfiePhoto);
            setError(errors);
            setErrorSteps(errSteps);
        }
    };

    const handleFileChange = (field, file) => {
        const newFormData = { ...formData, [field]: file };
        setFormData(newFormData);

        // Real-time validation for error display only if errors already exist
        if (error && Array.isArray(error) && error.length > 0) {
            const { errors, errSteps } = validateFormData(newFormData, selfiePhoto);
            setError(errors);
            setErrorSteps(errSteps);
        }
    };

    const startCamera = async () => {
        try {
            setSelfiePhoto(null);
            setFormData(prev => ({ ...prev, selfiePhoto: null }));
            // Instead of clearing all errors, just update them
            if (error && Array.isArray(error)) {
                const { errors, errSteps } = validateFormData({ ...formData, selfiePhoto: null }, null);
                setError(errors);
                setErrorSteps(errSteps);
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            streamRef.current = stream;
            setCameraActive(true);
            // The videoRef.current is not yet available because the component hasn't re-rendered.
            // We handle attaching the stream in a useEffect below.
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

            // Trigger validation check on capture
            if (error && Array.isArray(error) && error.length > 0) {
                const { errors, errSteps } = validateFormData(formData, photoData);
                setError(errors);
                setErrorSteps(errSteps);
            }

            stopCamera();
        }
    };

    // EFFECT: Attach camera stream to video element when it appears
    useEffect(() => {
        if (cameraActive && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [cameraActive]);

    const nextStep = () => {
        setStep(prev => Math.min(prev + 1, 4));
        // REMOVED: setError(''); - Keep errors visible
    };
    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
        // REMOVED: setError(''); - Keep errors visible
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        const { errors, errSteps } = validateFormData(formData, selfiePhoto);

        if (errors.length > 0) {
            setError(errors);
            setErrorSteps(errSteps);
            setStep(Math.min(...errSteps));
            return;
        }

        setLoading(true);
        setError('');
        setErrorSteps([]);
        try {
            const fd = new FormData();

            // Normalize phone number (keep digits only including the prefix)
            const normalizedPhone = '+' + formData.phone.replace(/\D/g, '');

            // Map to the structure expected by the backend
            fd.append('user[fullName]', formData.ownerFullName);
            fd.append('user[email]', formData.email);
            fd.append('user[phoneNumber]', normalizedPhone);
            fd.append('user[password]', formData.password);

            fd.append('profile[licenseId]', formData.commerceNumber);
            fd.append('profile[registerCommerceNumber]', formData.commerceNumber);
            fd.append('profile[NIN]', formData.nin);
            fd.append('profile[wilaya]', 'Not Specified');
            fd.append('profile[adress]', 'Not Specified');

            // Files
            fd.append('registerCommerceImage', formData.commercialRegister);
            fd.append('licenseImage', formData.importLicense);
            fd.append('idCardImage', formData.idFront);

            // Camera selfie
            if (selfiePhoto && typeof selfiePhoto === 'string' && selfiePhoto.includes(',')) {
                const dataURLtoFile = (dataurl, filename) => {
                    try {
                        let arr = dataurl.split(',');
                        let mimeMatch = arr[0].match(/:(.*?);/);
                        if (!mimeMatch) return null;

                        let mime = mimeMatch[1];
                        let bstr = atob(arr[1]);
                        let n = bstr.length;
                        let u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        return new File([u8arr], filename, { type: mime });
                    } catch (e) {
                        console.error('Error converting dataURL to file:', e);
                        return null;
                    }
                };
                const selfieFile = dataURLtoFile(selfiePhoto, 'selfie.jpg');
                if (selfieFile) {
                    fd.append('selfieImage', selfieFile);
                } else {
                    setError(['Error processing selfie photo. Please try retaking it.']);
                    setErrorSteps([4]);
                    setLoading(false);
                    return;
                }
            } else {
                setError(['Selfie photo is missing or invalid.']);
                setErrorSteps([4]);
                setLoading(false);
                return;
            }

            const response = await authService.registerImportator(fd);
            const returnedUserId = response.importatorProfile?.user?.userId || response.importatorProfile?.userId;

            if (returnedUserId) {
                setUserId(returnedUserId);
                await authService.sendOtp(returnedUserId);
                setIsOtpStep(true);
            } else {
                // Fallback if userId is not found
                setIsVerificationPending(true);
            }
        } catch (err) {
            console.error('Registration error details:', err.response?.data);
            if (!err.response) {
                setError(['Network error: Unable to connect to the server.']);
            } else if (err.response.status >= 400 && err.response.status < 500) {
                let rawMessage = err.response.data?.message;
                let messages = Array.isArray(rawMessage) ? rawMessage : [rawMessage || 'Invalid data. Please check your inputs.'];

                // Clean up and format messages
                const cleanedMessages = messages.map(msg =>
                    msg.replace(/^user\.|^profile\./, '')
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/^./, str => str.toUpperCase())
                );
                setError(cleanedMessages);

                // Map to steps
                const backendErrSteps = [];
                cleanedMessages.forEach(msg => {
                    const lowMsg = msg.toLowerCase();
                    if (lowMsg.includes('full name') || lowMsg.includes('business name') || lowMsg.includes('nin')) backendErrSteps.push(1);
                    if (lowMsg.includes('email') || lowMsg.includes('password') || lowMsg.includes('phone')) backendErrSteps.push(2);
                    if (lowMsg.includes('license') || lowMsg.includes('register') || lowMsg.includes('id card')) backendErrSteps.push(3);
                    if (lowMsg.includes('selfie')) backendErrSteps.push(4);
                });

                if (backendErrSteps.length > 0) {
                    const uniqueSteps = [...new Set(backendErrSteps)];
                    setErrorSteps(uniqueSteps);
                    setStep(Math.min(...uniqueSteps));
                }
            } else {
                setError([err.response.data?.message || 'An error occurred during registration.']);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        if (!otpCode || otpCode.length !== 6) {
            setError(['Please enter a valid 6-digit OTP code.']);
            return;
        }

        setLoading(true);
        setError('');
        try {
            await authService.verifyOtp(userId, otpCode);
            setIsOtpStep(false);
            setIsVerificationPending(true);
        } catch (err) {
            console.error('OTP verification error:', err.response?.data);
            setError([err.response?.data?.message || 'Invalid OTP. Please try again.']);
        } finally {
            setLoading(false);
        }
    };

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
                                prefix="+213"
                                placeholder="XXX XX XX XX"
                                inputMode="tel"
                                maxLength={12}
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
                                <div className="photo-preview-container">
                                    <div className="photo-frame">
                                        <img src={selfiePhoto} alt="Selfie preview" className="photo-img" />
                                    </div>
                                    <div className="photo-actions">
                                        <div className="success-badge">
                                            <FiCheckCircle size={20} className="success-icon" />
                                            <span className="success-text">Ready to submit</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={startCamera}
                                            className="retake-button"
                                        >
                                            Retake Photo
                                        </Button>
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
                <h1 className="signup-main-title">Importers</h1>
                <p className="signup-subtitle">Register your business account</p>
            </div>

            <Card className="signup-card">
                {error && Array.isArray(error) && error.length > 0 && (
                    <div className="error-message-container">
                        <div className="error-title">
                            <FiX size={18} />
                            Please correct the following errors:
                        </div>
                        <ul className="error-list">
                            {error.map((err, index) => (
                                <li key={index} className="error-list-item">{err}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {!isVerificationPending && (
                    <div className="step-indicator">
                        {[1, 2, 3, 4].map((s) => {
                            const labels = ['Register', 'Credential', 'Documents', 'Selfie'];
                            const isActive = step === s && !isOtpStep && !isVerificationPending;
                            const hasError = errorSteps.includes(s);
                            const isCompleted = (isOtpStep || isVerificationPending) ? !hasError : isStepValid(s);

                            return (
                                <div key={s} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${hasError ? 'error' : ''}`}>
                                    <div className={`step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${hasError ? 'error' : ''}`}>
                                        {hasError ? (
                                            <FiX size={24} />
                                        ) : isCompleted ? (
                                            <FiCheckCircle size={24} />
                                        ) : (
                                            s
                                        )}
                                    </div>
                                    <div className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${hasError ? 'error' : ''}`}>{labels[s - 1]}</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {isOtpStep ? (
                    <div className="otp-verification">
                        <div className="otp-content">
                            <FiShield size={62} className="otp-icon" />
                            <h2 className="otp-title">Verify Your Email</h2>
                            <p className="otp-subtitle">We've sent a 6-digit code to {formData.email}. Please enter it below to continue.</p>
                            <div className="otp-input-container">
                                <Input
                                    placeholder="000 000"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="otp-input"
                                    maxLength={6}
                                    style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                                />
                            </div>
                            <div className="otp-actions">
                                <Button
                                    onClick={handleOtpSubmit}
                                    disabled={loading || otpCode.length !== 6}
                                    className="verify-button"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Continue'}
                                </Button>
                                <button
                                    className="resend-link"
                                    onClick={() => authService.sendOtp(userId)}
                                    disabled={loading}
                                >
                                    Resend Code
                                </button>
                                <button
                                    className="resend-link"
                                    onClick={() => { setIsOtpStep(false); setStep(2); }}
                                    disabled={loading}
                                    style={{ marginTop: '5px' }}
                                >
                                    Wrong email? Change it
                                </button>
                            </div>
                        </div>
                    </div>
                ) : isVerificationPending ? (
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

                {!isVerificationPending && !isOtpStep && (
                    <div className="step-actions">
                        {step > 1 && (
                            <Button variant="outline" onClick={prevStep}>Back</Button>
                        )}
                        {step < 4 ? (
                            <Button onClick={nextStep} disabled={loading}>Continue to {['Credential', 'Documents', 'Selfie'][step - 1]}</Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={!selfiePhoto || loading}
                            >
                                {loading ? 'Submitting...' : 'Submit for Verification'}
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
