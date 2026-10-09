import { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    API.get('/sessions/my-sessions')
      .then((res) => setSessions(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Learning Sessions</h2>
      {sessions.length === 0 ? <p>No booked sessions yet.</p> : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Topic</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Fee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s._id}>
                <td>{s.subject}</td>
                <td>{s.topic}</td>
                <td>{new Date(s.scheduledAt).toLocaleString()}</td>
                <td>{s.duration} mins</td>
                <td>${s.fee}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}