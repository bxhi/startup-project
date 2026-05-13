export const uploadToCloudinary = async (file) => {
    const cloudName = 'djjcj5okn';
    const apiKey = '541154499496648';
    const apiSecret = 'KLeMKDPv49loz50HUYNH_p7tOvs';
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 1. Create string to sign
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;

    // 2. Hash string using Web Crypto API to create SHA-1 signature
    const msgBuffer = new TextEncoder().encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 3. Prepare FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    // 4. Send POST request
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
};
