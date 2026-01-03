import { useState, useEffect, useRef } from 'react';

interface SpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ id: string; image_url: string; title: string; description: string }>;
  initialIndex?: number;
}

export default function SpaceModal({ isOpen, onClose, images, initialIndex = 0 }: SpaceModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'fullscreen'>('grid');

  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  const touchStartDistance = useRef(0);
  const touchStartScale = useRef(1);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const lastTouchTime = useRef(0);
  const swipeStartX = useRef(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const handleClose = () => {
    if (viewMode === 'fullscreen') {
      // Nếu đang ở chế độ toàn màn hình, quay về chế độ lưới
      setViewMode('grid');
      resetZoom();
    } else {
      // Nếu đang ở chế độ lưới, đóng popup
      onClose();
    }
  };

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setViewMode('grid');
    resetZoom();
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'fullscreen') {
          setViewMode('grid');
          resetZoom();
        } else {
          onClose();
        }
      } else if (viewMode === 'fullscreen') {
        if (e.key === 'ArrowLeft') {
          handlePrevious();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, viewMode]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.touchAction = 'none';
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
    if (viewMode !== 'fullscreen') return;
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
    if (viewMode !== 'fullscreen' || scaleRef.current <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - positionRef.current.x, y: e.clientY - positionRef.current.y });
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
    if (viewMode !== 'fullscreen') return;
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
    if (viewMode !== 'fullscreen') return;
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
    if (viewMode !== 'fullscreen') return;
    e.stopPropagation();
    
    const touchDuration = Date.now() - lastTouchTime.current;
    
    if (e.changedTouches.length === 1 && scaleRef.current === 1 && touchDuration < 300) {
      const touch = e.changedTouches[0];
      const swipeDistance = touch.clientX - swipeStartX.current;
      
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0 && currentIndex > 0) {
          handlePrevious();
        } else if (swipeDistance < 0 && currentIndex < images.length - 1) {
          handleNext();
        }
      }
    }
    
    setIsDragging(false);
    touchStartDistance.current = 0;
  };

  const handleImageClick = () => {
    if (viewMode === 'fullscreen' && isZoomed) {
      setShowControls(prev => !prev);
      hideControlsTemporarily();
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetZoom();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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

  const openFullscreen = (index: number) => {
    setCurrentIndex(index);
    setViewMode('fullscreen');
    resetZoom();
  };

  const closeFullscreen = () => {
    setViewMode('grid');
    resetZoom();
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 w-12 h-12 md:w-12 md:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-50"
      >
        <i className="ri-close-line text-2xl"></i>
      </button>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-8">KHÔNG GIAN QUÁN</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => openFullscreen(index)}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer w-full"
                >
                  <img
                    src={img.image_url}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-medium">{img.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Fullscreen View */
          <>
            {/* Back to Grid Button */}
            <button
              onClick={closeFullscreen}
              className={`absolute top-4 left-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{ transition: 'opacity 0.3s ease' }}
              aria-label="Quay lại lưới"
            >
              <i className="ri-grid-line text-2xl"></i>
            </button>

            {/* Zoom Controls */}
            <div
              className={`absolute top-4 left-20 flex items-center gap-2 z-10 ${
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{ transition: 'opacity 0.3s ease' }}
            >
              <button
                onClick={resetZoom}
                className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer"
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
                {currentIndex + 1} / {images.length}
              </span>
            </div>

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-10 ${
                  showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                style={{ transition: 'opacity 0.3s ease' }}
              >
                <i className="ri-arrow-left-line text-2xl"></i>
              </button>
            )}

            {currentIndex < images.length - 1 && (
              <button
                onClick={handleNext}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-10 ${
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
              onClick={handleImageClick}
              style={{ 
                cursor: scaleRef.current > 1 ? 'move' : 'default',
                touchAction: 'none'
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={currentImage.image_url}
                  alt={currentImage.title}
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
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setCurrentIndex(index);
                      resetZoom();
                    }}
                    className={`flex-shrink-0 rounded-lg overflow-hidden transition-all cursor-pointer ${
                      index === currentIndex
                        ? 'ring-2 ring-[#E84118] w-12 h-12 md:w-16 md:h-16'
                        : 'opacity-50 hover:opacity-100 w-12 h-12 md:w-16 md:h-16'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={img.title}
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
                <i className="ri-mouse-line"></i> Cuộn chuột để zoom • Kéo để di chuyển • Nhấn <i className="ri-grid-line"></i> để quay lại lưới
              </p>
              <p className="md:hidden">
                <i className="ri-hand-finger-line"></i> Vuốt để chuyển ảnh • 2 ngón để zoom • Nhấn <i className="ri-grid-line"></i> để quay lại
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
