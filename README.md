# DEVFOLIOGEN
-This project is made my me and friends as 4th sememster project of subject "Design Thinking and Innovation".


-This project automatically creates a portfolio website using a GitHub username and the user's public GitHub data. The main concept is that the app creates a portfolio using actual profile, repository, and contribution data rather than creating one by hand.


-How We Built It

We built it as a Next.js app with dynamic portfolio pages. The main pieces are:

      app/page.tsx
   landing page where a user enters a GitHub username

       app/(portfolio)/[username]/page.tsx
   renders the final portfolio for that username

       lib/modules/github/fetcher.tsx
   fetches GitHub profile data

       lib/modules/github/projects.tsx
   fetches and ranks repositories as featured projects

      lib/modules/github/contributions.tsx
   contribution-related data
  
      lib/modules/ai/generator.tsx 
   generates AI-based summary, highlights, skills, and SEO content
  
      lib/services/profile.tsx 
   combines GitHub data and AI output into one profile object

       components/portfolio/*
   frontend portfolio UI sections


-We also added fallback behavior so the app still works even if some services are missing:

no database: it falls back to in-memory storage
no Groq key: it falls back to non-AI summary text
no GitHub token: it still works in lightweight mode using public GitHub APIs(But with this we cannot access the private repo) 


-How It Works:

1. User opens the landing page and enters a GitHub username.
      The app routes them to /<username>

2. The portfolio page calls internal API routes like:

         /api/user/[username]/profile

         /api/user/[username]/projects

         /api/user/[username]/about


 3. These routes fetch GitHub data:

         profile info

         repositories

         stars/forks/languages

    PR and contribution-related data when available

    The backend normalizes this data into a portfolio-friendly structure.


  4. If AI is enabled with GROQ_API_KEY, the app generates:

         a professional summary

         highlights

         skills

         SEO metadata


5. The frontend renders everything into sections like:

         hero/introduction

         featured work

         about

         languages

         contribution proof

         contact/footer


-What Makes It Practical:

 The app is designed in two modes:

   1. lightweight mode

             just run it and generate portfolios from GitHub data

   2. full mode

            adds AI, persistent cache, auth, and custom URLs

So in simple terms: we built a GitHub-data pipeline, optionally enriched it with AI, and then rendered the result into a cleaner portfolio frontend.
