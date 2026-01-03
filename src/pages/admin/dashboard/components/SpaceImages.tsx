import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface SpaceImage {
  id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

interface SpaceImagesProps {
  branchId: number;
}

export default function SpaceImages({ branchId }: SpaceImagesProps) {
  const [images, setImages] = useState<SpaceImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (branchId) {
      loadImages();
    }
  }, [branchId]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('space_images')
        .select('*')
        .eq('branch_id', branchId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      console.error('Error loading images:', error);
      setMessage({ type: 'error', text: 'Không thể tải ảnh: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Kiểm tra số lượng ảnh
    const totalImages = images.length + selectedFiles.length + files.length;
    if (totalImages > 10) {
      setMessage({ 
        type: 'error', 
        text: `Chỉ được tải tối đa 10 ảnh. Hiện tại: ${images.length} ảnh đã có, ${selectedFiles.length} ảnh đang chọn.` 
      });
      return;
    }

    // Kiểm tra từng file
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Kiểm tra định dạng
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Không phải file ảnh`);
        return;
      }

      // Kiểm tra kích thước (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        errors.push(`${file.name}: Vượt quá 2MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') });
    }

    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);

      // Tạo preview URLs
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
      
      setMessage({ type: 'success', text: `Đã chọn ${validFiles.length} ảnh` });
    }
  };

  const handleRemoveSelected = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Revoke URL để tránh memory leak
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ảnh để tải lên' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const maxOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) : 0;
      let successCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `space-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `space/${fileName}`;

        try {
          // Upload file to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          // Save to database
          const { error: dbError } = await supabase
            .from('space_images')
            .insert({
              image_url: publicUrl,
              branch_id: branchId,
              display_order: maxOrder + i + 1,
            });

          if (dbError) throw dbError;

          successCount++;
        } catch (error: any) {
          errors.push(`${file.name}: ${error.message}`);
        }
      }

      if (successCount > 0) {
        setMessage({ 
          type: 'success', 
          text: `Đã tải lên ${successCount}/${selectedFiles.length} ảnh thành công!` 
        });
        
        // Clear selected files
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setSelectedFiles([]);
        setPreviewUrls([]);
        
        await loadImages();
      }

      if (errors.length > 0) {
        setMessage({ 
          type: 'error', 
          text: `Lỗi: ${errors.join(', ')}` 
        });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Lỗi tải ảnh: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: SpaceImage) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      // Extract file path from URL
      const urlParts = image.image_url.split('/storage/v1/object/public/images/');
      const filePath = urlParts[1];

      if (filePath) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([filePath]);

        if (storageError) {
          console.error('Storage delete error:', storageError);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('space_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      setMessage({ type: 'success', text: 'Đã xóa ảnh thành công!' });
      await loadImages();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Lỗi xóa ảnh: ' + error.message });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-gray-900 animate-spin mb-2"></i>
          <p className="text-gray-700 font-medium">Đang tải ảnh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý ảnh không gian quán</h2>
          <p className="text-gray-700 font-medium text-sm mt-1">
            Đã có {images.length}/10 ảnh • Tối đa 2MB mỗi ảnh
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl font-semibold ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Upload Section */}
      {images.length < 10 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Tải ảnh lên</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#E84118] transition-all cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="space-file-upload"
              disabled={uploading}
            />
            <label htmlFor="space-file-upload" className="cursor-pointer">
              <i className="ri-image-add-line text-5xl text-gray-400 mb-4 block"></i>
              <p className="text-gray-900 font-semibold mb-2">
                Nhấn để chọn ảnh hoặc kéo thả vào đây
              </p>
              <p className="text-gray-600 text-sm">
                JPG, PNG, WEBP • Tối đa 2MB mỗi ảnh • Tối đa 10 ảnh
              </p>
            </label>
          </div>

          {/* Preview Selected Images */}
          {selectedFiles.length > 0 && (
            <div>
              <h4 className="text-gray-900 font-semibold mb-3">
                Ảnh đã chọn ({selectedFiles.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveSelected(index)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-semibold">
                      {(selectedFiles[index].size / 1024 / 1024).toFixed(2)}MB
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#E84118] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-2xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <i className="ri-upload-2-line mr-2"></i>
                      Tải lên {selectedFiles.length} ảnh
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    previewUrls.forEach(url => URL.revokeObjectURL(url));
                    setSelectedFiles([]);
                    setPreviewUrls([]);
                  }}
                  disabled={uploading}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Ảnh không gian quán ({images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={image.image_url}
                    alt={`Không gian ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-semibold">
                  #{index + 1}
                </div>
                <button
                  onClick={() => handleDelete(image)}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-2xl">
          <i className="ri-image-line text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-700 font-semibold">Chưa có ảnh nào. Hãy tải ảnh lên!</p>
        </div>
      )}
    </div>
  );
}
