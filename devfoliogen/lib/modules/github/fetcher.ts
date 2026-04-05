import { graphql } from '@octokit/graphql';
import { Settings } from '@/lib/config/settings';
import { NormalizedProfile, GitHubGraphQLUser, GitHubMetrics } from '@/types/github';
import { parseSocialLinksFromReadme } from '@/lib/utils/readme-parser';

function getGraphQLClient(token: string) {
  return graphql.defaults({
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

const USER_QUERY_PUBLIC = `
  query($username: String!) {
    user(login: $username) {
      login
      name
      bio
      avatarUrl
      location
      email
      websiteUrl
      twitterUsername
      company
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(first: 100, privacy: PUBLIC, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        nodes {
          name
          description
          url
          homepageUrl
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          isPrivate
          isFork
          updatedAt
          createdAt
        }
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            stargazerCount
            forkCount
            primaryLanguage {
              name
              color
            }
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
            repositoryTopics(first: 10) {
              nodes {
                topic {
                  name
                }
              }
            }
            isPrivate
            isFork
            updatedAt
            createdAt
          }
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const USER_QUERY_ALL = `
  query($username: String!) {
    user(login: $username) {
      login
      name
      bio
      avatarUrl
      location
      email
      websiteUrl
      twitterUsername
      company
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        nodes {
          name
          description
          url
          homepageUrl
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          isPrivate
          isFork
          updatedAt
          createdAt
        }
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            stargazerCount
            forkCount
            primaryLanguage {
              name
              color
            }
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
            repositoryTopics(first: 10) {
              nodes {
                topic {
                  name
                }
              }
            }
            isPrivate
            isFork
            updatedAt
            createdAt
          }
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const PR_STATS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      mergedPRs: pullRequests(states: MERGED) {
        totalCount
      }
      openPRs: pullRequests(states: OPEN) {
        totalCount
      }
      contributionsCollection {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
      }
    }
  }
`;

export class GitHubProfileFetcher {
  private static normalizeWebsiteUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return null;
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      try {
        new URL(trimmedUrl);
        return trimmedUrl;
      } catch {
        return null;
      }
    }
    return `https://${trimmedUrl}`;
  }

  private static extractTwitterUsername(url: string | undefined): string | null {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const username = pathname.split('/').filter(Boolean)[0];
      return username || null;
    } catch {
      const match = url.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
      return match ? match[1] : null;
    }
  }

  private static async fetchPublicProfile(username: string): Promise<NormalizedProfile> {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`GitHub user ${username} not found`);
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded.');
      }
      throw new Error(`Failed to fetch GitHub profile: ${response.status} ${response.statusText}`);
    }

    const user = await response.json();
    const readmeContent = await this.fetchReadmeContent(username, null);
    const socialLinks = readmeContent ? parseSocialLinksFromReadme(readmeContent, username) : {};

    return {
      username: user.login,
      name: user.name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      location: user.location,
      email: user.email,
      website: this.normalizeWebsiteUrl(user.blog),
      twitter_username:
        user.twitter_username || this.extractTwitterUsername(socialLinks.twitter || socialLinks.x),
      linkedin_url: socialLinks.linkedin,
      instagram_url: socialLinks.instagram,
      company: user.company,
      followers: user.followers,
      following: user.following,
      public_repos: user.public_repos,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || undefined,
      cached: false,
      metrics: await this.fetchPRStatistics(username, null),
    };
  }

  static async fetchPRStatistics(username: string, userToken?: string | null): Promise<GitHubMetrics> {
    const token = userToken || Settings.GITHUB_TOKEN;
    if (!token) {
      return {
        prs_merged: 0,
        prs_open: 0,
        total_contributions: 0,
        issues_opened: 0,
        issues_closed: 0,
      };
    }

    const graphqlClient = getGraphQLClient(token);

    try {
      const result = await graphqlClient<{
        user: {
          mergedPRs: {
            totalCount: number;
          };
          openPRs: {
            totalCount: number;
          };
          contributionsCollection: {
            totalCommitContributions: number;
            totalIssueContributions: number;
            totalPullRequestContributions: number;
            totalPullRequestReviewContributions: number;
          };
        } | null;
      }>(PR_STATS_QUERY, { username });

      if (!result.user) {
        return {
          prs_merged: 0,
          prs_open: 0,
          total_contributions: 0,
          issues_opened: 0,
          issues_closed: 0,
        };
      }

      const merged = result.user.mergedPRs.totalCount;
      const open = result.user.openPRs.totalCount;
      const contributions = result.user.contributionsCollection;

      return {
        prs_merged: merged,
        prs_open: open,
        total_contributions:
          contributions.totalCommitContributions +
          contributions.totalIssueContributions +
          contributions.totalPullRequestContributions +
          contributions.totalPullRequestReviewContributions,
        issues_opened: contributions.totalIssueContributions,
        issues_closed: 0,
      };
    } catch (error) {
      console.error('Failed to fetch PR statistics:', error);
      return {
        prs_merged: 0,
        prs_open: 0,
        total_contributions: 0,
        issues_opened: 0,
        issues_closed: 0,
      };
    }
  }

  static async fetchReadmeContent(username: string, userToken?: string | null): Promise<string | null> {
    const token = userToken || Settings.GITHUB_TOKEN;
    if (!token) {
      return null;
    }

    const graphqlClient = getGraphQLClient(token);

    try {
      const readmeQuery = `
        query($username: String!) {
          user(login: $username) {
            repository(name: $username) {
              object(expression: "HEAD:README.md") {
                ... on Blob {
                  text
                }
              }
            }
          }
        }
      `;

      const result = await graphqlClient<{
        user: {
          repository: {
            object: { text: string } | null;
          } | null;
        };
      }>(readmeQuery, { username });

      return result.user?.repository?.object?.text || null;
    } catch {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/${username}/${username}/main/README.md`,
          { next: { revalidate: 3600 } }
        );
        if (response.ok) {
          return await response.text();
        }
      } catch {
        // Try alternative branch
        try {
          const response = await fetch(
            `https://raw.githubusercontent.com/${username}/${username}/master/README.md`,
            { next: { revalidate: 3600 } }
          );
          if (response.ok) {
            return await response.text();
          }
        } catch {
          // Silently fail
        }
      }
      return null;
    }
  }

  static async fetchUserProfile(username: string, userToken?: string | null): Promise<NormalizedProfile> {
    const token = userToken || Settings.GITHUB_TOKEN;
    if (!token) {
      return this.fetchPublicProfile(username);
    }

    const graphqlClient = getGraphQLClient(token);
    const isAuthenticatedUser = userToken !== null;
    const query = isAuthenticatedUser ? USER_QUERY_ALL : USER_QUERY_PUBLIC;

    try {
      const result = await graphqlClient<{ user: GitHubGraphQLUser }>(query, {
        username,
      });

      if (!result.user) {
        throw new Error(`User ${username} not found`);
      }

      const user = result.user;

      let linkedinUrl: string | undefined;
      let twitterUrl: string | undefined;
      let instagramUrl: string | undefined;

      if (user.bio) {
        const bioLinks = parseSocialLinksFromReadme(user.bio, username);
        linkedinUrl = bioLinks.linkedin;
        twitterUrl = bioLinks.twitter || bioLinks.x;
        instagramUrl = bioLinks.instagram;
      }

      try {
        const readmeContent = await this.fetchReadmeContent(username, token);
        if (readmeContent) {
          const socialLinks = parseSocialLinksFromReadme(readmeContent, username);
          if (!linkedinUrl && socialLinks.linkedin) {
            linkedinUrl = socialLinks.linkedin;
          }
          if (!twitterUrl && (socialLinks.twitter || socialLinks.x)) {
            twitterUrl = socialLinks.twitter || socialLinks.x;
          }
          if (!instagramUrl && socialLinks.instagram) {
            instagramUrl = socialLinks.instagram;
          }
        }
      } catch (error) {
        console.error(`Failed to parse social links from README for ${username}:`, error);
      }

      const metrics = await this.fetchPRStatistics(username, token);

      const normalizedProfile: NormalizedProfile = {
        username: user.login,
        name: user.name,
        bio: user.bio,
        avatar_url: user.avatarUrl,
        location: user.location,
        email: user.email,
        website: this.normalizeWebsiteUrl(user.websiteUrl),
        twitter_username: user.twitterUsername || this.extractTwitterUsername(twitterUrl) || null,
        linkedin_url: linkedinUrl,
        instagram_url: instagramUrl,
        company: user.company,
        followers: user.followers.totalCount,
        following: user.following.totalCount,
        public_repos: user.repositories.totalCount,
        created_at: user.createdAt || new Date().toISOString(),
        cached: false,
        metrics,
      };

      return normalizedProfile;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as { status?: number })?.status;

      if (errorMessage.includes('Could not resolve to a User') || errorMessage.includes('NOT_FOUND')) {
        throw new Error(`GitHub user ${username} not found`);
      }
      if (errorMessage.includes('Bad credentials') || errorStatus === 401) {
        throw new Error('Invalid GitHub token. Please check your GITHUB_TOKEN environment variable.');
      }
      if (errorStatus === 403) {
        throw new Error('GitHub API rate limit exceeded or token lacks required permissions.');
      }
      throw new Error(`Failed to fetch GitHub profile: ${errorMessage}`);
    }
  }

  static async fetchUserRepositories(username: string, userToken?: string | null) {
    const token = userToken || Settings.GITHUB_TOKEN;
    if (!token) {
      return [];
    }

    const graphqlClient = getGraphQLClient(token);
    const isAuthenticatedUser = userToken !== null;
    const query = isAuthenticatedUser ? USER_QUERY_ALL : USER_QUERY_PUBLIC;

    try {
      const result = await graphqlClient<{ user: GitHubGraphQLUser }>(query, {
        username,
      });

      if (!result.user) {
        throw new Error(`User ${username} not found`);
      }

      return result.user.repositories.nodes;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as { status?: number })?.status;

      if (errorMessage.includes('Could not resolve to a User') || errorMessage.includes('NOT_FOUND')) {
        throw new Error(`GitHub user ${username} not found`);
      }
      if (errorMessage.includes('Bad credentials') || errorStatus === 401) {
        throw new Error('Invalid GitHub token. Please check your GITHUB_TOKEN environment variable.');
      }
      if (errorStatus === 403) {
        throw new Error('GitHub API rate limit exceeded or token lacks required permissions.');
      }
      throw new Error(`Failed to fetch repositories: ${errorMessage}`);
    }
  }
}
