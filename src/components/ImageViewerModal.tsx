import React, { useState } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut, Maximize2, MoveLeft, MoveRight, Trash2 } from 'lucide-react';
import { PageImageItem } from '../types';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: PageImageItem[];
  initialIndex?: number;
  onUpdateImage?: (updatedImages: PageImageItem[]) => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  onUpdateImage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState<number>(images[initialIndex]?.rotation || 0);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setRotation(images[nextIdx]?.rotation || 0);
      setZoomLevel(1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setRotation(images[prevIdx]?.rotation || 0);
      setZoomLevel(1);
    }
  };

  const handleRotate = () => {
    const newRot = (rotation + 90) % 360;
    setRotation(newRot);
    if (onUpdateImage) {
      const updated = [...images];
      updated[currentIndex] = { ...updated[currentIndex], rotation: newRot };
      onUpdateImage(updated);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
      {/* Top control bar */}
      <div className="px-6 py-3.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm truncate max-w-xs">
            {currentImage.name || `Trang ${currentImage.pageNumber}`}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 font-mono">
            Trang {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            title="Thu nhỏ"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300 w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Phóng to"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Kích thước gốc"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-xs font-medium"
          >
            100%
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={handleRotate}
            title="Xoay ảnh 90 độ"
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Xoay 90°</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg z-20"
            >
              <MoveLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg z-20"
            >
              <MoveRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="w-full h-full flex items-center justify-center overflow-auto p-4 select-none">
          <div
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="max-w-full max-h-full flex items-center justify-center"
          >
            <img
              src={currentImage.url}
              alt={currentImage.name}
              className="max-h-[82vh] max-w-[85vw] object-contain rounded-lg shadow-2xl bg-white"
            />
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-2.5 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => {
                setCurrentIndex(idx);
                setRotation(img.rotation || 0);
              }}
              className={`relative shrink-0 w-14 h-18 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'border-indigo-500 ring-2 ring-indigo-400/30 scale-105'
                  : 'border-slate-700 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={`Trang ${idx + 1}`}
                style={{ transform: `rotate(${img.rotation || 0}deg)` }}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-center text-white font-mono py-0.5">
                P.{idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
