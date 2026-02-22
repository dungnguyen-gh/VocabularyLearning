import React from 'react';

interface VocabItemProps {
  word: string;
  ipa?: string;
  meaning: string;
  example: string;
  showMeaning: boolean;
  onToggle: () => void;
}

export default function VocabItem({ word, ipa, meaning, example, showMeaning, onToggle }: VocabItemProps) {
  return (
    <div style={styles.container}>
      <h2 style={styles.word}>{word}</h2>
      {ipa && <span style={styles.ipa}>{ipa}</span>}
      
      {!showMeaning ? (
        <button onClick={onToggle} style={styles.revealButton}>
          Show Meaning
        </button>
      ) : (
        <div style={styles.meaningSection}>
          <p style={styles.meaning}>{meaning}</p>
          <p style={styles.example}>"{example}"</p>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    textAlign: 'center',
    padding: '30px 0',
  },
  word: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#333',
  },
  ipa: {
    color: '#888',
    fontSize: '1.1rem',
  },
  revealButton: {
    marginTop: '25px',
    padding: '12px 32px',
    background: '#f0f4ff',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  meaningSection: {
    marginTop: '25px',
  },
  meaning: {
    fontSize: '1.2rem',
    color: '#444',
    marginBottom: '15px',
    lineHeight: 1.5,
  },
  example: {
    fontSize: '1rem',
    color: '#666',
    fontStyle: 'italic',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
};
