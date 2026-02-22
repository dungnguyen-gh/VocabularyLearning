import React from 'react';

interface QuizQuestionProps {
  index: number;
  type: 'multiple_choice' | 'fill_blank';
  question: string;
  options?: string[];
  hint?: string;
  selectedAnswer: string;
  onAnswer: (answer: string) => void;
}

export default function QuizQuestion({ 
  index, 
  type, 
  question, 
  options, 
  hint, 
  selectedAnswer, 
  onAnswer 
}: QuizQuestionProps) {
  return (
    <div style={styles.container}>
      <div style={styles.questionNumber}>Question {index + 1}</div>
      <p style={styles.questionText}>{question}</p>
      
      {hint && (
        <p style={styles.hint}>Hint: {hint}</p>
      )}

      {type === 'multiple_choice' && options ? (
        <div style={styles.options}>
          {options.map((option, optIdx) => (
            <button
              key={optIdx}
              onClick={() => onAnswer(option)}
              style={{
                ...styles.optionButton,
                ...(selectedAnswer === option ? styles.optionButtonSelected : {}),
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={selectedAnswer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Type your answer..."
          style={styles.textInput}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '15px',
  },
  questionNumber: {
    fontSize: '0.85rem',
    color: '#667eea',
    fontWeight: '600',
    marginBottom: '10px',
  },
  questionText: {
    fontSize: '1.1rem',
    margin: '0 0 15px 0',
    color: '#333',
  },
  hint: {
    fontSize: '0.9rem',
    color: '#888',
    fontStyle: 'italic',
    marginBottom: '15px',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionButton: {
    padding: '12px 16px',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  optionButtonSelected: {
    borderColor: '#667eea',
    background: '#f0f4ff',
  },
  textInput: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
};
