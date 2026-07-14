# LegalAssist

AI Legal Assistant & Document Analyzer

## Overview

LegalAssist is a starter platform for analyzing legal documents, summarizing clauses, and generating AI-powered legal guidance.

## Features

- Upload or paste legal document text
- Generate summaries and clause extractions
- Ask for AI review and risk advice
- Includes PDF parsing in serverless API routes
- Protected by auth using NextAuth credentials
- Supports GROQ-based Sanity template queries

## Setup

1. Copy `.env.example` to `.env`
2. Add your OpenAI, auth, and Sanity credentials to `.env`
3. Install dependencies:

```bash
npm install
```

4. Start locally:

```bash
npm run dev
```

## Local URLs

- App: `http://localhost:3000`

## Environment Variables

- `OPENAI_API_KEY`
- `NEXTAUTH_SECRET`
- `AUTH_USERNAME`
- `AUTH_PASSWORD`
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_TOKEN`

## Notes

This version uses Next.js API routes for AI analysis and PDF extraction, so it can deploy on Vercel as a single app. Update the auth and prompt handling to match your legal workflows and security requirements.

## Notes

This starter includes an integration point for OpenAI. Update the prompt and workflow as needed to support your legal domain, document formats, and compliance requirements.
