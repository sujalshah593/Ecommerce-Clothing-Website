import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const InteractiveClothesRail = ({ products = [] }) => {
  const navigate = useNavigate();
  const railRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, lastX: 0, lastTime: 0, velocity: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const railProducts = useMemo(() => products.filter((product) => product?._id && product.image), [products]);
  const activeProduct = railProducts[activeIndex];

  const selectProduct = useCallback((index) => {
    if (!railProducts.length) return;
    const nextIndex = clamp(index, 0, railProducts.length - 1);
    setActiveIndex(nextIndex);
  }, [railProducts]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!railProducts.length) return;
      if (event.key === "ArrowRight") selectProduct(activeIndex + 1);
      if (event.key === "ArrowLeft") selectProduct(activeIndex - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, railProducts.length, selectProduct]);

  const snapTo = useCallback((index) => {
    setDragOffset(0);
    selectProduct(index);
  }, [selectProduct]);

  const handleGarmentClick = (index) => {
    if (Math.abs(dragRef.current.lastX - dragRef.current.startX) >= 8) return;
    navigate(`/product/${railProducts[index]._id}`);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = { active: true, startX: event.clientX, lastX: event.clientX, lastTime: performance.now(), velocity: 0 };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;
    const now = performance.now();
    const delta = event.clientX - dragRef.current.lastX;
    const elapsed = Math.max(now - dragRef.current.lastTime, 1);
    dragRef.current.velocity = delta / elapsed;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastTime = now;
    setDragOffset((offset) => offset + delta);
  };

  const handlePointerUp = () => {
    if (!dragRef.current.active) return;
    const distance = dragRef.current.lastX - dragRef.current.startX;
    const projectedDistance = distance + dragRef.current.velocity * 140;
    dragRef.current.active = false;
    setIsDragging(false);
    if (Math.abs(projectedDistance) > 48) {
      snapTo(activeIndex + (projectedDistance < 0 ? 1 : -1));
    } else {
      setDragOffset(0);
    }
  };

  if (!railProducts.length) return null;

  return (
    <section className="clothes-rail-section" aria-label="New arrivals interactive showcase">
      <div className="clothes-rail-shell">
        <div className="clothes-rail-heading">
          <div>
            <p className="clothes-rail-kicker"><Sparkles size={13} /> New arrivals</p>
            <h2>Pieces with a point of view.</h2>
          </div>
          <p className="clothes-rail-helper">Drag to explore<br />the latest edit</p>
        </div>

        <div className="clothes-rail-layout">
          <div
            ref={railRef}
            className={`clothes-rail-stage ${isDragging ? "is-dragging" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            role="listbox"
            aria-label="New arrival garments"
            aria-activedescendant={`rail-product-${activeProduct?._id}`}
            tabIndex={0}
          >
            <div className="clothes-rail-bar" aria-hidden="true"><span /></div>
            <div className="clothes-rail-floor" aria-hidden="true" />
            <div className="clothes-rail-track" style={{ transform: `translateX(${dragOffset}px)` }}>
              {railProducts.map((product, index) => {
                const layoutIndex = Math.floor((railProducts.length - 1) / 2);
                const relative = index - layoutIndex;
                const isHovered = index === hoveredIndex;
                return (
                  <button
                    type="button"
                    key={product._id}
                    id={`rail-product-${product._id}`}
                    className={`rail-garment ${isHovered ? "is-hovered" : ""}`}
                    style={{ "--rail-depth": relative, "--rail-offset": `${relative * 144}px` }}
                    onClick={() => handleGarmentClick(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    role="option"
                    aria-selected={false}
                    aria-label={`View ${product.name}`}
                  >
                    <span className="rail-hanger" aria-hidden="true"><i /><b /></span>
                    <span className="rail-garment-shadow" aria-hidden="true" />
                    <img src={product.image} alt="" loading="lazy" draggable="false" />
                    <span className="rail-garment-caption">{product.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="clothes-rail-controls">
              <button type="button" onClick={() => snapTo(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Previous garment"><ArrowLeft size={17} /></button>
              <div className="rail-progress" aria-label={`Garment ${activeIndex + 1} of ${railProducts.length}`}>
                {railProducts.map((product, index) => <button type="button" key={product._id} onClick={() => snapTo(index)} className={index === activeIndex ? "is-active" : ""} aria-label={`Go to garment ${index + 1}`} />)}
              </div>
              <button type="button" onClick={() => snapTo(activeIndex + 1)} disabled={activeIndex === railProducts.length - 1} aria-label="Next garment"><ArrowRight size={17} /></button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InteractiveClothesRail;
