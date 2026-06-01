import React, { useState, useRef, useEffect } from 'react';
import { FiCheckCircle, FiX, FiShield } from 'react-icons/fi';
import { LuUpload, LuShoppingBag, LuPackage, LuTrendingUp, LuStore, LuDollarSign, LuBox } from 'react-icons/lu';
import { PiCamera } from 'react-icons/pi';
import { IoMdTime } from 'react-icons/io';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import authService from '../../api/authService';
import { uploadToCloudinary } from '../../api/uploadService';
import './SignUp.css';
import LoadingPage from '../../components/LoadingPage/LoadingPage';
import { useLanguage } from '../../context/LanguageContext';
import Stepper from '../../components/Stepper/Stepper';

const SignUp = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [isVerificationPending, setIsVerificationPending] = useState(false);
    // ... rest of state ...
    const [cameraActive, setCameraActive] = useState(false);
    const [selfiePhoto, setSelfiePhoto] = useState(null);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [userId, setUserId] = useState(null);
    const [errorSteps, setErrorSteps] = useState([]); // Track steps with errors
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

    const [formData, setFormData] = useState({
        gender: '',
        address: '',
        willaya: '',
        ownerFullName: '',
        licenseId: '',
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
        if (!data.gender) {
            errors.push(t.errReqGender || 'Gender is required.');
            errSteps.push(1);
        }
        if (!data.address?.trim()) {
            errors.push(t.errReqAddress || 'Address is required.');
            errSteps.push(1);
        }
        if (!data.willaya) {
            errors.push(t.errReqWillaya || 'Willaya is required.');
            errSteps.push(1);
        }
        if (!data.ownerFullName?.trim()) {
            errors.push(t.errReqOwnerName || 'Owner Full Name is required.');
            errSteps.push(1);
        }
        if (!data.licenseId?.trim()) {
            errors.push(t.errReqLicenseId || 'License ID is required.');
            errSteps.push(1);
        }
        if (!data.nin?.trim()) {
            errors.push(t.errReqNin || 'NIN is required.');
            errSteps.push(1);
        } else if (data.nin.length !== 18) {
            errors.push(t.errNinLength || 'NIN must be exactly 18 digits.');
            errSteps.push(1);
        }

        // Step 2 Validation (Documents)
        if (!data.idFront) {
            errors.push(t.errReqIdFront || 'ID Front image is required.');
            errSteps.push(2);
        }
        if (!data.importLicense) {
            errors.push(t.errReqImportLicense || 'Import License is required.');
            errSteps.push(2);
        }
        if (!data.commercialRegister) {
            errors.push(t.errReqCommRegister || 'Commercial Register is required.');
            errSteps.push(2);
        }

        // Step 3 Validation (Selfie)
        if (!selfie) {
            errors.push(t.errReqSelfie || 'Selfie photo is required.');
            errSteps.push(3);
        }

        // Step 4 Validation (Credential)
        if (!data.email?.trim()) {
            errors.push(t.errReqEmail || 'Email is required.');
            errSteps.push(4);
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            errors.push(t.errInvalidEmail || 'Email format is invalid.');
            errSteps.push(4);
        }
        if (!data.phone?.trim() || data.phone === '+213 ') {
            errors.push(t.errReqPhone || 'Phone number is required.');
            errSteps.push(4);
        } else {
            const digits = data.phone.replace(/\D/g, '');
            if (digits.length !== 9) {
                errors.push(t.errPhoneLength || 'Phone number must have 9 digits after the prefix.');
                errSteps.push(4);
            }
        }
        if (!data.password) {
            errors.push(t.errReqPassword || 'Password is required.');
            errSteps.push(4);
        } else if (data.password !== data.confirmPassword) {
            errors.push(t.errPasswordMismatch || 'Passwords do not match.');
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
            case 1: return formData.ownerFullName && formData.licenseId && formData.nin && formData.gender && formData.address && formData.willaya;
            case 2: return formData.idFront && formData.importLicense && formData.commercialRegister;
            case 3: return !!selfiePhoto;
            case 4: return formData.email && formData.phone && formData.password && formData.password === formData.confirmPassword;
            default: return false;
        }
    };

    const handleChange = (field, value) => {
        let newValue = value;
        if (field === 'nin' || field === 'licenseId') {
            newValue = value.replace(/\D/g, '');
            if (field === 'nin') newValue = newValue.slice(0, 18);
        }

        if (field === 'phone') {
            // Formatting: XXX XX XX XX
            let digits = value.replace(/\D/g, '');
            if (digits.startsWith('213')) {
                digits = digits.slice(3);
            } else if (digits.startsWith('0')) {
                digits = digits.slice(1);
            }
            digits = digits.slice(0, 9);

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
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        const { errors, errSteps } = validateFormData(formData, selfiePhoto);
        if (errors.length > 0) {
            setError(errors);
            setErrorSteps(errSteps); // This will turn the dots red
            if (errSteps.length > 0) {
                setStep(Math.min(...errSteps)); // Jump to first error
            }
            return;
        }

        setLoading(true);
        setError('');
        setErrorSteps([]);
        try {
            // Camera selfie
            let selfieFile = null;
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
                selfieFile = dataURLtoFile(selfiePhoto, 'selfie.jpg');
                if (!selfieFile) {
                    setError([t.errSelfieProcess || 'Error processing selfie photo. Please try retaking it.']);
                    setErrorSteps([4]);
                    setLoading(false);
                    return;
                }
            } else {
                setError([t.errSelfieMissing || 'Selfie photo is missing or invalid.']);
                setErrorSteps([4]);
                setLoading(false);
                return;
            }

            // Normalize phone number (keep digits only including the prefix)
            const normalizedPhone = '+213' + formData.phone.replace(/\D/g, '');

            // Upload files to Cloudinary
            const [
                registerCommerceImageUrl,
                licenseImageUrl,
                idFrontCardImageUrl,
                idBackCardImageUrl,
                selfieImageUrl
            ] = await Promise.all([
                uploadToCloudinary(formData.commercialRegister),
                uploadToCloudinary(formData.importLicense),
                uploadToCloudinary(formData.idFront),
                uploadToCloudinary(formData.idBack),
                uploadToCloudinary(selfieFile)
            ]);

            // Construct JSON payload
            const payload = {
                user: {
                    fullName: formData.ownerFullName,
                    email: formData.email,
                    phoneNumber: normalizedPhone,
                    password: formData.password
                },
                profile: {
                    licenseId: formData.licenseId,
                    registerCommerceNumber: formData.licenseId,
                    NIN: formData.nin,
                    wilaya: formData.willaya,
                    address: formData.address,
                    gender: formData.gender
                },
                imageUrls: {
                    registerCommerceImage: registerCommerceImageUrl,
                    licenseImage: licenseImageUrl,
                    idFrontCardImage: idFrontCardImageUrl,
                    idBackCardImage: idBackCardImageUrl,
                    selfieImage: selfieImageUrl
                }
            };

            const response = await authService.registerImportator(payload);
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
                setError([t.errNetwork || 'Network error: Unable to connect to the server.']);
            } else if (err.response.status >= 400 && err.response.status < 500) {
                let rawMessage = err.response.data?.message;
                let messages = Array.isArray(rawMessage) ? rawMessage : [rawMessage || t.errInvalidData || 'Invalid data. Please check your inputs.'];

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
                    if (lowMsg.includes('license') || lowMsg.includes('register') || lowMsg.includes('id card')) backendErrSteps.push(2);
                    if (lowMsg.includes('selfie')) backendErrSteps.push(3);
                    if (lowMsg.includes('email') || lowMsg.includes('password') || lowMsg.includes('phone')) backendErrSteps.push(4);
                });

                if (backendErrSteps.length > 0) {
                    const uniqueSteps = [...new Set(backendErrSteps)];
                    setErrorSteps(uniqueSteps);
                    setStep(Math.min(...uniqueSteps));
                }
            } else if (err.response.status === 500) {
                setError([t.errDuplicateInfo || 'This Phone Number or NIN is already registered. Please try using a different one.']);
                setErrorSteps([1, 4]);
            } else {
                setError([err.response.data?.message || t.errOccurredDuringReg || 'An error occurred during registration.']);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        if (digit || value === '') {
            const newOtp = otpCode.split('');
            newOtp[index] = digit;
            const updatedOtp = newOtp.join('');
            setOtpCode(updatedOtp);

            // Move to next input
            if (digit && index < 5) {
                otpRefs.current[index + 1].current.focus();
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpRefs.current[index - 1].current.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            setOtpCode(pastedData);
            // Focus the correct input based on pasted length
            const nextIndex = Math.min(pastedData.length, 5);
            if (otpRefs.current[nextIndex] && otpRefs.current[nextIndex].current) {
                otpRefs.current[nextIndex].current.focus();
            }
        }
    };

    const handleResendOtp = async () => {
        try {
            setLoading(true);
            await authService.sendOtp(userId);
            // Could add a toast here
        } catch (err) {
            setError([t.errOtpResendFailed || 'Failed to resend OTP. Please try again.']);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        if (!otpCode || otpCode.length !== 6) {
            setError([t.errInvalidOtpMsg || 'Please enter a valid 6-digit OTP code.']);
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
            setError([err.response?.data?.message || t.errVerifyOtp || 'Invalid OTP. Please try again.']);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Removed forced white background to allow blobs and aura to show
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    const renderStep = () => {
        const algerianWillayas = [
            "1 - Adrar", "2 - Chlef", "3 - Laghouat", "4 - Oum El Bouaghi", "5 - Batna", 
            "6 - Béjaïa", "7 - Biskra", "8 - Béchar", "9 - Blida", "10 - Bouira", 
            "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", 
            "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda", 
            "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", 
            "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla", 
            "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès", 
            "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela", 
            "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", 
            "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - Timimoun", "50 - Bordj Badji Mokhtar", 
            "51 - Ouled Djellal", "52 - Béni Abbès", "53 - In Salah", "54 - In Guezzam", "55 - Touggourt", 
            "56 - Djanet", "57 - El M'Ghair", "58 - El Meniaa", "59 - N'Goussa", "60 - M'Sif", 
            "61 - Ben Choud", "62 - El Abiodh Sidi Cheikh", "63 - Ain Sefra", "64 - Taghit", "65 - Tabelbala", 
            "66 - In Amguel", "67 - Bordj Omar Driss", "68 - Debdeb", "69 - Tin Zaouatine"
        ];

        switch (step) {
            case 1:
                return (
                    <div className="step-content">
                        <div className="inputs-grid">
                            <Input
                                label={t.ownerNameLabel || "Owner Full Name"}
                                placeholder={t.ownerNamePlaceholder || "Enter owner's full name"}
                                value={formData.ownerFullName}
                                onChange={(e) => handleChange('ownerFullName', e.target.value)}
                            />
                            <Input
                                type="select"
                                label={t.genderLabel || "Gender"}
                                placeholder={t.genderPlaceholder || "Select gender"}
                                value={formData.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                options={[
                                    { value: 'male', label: t.male || 'Male' },
                                    { value: 'female', label: t.female || 'Female' }
                                ]}
                            />
                            <Input
                                label={t.addressLabel || "Address"}
                                placeholder={t.addressPlaceholder || "Enter full address"}
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                            />
                            <Input
                                type="select"
                                label={t.willayaLabel || "Willaya"}
                                placeholder={t.willayaPlaceholder || "Select Willaya"}
                                value={formData.willaya}
                                onChange={(e) => handleChange('willaya', e.target.value)}
                                options={algerianWillayas}
                            />
                            <Input
                                label={t.licenseIdLabel || "License ID"}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder={t.licenseIdPlaceholder || "Enter license ID"}
                                value={formData.licenseId}
                                onChange={(e) => handleChange('licenseId', e.target.value)}
                            />
                            <Input
                                label={t.ninLabel || "NIN (National Identification Number)"}
                                placeholder={t.ninPlaceholder || "Enter NIN"}
                                value={formData.nin}
                                onChange={(e) => handleChange('nin', e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="step-content">
                        <div className="file-uploads-grid">
                            <div className="file-upload-field">
                                <label htmlFor="importLicense" className="file-label">{t.importLicenseLabel || "Import License"}</label>
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
                                        <span className="upload-text">{t.clickToUpload || "Click to upload"}</span>
                                    </div>
                                </div>
                                {formData.importLicense && <span className="file-name">{formData.importLicense.name}</span>}
                            </div>
                            <div className="file-upload-field">
                                <label htmlFor="commercialRegister" className="file-label">{t.commRegisterLabel || "Commercial Register"}</label>
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
                                        <span className="upload-text">{t.clickToUpload || "Click to upload"}</span>
                                    </div>
                                </div>
                                {formData.commercialRegister && <span className="file-name">{formData.commercialRegister.name}</span>}
                            </div>
                            <div className="file-upload-field">
                                <label htmlFor="idFront" className="file-label">{t.idFrontLabel || "ID Front"}</label>
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
                                        <span className="upload-text">{t.clickToUpload || "Click to upload"}</span>
                                    </div>
                                </div>
                                {formData.idFront && <span className="file-name">{formData.idFront.name}</span>}
                            </div>
                            <div className="file-upload-field">
                                <label htmlFor="idBack" className="file-label">{t.idBackLabel || "ID Back"}</label>
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
                                        <span className="upload-text">{t.clickToUpload || "Click to upload"}</span>
                                    </div>
                                </div>
                                {formData.idBack && <span className="file-name">{formData.idBack.name}</span>}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="step-content">
                        <div className="selfie-header">
                            <h2 className="selfie-title">{t.liveSelfieVerif || "Live Selfie Verification"}</h2>
                            <p className="selfie-subtitle">{t.liveSelfieDesc || "Please capture a clear photo of yourself"}</p>
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
                                            size="sm"
                                            onClick={stopCamera}
                                            title="Cancel"
                                            className="icon-only-btn"
                                        >
                                            <FiX size={20} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={capturePhoto}
                                            title="Take Photo"
                                            className="icon-only-btn"
                                        >
                                            <PiCamera size={20} />
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
                                            <span className="success-text">{t.readyToSubmit || "Ready to submit"}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={startCamera}
                                            className="retake-button"
                                        >
                                            {t.retakePhoto || "Retake Photo"}
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
                                            <span className="camera-text">{t.clickToOpenCam || "Click to open camera"}</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="step-content">

                        <div className="inputs-grid">
                            <Input
                                label={t.emailLabel || "Email"}
                                type="email"
                                placeholder={t.emailPlaceholder || "your.email@example.com"}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                            <Input
                                label={t.phoneLabel || "Phone"}
                                type="tel"
                                prefix="+213 "
                                placeholder="XXX XX XX XX"
                                inputMode="tel"
                                maxLength={12}
                                containerDir="ltr"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                            <Input
                                label={t.passwordLabel || "Password"}
                                type="password"
                                placeholder={t.passwordPlaceholder || "Enter password"}
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                            />
                            <Input
                                label={t.confirmPasswordLabel || "Confirm Password"}
                                type="password"
                                placeholder={t.confirmPasswordPlaceholder || "Confirm your password"}
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="signup-container">
            {loading && <LoadingPage message="Processing your request..." />}
            {/* Background Animations */}
            <div className="bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                <div className="blob blob-4"></div>
                <div className="blob blob-5"></div>
                <div className="blob blob-6"></div>
                <div className="blob-rainbow"></div>
                
                {/* Floating premium logistics icons ecosystem */}
                <div className="floating-logistics-icon icon-drift-1"><LuPackage /></div>
                <div className="floating-logistics-icon icon-drift-2"><LuStore /></div>
                <div className="floating-logistics-icon icon-drift-3"><LuTrendingUp /></div>
                <div className="floating-logistics-icon icon-drift-4"><LuDollarSign /></div>
                <div className="floating-logistics-icon icon-drift-5"><LuBox /></div>
                <div className="floating-logistics-icon icon-drift-6"><LuShoppingBag /></div>
            </div>

            <div className="signup-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div className="brand-horizontal" style={{ display: 'flex', alignItems: 'center', gap: '30px', justifyContent: 'center' }}>
                    <img src="/SILA-LOGO.png" className="signup-logo-img" alt="SILA" style={{ height: '120px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))', objectFit: 'contain' }}  />
                    <div style={{ width: '5px', height: '50px', background: 'linear-gradient(180deg, rgba(26,86,219,0), rgba(26,86,219,0.8), rgba(26,86,219,0))', borderRadius: '4px' }}></div>
                    <h1 className="login-title" style={{ color: '#1a56db', fontWeight: '800', margin: 0, fontSize: '1.5rem', lineHeight: '30px' }}>{t.signupMainTitle || 'Join us'}</h1>
               
                </div>
                <p className="signup-subtitle" style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500'}}>{t.signupSubtitle || 'Join our premium importer network today.'}</p>
            </div>

            <Card className="signup-card">
                {/* Choice 5: Mesh-Aura Internal Assets */}
                <div className="card-mesh-aura-layer">
                    <div className="aura-blob aura-blob-1"></div>
                    <div className="aura-blob aura-blob-2"></div>
                    <div className="aura-blob aura-blob-3"></div>
                </div>

                {!isVerificationPending && !isOtpStep && (
                    <Stepper 
                        steps={[t.step1 || 'Register', t.step2 || 'Documents', t.step3 || 'Selfie', t.step4 || 'Credential']} 
                        current={step} 
                        errorSteps={errorSteps}
                        validSteps={[1, 2, 3, 4].filter(s => isStepValid(s))}
                    />
                )}

                {error && Array.isArray(error) && error.length > 0 && (
                    <div className="error-message-container">
                        <div className="error-title">
                            <FiX size={18} />
                            {t.errRegistrationData || 'Please correct the following errors:'}
                        </div>
                        <ul className="error-list">
                            {error.map((err, index) => (
                                <li key={index} className="error-list-item">{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {isOtpStep ? (
                    <div className="otp-verification-modern">
                        <div className="otp-card-internal">
                            <div className="otp-header">
                                <div className="otp-icon-wrapper">
                                    <FiShield size={32} className="otp-icon-new" />
                                    <div className="icon-pulse"></div>
                                </div>
                                <h2 className="otp-title-new">{t.errSecurityVerif || 'Security Verification'}</h2>
                                <p className="otp-subtitle-new">
                                    {t.errSentCodeTo || "We've sent a 6-digit code to"} <span className="user-email">{formData.email}</span>
                                </p>
                            </div>

                            <div className="otp-digits-container">
                                {[...Array(6)].map((_, i) => (
                                    <input
                                        key={i}
                                        ref={otpRefs.current[i]}
                                        type="text"
                                        maxLength={1}
                                        inputMode="numeric"
                                        value={otpCode[i] || ''}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        onPaste={handleOtpPaste}
                                        className={`otp-digit-input ${otpCode[i] ? 'filled' : ''}`}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            <div className="otp-footer">
                                <Button
                                    onClick={() => handleOtpSubmit()}
                                    disabled={loading || otpCode.length !== 6}
                                    className="otp-submit-btn"
                                >
                                    {loading ? 'Verifying...' : 'Verify Identity'}
                                </Button>

                                <div className="otp-helper-actions">
                                    <p className="resend-text">
                                        Didn't receive the code?
                                        <button className="text-btn" onClick={handleResendOtp} disabled={loading}>
                                            Resend
                                        </button>
                                    </p>
                                    <button className="change-email-btn" onClick={() => { setIsOtpStep(false); setStep(4); }}>
                                        Change email address
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isVerificationPending ? (
                    <div className="verification-success-modern">
                        <div className="success-content">
                            <div className="check-icon-wrapper">
                                <div className="check-icon-circle"></div>
                                <FiCheckCircle size={80} className="check-icon-animated" />
                            </div>
                            <h2 className="success-title">{t.verificationSuccessTitle || 'Success! Identity Verified'}</h2>
                            <p className="success-subtitle">
                                {t.verificationSuccessDesc || 'Your account is now ready for exploration. You can login immediately while we validate your documents.'}
                            </p>
                            <div className="email-notify-card">
                                <FiShield className="shield-icon" />
                                <span>{t.willNotifyAt || 'We will notify you at:'} <strong>{formData.email}</strong></span>
                            </div>
                            <Button
                                onClick={() => onNavigate()}
                                className="success-login-btn"
                            >
                                {t.goToLogin || 'Proceed to Login'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    renderStep()
                )}

                {!isVerificationPending && !isOtpStep && (
                    <div className="step-actions">
                        {step > 1 && (
                            <Button variant="outline" onClick={prevStep}>{t.backButton || 'Back'}</Button>
                        )}
                        {step < 4 ? (
                            <Button
                                onClick={nextStep}
                                className={step === 1 ? 'full-width' : ''}
                            >
                                {t.nextButton || 'Next'}
                            </Button>
                        ) : (
                            <button
                                className="btn-fly"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                <div className="svg-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                                    </svg>
                                </div>
                                <span>{loading ? (t.loggingInButton || 'Submitting...') : (t.registerButton || 'Submit for Verification')}</span>
                            </button>
                        )}
                    </div>
                )}

            </Card>
            <div className="login-redirect">
                {t.haveAccount || 'Already have an account?'} <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(); }}>{t.loginLink || 'Login here'}</a>
            </div>
        </div>
    );
};


export default SignUp;
