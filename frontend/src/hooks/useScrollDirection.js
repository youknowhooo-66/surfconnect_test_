import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [prevOffset, setPrevOffset] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      
      // Minimum scroll to trigger hide
      if (currentOffset < 10) {
        setVisible(true);
        setPrevOffset(currentOffset);
        return;
      }

      if (currentOffset > prevOffset) {
        // Scrolling down
        setVisible(false);
      } else {
        // Scrolling up
        setVisible(true);
      }
      
      setPrevOffset(currentOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevOffset]);

  return visible;
}
