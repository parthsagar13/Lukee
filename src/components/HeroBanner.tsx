import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  to?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: 'banner-1', image: '/banner/01.webp', alt: 'Lukee festive offer banner', to: '/shop' },
  { id: 'banner-2', image: '/banner/02.webp', alt: 'Lukee collection banner', to: '/shop' },
  { id: 'banner-3', image: '/banner/03.webp', alt: 'Lukee jewellery banner', to: '/shop' },
  { id: 'banner-4', image: '/banner/04.webp', alt: 'Lukee promotional banner', to: '/shop' },
];

const AUTO_MS = 3000;
const DRAG_THRESHOLD_PX = 48;

export const HeroBanner: React.FC<{ slides?: HeroSlide[] }> = ({
  slides = DEFAULT_SLIDES,
}) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number | null>(null);
  const draggedRef = useRef(false);
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (paused || isDragging || count <= 1) return;
    const timer = window.setInterval(() => goTo(index + 1), AUTO_MS);
    return () => window.clearInterval(timer);
  }, [index, paused, isDragging, count, goTo]);

  const finishDrag = useCallback(
    (clientX: number) => {
      if (dragStartXRef.current === null) return;

      const delta = clientX - dragStartXRef.current;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
        draggedRef.current = true;
        goTo(delta < 0 ? index + 1 : index - 1);
      }

      dragStartXRef.current = null;
      setDragOffset(0);
      setIsDragging(false);
    },
    [goTo, index]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (count <= 1 || e.button !== 0) return;
    e.preventDefault();
    draggedRef.current = false;
    dragStartXRef.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return;
    const delta = e.clientX - dragStartXRef.current;
    if (Math.abs(delta) > 6) draggedRef.current = true;
    setDragOffset(delta);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    finishDrag(e.clientX);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragStartXRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const trackTransform =
    count <= 1
      ? undefined
      : isDragging
        ? `translate3d(calc(-${(index * 100) / count}% + ${dragOffset}px), 0, 0)`
        : `translate3d(-${(index * 100) / count}%, 0, 0)`;

  return (
    <section
      id="hero-banner"
      className="relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`relative w-full aspect-[16/7] min-h-[280px] max-h-[960px] sm:min-h-[360px] md:min-h-[480px] lg:min-h-[560px] overflow-hidden select-none touch-none ${
          count > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className={`flex h-full ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
          style={{
            width: `${count * 100}%`,
            transform: trackTransform,
          }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative h-full shrink-0"
              style={{ width: `${100 / count}%` }}
            >
              {slide.to ? (
                <Link
                  to={slide.to}
                  className="absolute inset-0 block"
                  aria-label={slide.alt}
                  draggable={false}
                  onClick={(e) => {
                    if (draggedRef.current) e.preventDefault();
                  }}
                  onDragStart={(e) => e.preventDefault()}
                >
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
                    draggable={false}
                  />
                </Link>
              ) : (
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  draggable={false}
                />
              )}
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white sm:left-5 sm:h-11 sm:w-11"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white sm:right-5 sm:h-11 sm:w-11"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2 sm:bottom-5 pointer-events-none">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to banner ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`pointer-events-auto h-1.5 rounded-full transition-all duration-500 ${
                    i === index ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
