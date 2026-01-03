import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface MenuImage {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface MenuImagesProps {
  branchId: string;
}

export default function MenuImages({ branchId }: MenuImagesProps) {
  const [images, setImages] = useState<MenuImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_IMAGES = 5;
  const MIN_IMAGES = 3;
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  useEffect(() => {
    if (branchId) {
      loadImages();
    }
  }, [branchId]);

  useEffect(() => {
    // Cleanup preview URLs
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_images')
        .select('*')
        .eq('branch_id', branchId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      console.error('Error loading images:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách ảnh. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate number of files
    const totalImages = images.length + files.length;
    if (totalImages > MAX_IMAGES) {
      setMessage({ 
        type: 'error', 
        text: `Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} ảnh. Hiện tại đã có ${images.length} ảnh.` 
      });
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Chỉ chấp nhận định dạng JPG, PNG, WEBP`);
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Kích thước vượt quá 5MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join('\n') });
      return;
    }

    if (validFiles.length === 0) {
      setMessage({ type: 'error', text: 'Không có file hợp lệ để tải lên' });
      return;
    }

    // Create preview URLs
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setSelectedFiles(validFiles);
    setPreviewUrls(urls);
    setMessage({ type: '', text: '' });
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `menu/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Lỗi tải ảnh: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
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

      for (let i = 0; i < selectedFiles.length; i++) {
        try {
          const file = selectedFiles[i];
          const imageUrl = await uploadImage(file);

          const { error } = await supabase
            .from('menu_images')
            .insert({
              image_url: imageUrl,
              branch_id: branchId,
              display_order: maxOrder + i + 1,
              is_active: true,
            });

          if (error) {
            console.error('Database insert error:', error);
            throw new Error(`Lỗi lưu thông tin ảnh: ${error.message}`);
          }

          successCount++;
        } catch (error: any) {
          console.error(`Error uploading file ${i + 1}:`, error);
          setMessage({ 
            type: 'error', 
            text: `Lỗi tải ảnh ${i + 1}: ${error.message || 'Có lỗi xảy ra'}` 
          });
          break;
        }
      }

      if (successCount > 0) {
        setMessage({ type: 'success', text: `Đã tải lên ${successCount} ảnh thành công!` });
        setSelectedFiles([]);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        await loadImages();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi tải ảnh' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from('menu_images')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Lỗi xóa ảnh: ${error.message}`);
      }

      // Try to delete from storage (optional, don't fail if it doesn't work)
      try {
        const urlParts = imageUrl.split('/');
        const bucketIndex = urlParts.findIndex(part => part === 'images');
        if (bucketIndex !== -1) {
          const path = urlParts.slice(bucketIndex + 1).join('/');
          await supabase.storage.from('images').remove([path]);
        }
      } catch (storageError) {
        console.warn('Storage delete warning:', storageError);
      }

      setMessage({ type: 'success', text: 'Xóa ảnh thành công!' });
      await loadImages();
    } catch (error: any) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi xóa ảnh' });
    }
  };

  const cancelSelection = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-gray-900 animate-spin mb-3"></i>
          <p className="text-gray-700 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  const canUploadMore = images.length < MAX_IMAGES;
  const remainingSlots = MAX_IMAGES - images.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý ảnh menu</h2>
          <p className="text-gray-700 font-medium text-sm mt-1">
            Tải lên {MIN_IMAGES}-{MAX_IMAGES} ảnh menu (Hiện có: {images.length}/{MAX_IMAGES})
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl whitespace-pre-line font-semibold ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Upload Section */}
      {canUploadMore && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tải ảnh mới lên (Còn {remainingSlots} vị trí)
          </h3>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#E84118] transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="menu-image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="menu-image-upload"
                className="cursor-pointer block"
              >
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-upload-cloud-2-line text-5xl text-gray-400"></i>
                </div>
                <p className="text-gray-900 font-semibold mb-2">
                  Nhấn để chọn ảnh hoặc kéo thả vào đây
                </p>
                <p className="text-gray-600 text-sm">
                  JPG, PNG, WEBP • Tối đa 5MB mỗi ảnh • Tối đa {remainingSlots} ảnh
                </p>
              </label>
            </div>

            {/* Preview Selected Images */}
            {previewUrls.length > 0 && (
              <div>
                <h4 className="text-gray-900 font-semibold mb-3">
                  Ảnh đã chọn ({selectedFiles.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-white text-xs font-semibold">
                          {(selectedFiles[index].size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 py-3 bg-gradient-to-r from-[#E84118] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center">
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Đang tải lên...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <i className="ri-upload-2-line mr-2"></i>
                        Tải lên {selectedFiles.length} ảnh
                      </span>
                    )}
                  </button>
                  <button
                    onClick={cancelSelection}
                    disabled={uploading}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Images */}
      {images.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ảnh menu hiện tại ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={image.image_url}
                    alt={`Menu ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(image.id, image.image_url)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    Xóa
                  </button>
                </div>

                {/* Order Badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-white text-xs font-semibold">#{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <i className="ri-image-line text-6xl text-gray-300"></i>
          </div>
          <p className="text-gray-700 font-semibold">Chưa có ảnh menu nào</p>
          <p className="text-gray-600 text-sm mt-2">
            Tải lên {MIN_IMAGES}-{MAX_IMAGES} ảnh để hiển thị trong menu
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 flex items-center justify-center mt-0.5">
            <i className="ri-information-line text-blue-600 text-xl"></i>
          </div>
          <div className="flex-1">
            <h4 className="text-blue-900 font-semibold mb-2">Lưu ý khi tải ảnh:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Chỉ chấp nhận định dạng: JPG, PNG, WEBP</li>
              <li>• Kích thước tối đa mỗi ảnh: 5MB</li>
              <li>• Số lượng ảnh: {MIN_IMAGES}-{MAX_IMAGES} ảnh</li>
              <li>• Ảnh nên có tỷ lệ 4:3 để hiển thị đẹp nhất</li>
              <li>• Ảnh sẽ hiển thị khi người dùng nhấn nút "XEM MENU"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
