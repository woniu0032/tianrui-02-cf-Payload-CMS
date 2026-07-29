import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';
import { uploadImage } from '../services/api';

interface ProductImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 生成预览
  const generatePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }, []);

  // 验证文件
  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `图片大小不能超过 ${maxSizeMB}MB`;
    }
    if (!file.type.startsWith('image/')) {
      return '请上传图片文件';
    }
    return null;
  };

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    if (filesToProcess.length === 0) {
      alert(`最多只能上传 ${maxImages} 张图片`);
      return;
    }

    // 验证文件
    for (const file of filesToProcess) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 生成预览
      const previews = await Promise.all(filesToProcess.map(generatePreview));
      setPreviewUrls(previews);

      // 上传文件
      const uploadedUrls: string[] = [];
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const result = await uploadImage(file);
        if (result.success && result.url) {
          const API_BASE = (typeof process !== 'undefined' && process.env?.VITE_API_URL)
            || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
            || 'https://miaowu-tianrui-huts-01.zeabur.app';
          const fullUrl = result.url.startsWith('http')
            ? result.url
            : `${API_BASE}${result.url}`;
          uploadedUrls.push(fullUrl);
        }
        setUploadProgress(((i + 1) / filesToProcess.length) * 100);
      }

      // 更新图片列表
      onImagesChange([...images, ...uploadedUrls]);
      setPreviewUrls([]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  // 添加URL
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    
    const urls = urlInput.split(',').map(url => url.trim()).filter(Boolean);
    const validUrls = urls.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      alert('请输入有效的图片URL');
      return;
    }

    const remainingSlots = maxImages - images.length;
    const urlsToAdd = validUrls.slice(0, remainingSlots);
    
    if (urlsToAdd.length < validUrls.length) {
      alert(`最多只能上传 ${maxImages} 张图片，已添加前 ${urlsToAdd.length} 张`);
    }

    onImagesChange([...images, ...urlsToAdd]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  // 拖拽排序
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;

    const newImages = [...images];
    const [removed] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, removed);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* 图片预览网格 */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group cursor-move hover:border-blue-400 transition-colors"
            >
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                  主图
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {images.length < maxImages && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 本地上传 */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">上传中 {Math.round(uploadProgress)}%</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">点击上传图片</span>
                  <span className="text-xs text-gray-400">支持 JPG、PNG、WebP，最大 {maxSizeMB}MB</span>
                </>
              )}
            </button>
          </div>

          {/* URL输入 */}
          <div className="flex-1">
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <LinkIcon className="w-6 h-6" />
                <span className="text-sm">输入图片URL</span>
                <span className="text-xs text-gray-400">支持多个URL用逗号分隔</span>
              </button>
            ) : (
              <div className="h-24 border border-gray-300 rounded-lg p-3 flex flex-col gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition"
                  >
                    添加
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 提示信息 */}
      <p className="text-xs text-gray-500">
        已上传 {images.length}/{maxImages} 张图片，拖拽可调整顺序，第一张为主图
      </p>
    </div>
  );
};

export default ProductImageUploader;
