import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  maxFiles = 1,
  accept = 'image/*',
  maxSizeMB = 5,
  label = '上传图片'
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 验证文件大小
    const file = files[0];
    if (file.size > maxSizeMB * 1024 * 1024) {
      const errorMsg = `图片大小不能超过 ${maxSizeMB}MB`;
      onUploadError?.(errorMsg);
      alert(errorMsg);
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 上传到服务器
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      
      if (data.success) {
        const imageUrl = `${API_BASE_URL}${data.url}`;
        onUploadSuccess?.(imageUrl);
      } else {
        throw new Error(data.error || '上传失败');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '上传失败';
      onUploadError?.(errorMsg);
      alert(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {!preview ? (
        <div
          onClick={handleClick}
          className="upload-placeholder"
          style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {uploading ? (
            <div>上传中...</div>
          ) : (
            <>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
              <div>{label}</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                支持 JPG、PNG、GIF、WebP，最大 {maxSizeMB}MB
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="image-preview" style={{ position: 'relative' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
          <button
            onClick={handleRemove}
            disabled={uploading}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
          {uploading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255,255,255,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px'
              }}
            >
              上传中...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
