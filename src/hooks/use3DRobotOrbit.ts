"use client";

import { useState, useRef, useCallback } from "react";

interface OrbitRotation {
  x: number;
  y: number;
}

interface EyePosition {
  x: number;
  y: number;
}

export function use3DRobotOrbit(
  initialRotation: OrbitRotation = { x: -4, y: 8 },
  maxTiltAngle: number = 16,
  maxEyeOffset: { x: number; y: number } = { x: 8, y: 6 }
) {
  const [rotation, setRotation] = useState<OrbitRotation>(initialRotation);
  const [eyePos, setEyePos] = useState<EyePosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse hover 3D tilt tracking & eye pupil offset
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotY = (mouseX / (rect.width / 2)) * maxTiltAngle;
      const rotX = -(mouseY / (rect.height / 2)) * maxTiltAngle;
      setRotation({ x: rotX, y: rotY });

      const eyeX = (mouseX / (rect.width / 2)) * maxEyeOffset.x;
      const eyeY = (mouseY / (rect.height / 2)) * maxEyeOffset.y;
      setEyePos({ x: eyeX, y: eyeY });
    },
    [isDragging, maxTiltAngle, maxEyeOffset.x, maxEyeOffset.y]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setRotation(initialRotation);
      setEyePos({ x: 0, y: 0 });
    }
  }, [isDragging, initialRotation]);

  // Drag 3D Orbit Handlers
  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      setDragStart({ x: clientX - rotation.y * 3, y: clientY - rotation.x * 3 });
    },
    [rotation.x, rotation.y]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const newY = (clientX - dragStart.x) / 3;
      const newX = (clientY - dragStart.y) / 3;
      const clampedX = Math.max(-25, Math.min(25, newX));
      const clampedY = Math.max(-40, Math.min(40, newY));
      setRotation({ x: clampedX, y: clampedY });
    },
    [isDragging, dragStart.x, dragStart.y]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetRotation = useCallback(() => {
    setRotation(initialRotation);
    setEyePos({ x: 0, y: 0 });
  }, [initialRotation]);

  return {
    containerRef,
    rotation,
    eyePos,
    isDragging,
    handleMouseMove,
    handleMouseLeave,
    handleStart,
    handleMove,
    handleEnd,
    resetRotation,
  };
}
