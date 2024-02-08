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

  return <div>Loading {loadingChar}</div>;
};