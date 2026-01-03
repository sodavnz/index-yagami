import { useState, useEffect } from 'react';

interface GalleryModalProps {
  images: { url: string; title: string }[];
  currentIndex: number;
  onClose: () => void;
}

export default function GalleryModal({ images, currentIndex, onClose }: GalleryModalProps) {
  const [currentImage, setCurrentImage] = useState(currentIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState(0);

  useEffect(() => {
    setCurrentImage(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (images) {
      document.body.style.overflow = 'hidden';
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [images]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(1, scale + delta), 3);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getTouchDistance = (touches: React.TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setTouchDistance(distance);
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const delta = (distance - touchDistance) * 0.01;
      const newScale = Math.min(Math.max(1, scale + delta), 3);
      setScale(newScale);
      setTouchDistance(distance);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(0);
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-10"
      >
        <i className="ri-close-line text-2xl"></i>
      </button>

      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
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

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-white font-semibold">{images[currentImage].title}</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <span className="text-white text-sm bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
          {currentImage + 1} / {images.length}
        </span>
      </div>

      {currentImage > 0 && (
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-10"
        >
          <i className="ri-arrow-left-line text-2xl"></i>
        </button>
      )}

      {currentImage < images.length - 1 && (
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-10"
        >
          <i className="ri-arrow-right-line text-2xl"></i>
        </button>
      )}

      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <img
            src={images[currentImage].url}
            alt={images[currentImage].title}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              cursor: scale > 1 ? 'move' : 'default'
            }}
            draggable={false}
          />
        </div>
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center">
        <p className="mb-1">
          <i className="ri-mouse-line"></i> Cuộn chuột để phóng to/thu nhỏ
        </p>
        <p>
          <i className="ri-hand-finger-line"></i> 2 ngón tay để phóng to trên điện thoại
        </p>
      </div>
    </div>
  );
}
