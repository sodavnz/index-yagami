import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId?: string;
}

interface MenuImage {
  id: string;
  image_url: string;
  display_order: number;
}

export default function MenuModal({ isOpen, onClose, branchId }: MenuModalProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [menuImages, setMenuImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  const touchStartDistance = useRef(0);
  const touchStartScale = useRef(1);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const lastTouchTime = useRef(0);
  const swipeStartX = useRef(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      loadMenuImages();
    }
  }, [isOpen, branchId]);

  const loadMenuImages = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('menu_images')
        .select('image_url, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      // Filter by branch if branchId is provided
      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Extract image URLs from data
      const imageUrls = (data || []).map(item => item.image_url);
      setMenuImages(imageUrls);
    } catch (error) {
      console.error('Error loading menu images:', error);
      setMenuImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.touchAction = 'none';
      setScale(1);
      setPosition({ x: 0, y: 0 });
      scaleRef.current = 1;
      positionRef.current = { x: 0, y: 0 };
      setIsZoomed(false);
      setShowControls(true);
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
      document.documentElement.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
      document.documentElement.style.touchAction = 'auto';
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const hideControlsTemporarily = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isZoomed) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(1, scaleRef.current + delta), 4);
    scaleRef.current = newScale;
    setScale(newScale);
    setIsZoomed(newScale > 1);
    if (newScale === 1) {
      positionRef.current = { x: 0, y: 0 };
      setPosition({ x: 0, y: 0 });
      setShowControls(true);
    } else {
      hideControlsTemporarily();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scaleRef.current > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - positionRef.current.x, y: e.clientY - positionRef.current.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scaleRef.current > 1) {
      const newPos = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      positionRef.current = newPos;
      setPosition(newPos);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getTouchDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      touchStartDistance.current = distance;
      touchStartScale.current = scaleRef.current;
      lastTouchTime.current = Date.now();
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      swipeStartX.current = touch.clientX;
      
      if (scaleRef.current > 1) {
        e.preventDefault();
        setIsDragging(true);
        touchStartPos.current = {
          x: touch.clientX - positionRef.current.x,
          y: touch.clientY - positionRef.current.y
        };
      }
      lastTouchTime.current = Date.now();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();

    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const scale = touchStartScale.current * (distance / touchStartDistance.current);
      const newScale = Math.min(Math.max(1, scale), 4);
      
      scaleRef.current = newScale;
      setScale(newScale);
      setIsZoomed(newScale > 1);
      
      if (newScale === 1) {
        positionRef.current = { x: 0, y: 0 };
        setPosition({ x: 0, y: 0 });
        setShowControls(true);
      } else {
        hideControlsTemporarily();
      }
    } else if (e.touches.length === 1) {
      if (scaleRef.current > 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const newPos = {
          x: touch.clientX - touchStartPos.current.x,
          y: touch.clientY - touchStartPos.current.y
        };
        positionRef.current = newPos;
        setPosition(newPos);
        hideControlsTemporarily();
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    
    const touchDuration = Date.now() - lastTouchTime.current;
    
    if (e.changedTouches.length === 1 && scaleRef.current === 1 && touchDuration < 300) {
      const touch = e.changedTouches[0];
      const swipeDistance = touch.clientX - swipeStartX.current;
      
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0 && currentImage > 0) {
          prevImage();
        } else if (swipeDistance < 0 && currentImage < menuImages.length - 1) {
          nextImage();
        }
      }
    }
    
    setIsDragging(false);
    touchStartDistance.current = 0;
  };

  const handleContainerClick = () => {
    if (isZoomed) {
      setShowControls(prev => !prev);
      hideControlsTemporarily();
    }
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % menuImages.length);
    resetZoom();
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + menuImages.length) % menuImages.length);
    resetZoom();
  };

  const resetZoom = () => {
    scaleRef.current = 1;
    positionRef.current = { x: 0, y: 0 };
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
    setShowControls(true);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
        <div className="text-white text-center">
          <i className="ri-loader-4-line text-4xl animate-spin mb-4"></i>
          <p>Đang tải menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      {/* Close Button */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 w-12 h-12 md:w-12 md:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transition: 'opacity 0.3s ease' }}
      >
        <i className="ri-close-line text-2xl"></i>
      </button>

      {/* Zoom Controls */}
      <div
        className={`absolute top-4 left-4 flex items-center gap-2 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transition: 'opacity 0.3s ease' }}
      >
        <button
          onClick={resetZoom}
          className="w-10 h-10 md:w-10 md:h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer"
          title="Reset Zoom"
        >
          <i className="ri-zoom-out-line text-xl"></i>
        </button>
        <span className="text-white text-sm bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Image Counter */}
      <div
        className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transition: 'opacity 0.3s ease' }}
      >
        <span className="text-white text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          {currentImage + 1} / {menuImages.length}
        </span>
      </div>

      {/* Navigation Arrows */}
      {currentImage > 0 && (
        <button
          onClick={prevImage}
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-12 md:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-10 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ transition: 'opacity 0.3s ease' }}
        >
          <i className="ri-arrow-left-line text-2xl"></i>
        </button>
      )}

      {currentImage < menuImages.length - 1 && (
        <button
          onClick={nextImage}
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-12 md:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-10 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ transition: 'opacity 0.3s ease' }}
        >
          <i className="ri-arrow-right-line text-2xl"></i>
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden pb-24 md:pb-28"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleContainerClick}
        style={{ 
          cursor: scaleRef.current > 1 ? 'move' : 'default',
          touchAction: 'none'
        }}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <img
            src={menuImages[currentImage]}
            alt={`Menu ${currentImage + 1}`}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging || touchStartDistance.current > 0 ? 'none' : 'transform 0.2s ease-out'
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div
        className={`fixed bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transition: 'opacity 0.3s ease' }}
      >
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3 py-2 max-w-[90vw] overflow-x-auto">
          {menuImages.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImage(index);
                resetZoom();
              }}
              className={`flex-shrink-0 rounded-lg overflow-hidden transition-all cursor-pointer ${
                index === currentImage
                  ? 'ring-2 ring-[#E84118] w-12 h-12 md:w-16 md:h-16'
                  : 'opacity-50 hover:opacity-100 w-12 h-12 md:w-16 md:h-16'
              }`}
            >
              <img
                src={img}
                alt={`Menu ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transition: 'opacity 0.3s ease' }}
      >
        <p className="hidden md:block">
          <i className="ri-mouse-line"></i> Cuộn chuột để zoom • Kéo để di chuyển
        </p>
        <p className="md:hidden">
          <i className="ri-hand-finger-line"></i> Vuốt để chuyển ảnh • 2 ngón để zoom
        </p>
      </div>
    </div>
  );
}
