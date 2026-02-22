import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface VocabItem {
  id: string;
  word: string;
  ipa?: string;
  meaning: string;
  example: string;
}

export default function StudyPage() {
  const router = useRouter();
  const { topic, difficulty } = router.query;
  
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMeaning, setShowMeaning] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (!topic || !difficulty) return;

    fetch('/api/vocab/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty, count: 10 }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load vocabulary');
        }
        return data;
      })
      .then(data => {
        setVocab(data.vocab || []);
        // Store vocab for quiz generation
        sessionStorage.setItem('currentVocab', JSON.stringify(data.vocab || []));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading vocab:', err);
        setVocab([]);
        setLoading(false);
      });
  }, [topic, difficulty]);

  const handleNext = () => {
    if (currentIndex < vocab.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowMeaning(false);
    } else {
      // Generate quiz
      generateQuiz();
    }
  };

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocab }),
      });
      const data = await res.json();
      setQuizId(data.quizId);
      router.push(`/quiz/${data.quizId}?topic=${topic}&difficulty=${difficulty}`);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading vocabulary...</div>
      </div>
    );
  }

  if (vocab.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>No vocabulary found</h2>
          <button onClick={() => router.push('/')} style={styles.backButton}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const current = vocab[currentIndex];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.badge}>{topic} • {difficulty}</span>
          <span style={styles.progress}>{currentIndex + 1} / {vocab.length}</span>
        </div>

        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${((currentIndex + 1) / vocab.length) * 100}%`,
            }} 
          />
        </div>

        <div style={styles.wordCard}>
          <h1 style={styles.word}>{current.word}</h1>
          {current.ipa && <span style={styles.ipa}>{current.ipa}</span>}
          
          {!showMeaning ? (
            <button 
              onClick={() => setShowMeaning(true)}
              style={styles.revealButton}
            >
              Show Meaning
            </button>
          ) : (
            <div style={styles.meaningSection}>
              <p style={styles.meaning}>{current.meaning}</p>
              <p style={styles.example}>"{current.example}"</p>
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          style={styles.nextButton}
        >
          {currentIndex < vocab.length - 1 ? 'Next →' : 'Start Quiz 🎯'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  loading: {
    color: 'white',
    fontSize: '1.5rem',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  badge: {
    background: '#f0f4ff',
    color: '#667eea',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  progress: {
    color: '#888',
    fontSize: '0.9rem',
  },
  progressBar: {
    height: '6px',
    background: '#e0e0e0',
    borderRadius: '3px',
    marginBottom: '30px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '3px',
    transition: 'width 0.3s',
  },
  wordCard: {
    textAlign: 'center',
    padding: '30px 0',
    borderBottom: '1px solid #eee',
    marginBottom: '30px',
  },
  word: {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#333',
  },
  ipa: {
    color: '#888',
    fontSize: '1.2rem',
  },
  revealButton: {
    marginTop: '30px',
    padding: '14px 40px',
    background: '#f0f4ff',
    color: '#667eea',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  meaningSection: {
    marginTop: '30px',
    animation: 'fadeIn 0.3s',
  },
  meaning: {
    fontSize: '1.3rem',
    color: '#444',
    marginBottom: '20px',
    lineHeight: 1.6,
  },
  example: {
    fontSize: '1.1rem',
    color: '#666',
    fontStyle: 'italic',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
  },
  nextButton: {
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
  backButton: {
    padding: '12px 24px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};
