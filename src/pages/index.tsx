import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Topic {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/topics')
      .then(res => res.json())
      .then(data => {
        setTopics(data.topics);
        if (data.topics.length > 0) {
          setSelectedTopic(data.topics[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handleStart = async () => {
    if (!selectedTopic) return;
    setLoading(true);
    router.push(`/study/${selectedTopic}/${selectedDifficulty}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📚 Vocab Learning</h1>
        <p style={styles.subtitle}>Master English vocabulary through interactive quizzes</p>

        <div style={styles.section}>
          <label style={styles.label}>Choose a Topic</label>
          <div style={styles.topicGrid}>
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                style={{
                  ...styles.topicButton,
                  ...(selectedTopic === topic.id ? styles.topicButtonActive : {}),
                }}
              >
                <span style={styles.topicIcon}>{topic.icon}</span>
                <span style={styles.topicName}>{topic.name}</span>
                <span style={styles.topicDesc}>{topic.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Difficulty Level</label>
          <div style={styles.difficultyRow}>
            {['easy', 'medium', 'hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  ...styles.diffButton,
                  ...(selectedDifficulty === diff ? styles.diffButtonActive : {}),
                }}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={loading || !selectedTopic}
          style={{
            ...styles.startButton,
            ...(loading || !selectedTopic ? styles.startButtonDisabled : {}),
          }}
        >
          {loading ? 'Loading...' : 'Start Learning →'}
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
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
  },
  section: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#444',
  },
  topicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  topicButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  topicButtonActive: {
    borderColor: '#667eea',
    background: '#f0f4ff',
  },
  topicIcon: {
    fontSize: '2rem',
    marginBottom: '8px',
  },
  topicName: {
    fontWeight: '600',
    color: '#333',
  },
  topicDesc: {
    fontSize: '0.75rem',
    color: '#888',
    textAlign: 'center',
  },
  difficultyRow: {
    display: 'flex',
    gap: '10px',
  },
  diffButton: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  diffButtonActive: {
    borderColor: '#667eea',
    background: '#667eea',
    color: 'white',
  },
  startButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  startButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};
