import { NextResponse } from 'next/server';
import { Settings } from '@/lib/config/settings';

function getRepositoryConfig() {
  try {
    const repoUrl = new URL(Settings.NEXT_PUBLIC_GITHUB_REPO_URL);
    const [, owner, repo] = repoUrl.pathname.split('/');
    if (owner && repo) {
      return { owner, repo };
    }
  } catch {
    // Fall back to the default repository below.
  }

  return {
    owner: 'nishantmishra',
    repo: 'devfoliogen',
  };
}

export async function GET() {
  try {
    const { owner, repo } = getRepositoryConfig();
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (Settings.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${Settings.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers,
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found' },
          { status: 404 }
        );
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const starCount = data.stargazers_count || 0;

    return NextResponse.json(
      { stars: starCount },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch star count:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to fetch star count', stars: 0 },
      { status: 500 }
    );
  }
}
