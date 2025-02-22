import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = async (fileBuffer) => {
    try {
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${fileBuffer.toString("base64")}`, {
            folder: 'LiveEvents',
        });

        if (!result || !result.secure_url) {
            throw new Error("Cloudinary upload failed: No URL received");
        }

        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Error uploading to Cloudinary");
    }
};