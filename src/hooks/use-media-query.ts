import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Initial check
    setMatches(media.matches);

    // Update matches when media query changes
    function updateMatches() {
      setMatches(media.matches);
    }

    // Add listener
    media.addEventListener("change", updateMatches);

    // Cleanup
    return () => {
      media.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
} 