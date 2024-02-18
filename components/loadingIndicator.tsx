import React, { useState, useEffect } from 'react';

export const LoadingIndicator = () => {
  const [loadingChar, setLoadingChar] = useState('|');

  useEffect(() => {
    const chars = ['\\', '|', '/', '-'];
    let charIndex = 0;

    const intervalId = setInterval(() => {
      setLoadingChar(chars[charIndex]);
      charIndex = (charIndex + 1) % chars.length;
    }, 100); // Update every 100ms

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-primary">
      <div className="text-white text-4xl">Loading {loadingChar}</div>
    </div>
  );
};
