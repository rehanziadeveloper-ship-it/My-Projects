import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function ImageModal({ images = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Refs for tracking gestures
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef(null);
  const pinchStartScaleRef = useRef(1);
  const lastTapRef = useRef(0);

  // Keep currentIndex updated if initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetZoom();
  }, [initialIndex]);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!images || images.length === 0) return null;
  const currentImage = images[currentIndex];

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  };

  const zoomIn = (e) => {
    if (e) e.stopPropagation();
    setScale((s) => Math.min(Number((s + 0.5).toFixed(1)), 4));
  };

  const zoomOut = (e) => {
    if (e) e.stopPropagation();
    setScale((s) => {
      const next = Math.max(Number((s - 0.5).toFixed(1)), 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Double tap to quick zoom toggle
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch to zoom start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = scale;
      isDraggingRef.current = false;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap toggle
        if (scale > 1) {
          resetZoom();
        } else {
          setScale(2.5);
        }
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      // Pan/drag start
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      posStartRef.current = { ...position };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / pinchStartDistRef.current;
      const newScale = Math.min(Math.max(pinchStartScaleRef.current * factor, 1), 4);
      setScale(Number(newScale.toFixed(2)));
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDraggingRef.current && scale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPosition({
        x: posStartRef.current.x + dx,
        y: posStartRef.current.y + dy
      });
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    pinchStartDistRef.current = null;
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Mouse drag for desktop
  const handleMouseDown = (e) => {
    if (scale > 1) {
      e.preventDefault();
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      posStartRef.current = { ...position };
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingRef.current && scale > 1) {
      e.preventDefault();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: posStartRef.current.x + dx,
        y: posStartRef.current.y + dy
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((s) => Math.min(Number((s + 0.25).toFixed(2)), 4));
    } else {
      setScale((s) => {
        const next = Math.max(Number((s - 0.25).toFixed(2)), 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md select-none touch-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-stone-900/90 text-white z-20 border-b border-stone-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-extrabold text-amber-400 text-sm sm:text-base">Deewan-E-Khaas Menu</span>
          <span className="text-[11px] sm:text-xs bg-stone-800 border border-stone-700 text-stone-200 px-2.5 py-1 rounded-full font-medium">
            Page {currentIndex + 1} of {images.length}
          </span>
        </div>

        {/* Page Switcher Buttons in Top Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                resetZoom();
              }}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition ${
                currentIndex === idx
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              Page {idx + 1}
            </button>
          ))}

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-red-600/30 text-stone-300 hover:text-red-400 active:scale-95 transition ml-1.5"
            title="Close Menu (Esc)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport Area */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden p-1 sm:p-3 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <img
          src={currentImage}
          alt={`Deewan Menu Page ${currentIndex + 1}`}
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease-out'
          }}
          className="max-h-[82vh] max-w-[98vw] object-contain rounded-xl shadow-2xl pointer-events-auto"
        />

        {/* Left & Right Arrow Navigation for Quick Switching */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white transition border border-white/20 shadow-xl z-20"
              title="Previous Page"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white transition border border-white/20 shadow-xl z-20"
              title="Next Page"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-stone-900/95 border-t border-stone-800 flex items-center justify-between px-4 sm:px-8 z-20">
        <div className="text-[11px] sm:text-xs text-stone-400 hidden sm:block">
          💡 <span className="text-stone-300">Pinch, double-tap, or drag</span> to inspect dishes clearly.
        </div>

        {/* Floating Controls: Zoom Out, Percentage, Zoom In, Reset */}
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <button
            onClick={zoomOut}
            disabled={scale <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 active:scale-95 transition text-xs font-bold border border-stone-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
            <span className="hidden xs:inline">Zoom Out</span>
          </button>

          <span className="px-3 py-1.5 bg-stone-800 border border-stone-700 text-amber-400 font-mono font-bold text-xs rounded-xl min-w-[58px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= 4}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 active:scale-95 transition text-xs font-bold border border-stone-700"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
            <span className="hidden xs:inline">Zoom In</span>
          </button>

          <button
            onClick={resetZoom}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white active:scale-95 transition text-xs font-bold shadow-md"
            title="Reset Zoom (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-bold transition border border-stone-700 hidden sm:block"
        >
          Done
        </button>
      </div>
    </div>
  );
}
