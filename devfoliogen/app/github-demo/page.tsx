'use client';

import { useState } from 'react';
import Image from 'next/image';

interface DemoGitHubUser {
  avatar_url: string;
  name: string | null;
  login: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  company: string | null;
  html_url: string;
}

export default function GitHubDemo() {
  const [username, setUsername] = useState('');
  const [data, setData] = useState<DemoGitHubUser | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchGitHubData() {
    setError('');
    setData(null);
    setLoading(true);

    try {
      // Dynamic API call using template literal
      const res = await fetch(`https://api.github.com/users/${username}`);

      if (!res.ok) {
        throw new Error('User not found');
      }

      // Convert response to JSON
      const json = (await res.json()) as DemoGitHubUser;

      // Store fetched data in state
      setData(json);
    } catch {
      setError('Unable to fetch GitHub user.');
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>GitHub Data Fetch Demo</h1>

      <input
        type="text"
        placeholder="Enter GitHub username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: 8, marginRight: 10 }}
      />

      <button onClick={fetchGitHubData} style={{ padding: 8 }}>
        Fetch Data
      </button>

      {loading && <p>Loading...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <div style={{ marginTop: 20 }}>
          <Image src={data.avatar_url} width={100} height={100} alt={`${data.login} avatar`} />
          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Username:</strong> {data.login}</p>
          <p><strong>Followers:</strong> {data.followers}</p>
          <p><strong>Following:</strong> {data.following}</p>
          <p><strong>Public Repos:</strong> {data.public_repos}</p>
          <p><strong>Location:</strong> {data.location}</p>
          <p><strong>Company:</strong> {data.company}</p>
          <p>
            <strong>Profile URL:</strong>{' '}
            <a href={data.html_url} target="_blank" rel="noreferrer">
              {data.html_url}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
