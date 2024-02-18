import React, { useState, useEffect } from 'react';

export const LoadingIndicator = () => {
  const [loadingChar, setLoadingChar] = useState('|');

  useEffect(() => {
    const chars = ['\\', '|', '/', '-'];
    let charIndex = 0;

    const intervalId = setInterval(() => {
      setLoadingChar(chars[charIndex]);
      charIndex = (charIndex + 1) % chars.length;
    }, 300); // Update every 100ms

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
        <div className="text-white text-2xl"> {loadingChar}</div>
      </div>
    </div>
  );
};
