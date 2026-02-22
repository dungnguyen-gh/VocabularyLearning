import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Question {
  vocabId: string;
  type: 'multiple_choice' | 'fill_blank';
  question: string;
  options?: string[];
  hint?: string;
}

interface QuizData {
  quizId: string;
  questions: Question[];
  total: number;
}

interface QuizResult {
  total: number;
  correct: number;
  score: number;
  corrections: Array<{
    vocabId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    type: string;
  }>;
}

export default function QuizPage() {
  const router = useRouter();
  const { id, topic, difficulty } = router.query;
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!id) return;

    // Quiz data is stored server-side, we need to fetch it differently
    // For now, we'll use the query params to regenerate or handle via session
    // In a real app, this would be fetched from a session store
    
    // Regenerate quiz for this demo
    const storedVocab = sessionStorage.getItem('currentVocab');
    if (storedVocab) {
      const vocab = JSON.parse(storedVocab);
      fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocab }),
      })
        .then(res => res.json())
        .then(data => {
          setQuizData(data);
          setLoading(false);
          // Store new quizId for submission
          sessionStorage.setItem('currentQuizId', data.quizId);
        })
        .catch(console.error);
    } else {
      // Redirect if no vocab data
      router.push('/');
    }
  }, [id, router]);

  // Store vocab when coming from study page
  useEffect(() => {
    const handleRouteChange = () => {
      const vocab = sessionStorage.getItem('currentVocab');
      if (!vocab) {
        // Try to get from URL params or redirect
      }
    };
    handleRouteChange();
  }, []);

  const handleAnswer = (vocabId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [vocabId]: answer }));
  };

  const handleSubmit = async () => {
    if (!quizData || !topic || !difficulty) return;
    
    setSubmitting(true);
    try {
      const quizId = sessionStorage.getItem('currentQuizId') || quizData.quizId;
      const answerArray = Object.entries(answers).map(([vocabId, answer]) => ({
        vocabId,
        answer,
      }));

      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers: answerArray,
          topic,
          difficulty,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = quizData && Object.keys(answers).length === quizData.total;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading quiz...</div>
      </div>
    );
  }

  if (result) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.resultHeader}>
            <div style={styles.scoreCircle}>
              <span style={styles.scoreNumber}>{result.correct}/{result.total}</span>
              <span style={styles.scoreLabel}>Correct</span>
            </div>
            <div style={styles.xpDisplay}>
              <span style={styles.xpValue}>+{result.score} XP</span>
              {result.correct === result.total && (
                <span style={styles.bonusBadge}>🎉 Perfect! +20 Bonus</span>
              )}
            </div>
          </div>

          <div style={styles.corrections}>
            <h3 style={styles.correctionsTitle}>Review</h3>
            {result.corrections.map((correction, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.correctionItem,
                  background: correction.correct ? '#d4edda' : '#f8d7da',
                }}
              >
                <span style={styles.correctionStatus}>
                  {correction.correct ? '✅' : '❌'}
                </span>
                <div style={styles.correctionContent}>
                  <p><strong>Your answer:</strong> {correction.userAnswer || '(empty)'}</p>
                  {!correction.correct && (
                    <p><strong>Correct:</strong> {correction.correctAnswer}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/')}
            style={styles.homeButton}
          >
            Back to Home →
          </button>
        </div>
      </div>
    );
  }

  if (!quizData) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎯 Quiz Time</h1>
        <p style={styles.subtitle}>
          Answer all {quizData.total} questions
        </p>

        <div style={styles.questions}>
          {quizData.questions.map((q, idx) => (
            <div key={q.vocabId} style={styles.questionCard}>
              <div style={styles.questionNumber}>Question {idx + 1}</div>
              <p style={styles.questionText}>{q.question}</p>
              
              {q.hint && (
                <p style={styles.hint}>Hint: {q.hint}</p>
              )}

              {q.type === 'multiple_choice' && q.options ? (
                <div style={styles.options}>
                  {q.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswer(q.vocabId, option)}
                      style={{
                        ...styles.optionButton,
                        ...(answers[q.vocabId] === option ? styles.optionButtonSelected : {}),
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[q.vocabId] || ''}
                  onChange={(e) => handleAnswer(q.vocabId, e.target.value)}
                  placeholder="Type your answer..."
                  style={styles.textInput}
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          style={{
            ...styles.submitButton,
            ...((!allAnswered || submitting) ? styles.submitButtonDisabled : {}),
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Answers'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  loading: {
    color: 'white',
    fontSize: '1.5rem',
    textAlign: 'center',
    paddingTop: '40vh',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '700px',
    margin: '0 auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
  },
  questions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
  },
  questionCard: {
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '12px',
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
    transition: 'all 0.2s',
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
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  resultHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  scoreCircle: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    color: 'white',
  },
  scoreNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: '0.9rem',
  },
  xpDisplay: {
    marginTop: '15px',
  },
  xpValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#667eea',
  },
  bonusBadge: {
    display: 'block',
    marginTop: '10px',
    color: '#28a745',
    fontWeight: '600',
  },
  corrections: {
    marginBottom: '30px',
  },
  correctionsTitle: {
    marginBottom: '15px',
    color: '#333',
  },
  correctionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  correctionStatus: {
    fontSize: '1.2rem',
  },
  correctionContent: {
    flex: 1,
  },
  homeButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
