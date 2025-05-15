# Welcome to our Fun Token Price Explorer project


## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

For this demo project, we intentionally chose simple and well-understood mechanisms:

- **State Management**: React Context along with local useState for the minimal state we needed to manage
- **API Handling**: React Query for efficient data fetching, caching, and state synchronization

If operating within a larger ecosystem, we would adopt in-place mechanisms, such as:
- Redux or Zustand for more complex state management needs
- GraphQL solutions like Apollo that support both traditional REST endpoints and more robust solutions for the crypto space like TheGraph

We've added robust testing to facilitate migration to more robust tech stacks. This approach ensures that behavior and user experience would encounter little or no changes during migration, as our MSW (Mock Service Worker) mocking framework can be configured to support different methods for accessing APIs.

## Notable Features

- Token selection interface with price display
- Real-time conversion between USD and token values
- Balance validation for source tokens
- Responsive design for various screen sizes
- Toggle between token and USD input modes

## Environment Variables

This project requires API keys that should not be committed to the repository.

### Local Development

1. Create a `.env` file in the project root directory
2. Add your API key to the file in the following format:
    ```env
    VITE_API_KEY=your_api_key_here
    ```
3. Make sure `.env` is included in your `.gitignore` file to prevent accidentally committing sensitive information
4. Start your development server with `npm run dev`
5. The application will automatically load environment variables from the `.env` file

### Running Tests

When running tests that require API access:

1. Create a `.env.test` file with your test environment variables
2. Tests will use these variables when running in test mode

Note: Never commit actual API keys to your repository.
