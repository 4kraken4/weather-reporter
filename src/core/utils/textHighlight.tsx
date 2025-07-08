import React from 'react';

/**
 * Highlights matching text in a string with theme-appropriate styling
 * @param text - The text to highlight
 * @param searchTerm - The search term to highlight
 * @returns JSX element with highlighted text
 */
export const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) {
    return text;
  }

  // Create a regex pattern that matches the search term case-insensitively
  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case-insensitive)
        const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
        const key = `${part}-${index}-${isMatch}`;
        return isMatch ? (
          <mark key={key} className='search-highlight'>
            {part}
          </mark>
        ) : (
          <span key={key}>{part}</span>
        );
      })}
    </>
  );
};
