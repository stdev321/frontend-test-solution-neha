# VirtualMD Frontend Developer Test

## Time Limit: 1 Hour

## The Problem

When users navigate between pages on mobile, the scroll position doesn't reset to the top. 

**Example**: If you're at the bottom of the Legal page and click "FAQ" in the hamburger menu, the FAQ page opens at the bottom instead of the top.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Then:
1. Go to https://virtualmd.app and create an account
2. Use those credentials to login locally
3. Resize browser to mobile width (~375px) or use Chrome DevTools mobile view

## EXAMPLE OF THE BUG

1. Navigate to `/legal`
2. Scroll to the bottom
3. Open hamburger menu (top right)
4. Click any other page
5. Bug: New page is scrolled to bottom instead of top

## Your Task

Fix the scroll position so it always resets to top when navigating to a new page.

## Submission

Create a pull request with:
- Your fix
- Brief description of what you changed

## Evaluation

- Does it work? (60%)
- Clean code? (30%)  
- Well tested? (10%)

Good luck!