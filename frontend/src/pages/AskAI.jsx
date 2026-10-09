import { useState } from 'react';
import API from '../api';

export default function AskAI() {
  const [doubt, setDoubt] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/ai/analyze', { doubt });
      setAnalysis(data);

      const tutorRes = await API.get(`/tutors?subject=${data.subject}`);
      setTutors(tutorRes.data);
    } catch (err) {
      alert('Error analyzing doubt. Ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const bookTutor = async (tutor) => {
    try {
      await API.post('/sessions/book', {
        tutorId: tutor._id,
        subject: analysis.subject,
        topic: analysis.topic,
        duration: 30,
        scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
        fee: tutor.hourlyRate / 2,
        doubtDescription: doubt
      });
      alert('Session Booked Successfully!');
    } catch (err) {
      alert('Failed to book session');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Ask Gemini AI & Match Tutors</h2>
      <form onSubmit={handleAnalyze}>
        <textarea
          rows="4"
          style={{ width: '100%', padding: '10px' }}
          placeholder="Describe your doubt or question..."
          value={doubt}
          onChange={(e) => setDoubt(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '10px 20px' }}>
          {loading ? 'Analyzing...' : 'Analyze Doubt'}
        </button>
      </form>

      {analysis && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>AI Analysis Breakdown</h3>
          <p><strong>Subject:</strong> {analysis.subject}</p>
          <p><strong>Topic:</strong> {analysis.topic}</p>
          <p><strong>Difficulty Level:</strong> {analysis.difficulty}</p>
          <h4>Initial Explanation:</h4>
          <p>{analysis.initialExplanation}</p>

          <h3 style={{ marginTop: '20px' }}>Recommended Tutors for {analysis.subject}</h3>
          {tutors.length === 0 ? <p>No specific tutors found for this subject.</p> : (
            <ul>
              {tutors.map((t) => (
                <li key={t._id} style={{ marginBottom: '10px' }}>
                  <strong>{t.name}</strong> - ${t.hourlyRate}/hr | Bio: {t.bio}
                  <button onClick={() => bookTutor(t)} style={{ marginLeft: '10px' }}>Book 30m Session</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}