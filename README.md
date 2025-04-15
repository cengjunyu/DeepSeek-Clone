# Deepseek Clone

This is a project aimed at replicating some functionalities of Deepseek, built with Next.js.

## Features (Inferred from dependencies)

*   User Authentication (Clerk)
*   AI Chat Interface (OpenAI)
*   Markdown Rendering
*   LaTeX Support (KaTeX)
*   Syntax Highlighting
*   Database Interaction (Mongoose/MongoDB)

## Tech Stack

*   **Framework:** Next.js
*   **Authentication:** Clerk
*   **AI:** OpenAI API
*   **Database:** MongoDB (via Mongoose)
*   **Styling:** Tailwind CSS
*   **UI:** React
*   **Markdown/Math:** `react-markdown`, `rehype-katex`, `remark-math`, `highlight.js`

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd deepseek-clone
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install or pnpm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the necessary environment variables (e.g., OpenAI API key, Clerk keys, MongoDB connection string). Refer to `.env.example` (if available) or the code for required variables.
    ```env
    # .env
    OPENAI_API_KEY=your_openai_api_key
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    MONGODB_URI=your_mongodb_connection_string
    # Add any other required variables based on .env contents
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

*   `npm run dev`: Starts the development server with Turbopack.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Runs the linter.
