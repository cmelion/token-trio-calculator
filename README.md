# Welcome to our Fun Token Price Explorer project

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

We(royal we) leaned heavily on a $25/month Lovable.dev subscription (17/100 monthly tokens used) to produce the initial design and layout given UX/Design is probably where we are weakest.
Font Blindness is a thing 😆 — Interaction design **is** a core strength of the "team", but we are not designers. We are engineers.

We also made extensive use of **Claude 3.7 Sonnet Thinking** with our $20/month Copilot subscription with Webstorm IDE integration.

For this demo project, we intentionally chose simple and well-understood mechanisms:

- **State Management**: React Context along with local useState for the minimal state we needed to manage
- **API Handling**: React Query for efficient data fetching, caching, and state synchronization
- **Styling**: Tailwind CSS for utility-first styling, allowing us to rapidly prototype and iterate on the design
- **Validation**:
    - Input pattern validation using regular expressions to ensure only valid numeric formats
    - Balance validation to prevent transactions exceeding available token amounts
    - Type checking and conversion to handle numeric data safely throughout the application

If integrating with a larger ecosystem, we would adapt to existing architectural patterns or enhance with additional libraries:

- **State Management**: Redux, Zustand, or MobX for complex state with middleware support, time-travel debugging, and team scalability
- **API Layer**: GraphQL solutions like Apollo Client or React Query's GraphQL integration with support for TheGraph - crucial for decentralized applications
- **Validation & Type Safety**: Schema validation libraries like Zod or Joi or Yup, or a personal favorite [JSON Schema and JSON Rules Engine](https://github.com/cmelion/rjsf-tailwind) for complex data validation and transformation

Our comprehensive test suite acts as a safety net, enabling seamless adoption of more sophisticated technologies without disrupting the user experience.
By leveraging MSW (Mock Service Worker) to abstract our API interactions, we can confidently swap underlying implementations—whether switching from Context to Redux for state management or REST to GraphQL for data fetching—while ensuring the application continues to look and behave exactly as expected.
This testing strategy provides both technical flexibility for developers and consistent experiences for users, regardless of implementation details.

## Notable Features

- Token selection interface with price display
- Real-time conversion between USD and token values
- Balance validation for source tokens
- Responsive design for various screen sizes (try both portrait and landscape orientations)
- Toggle between token and USD input modes

## Environment Variables

This project requires API keys that should not be committed to the repository.

### Local Development

1. Create a `.env` file in the project root directory
2.  Add your API key and MSW configuration to the file in the following format:
    ```env
    VITE_API_KEY=your_api_key_here
    VITE_ENABLE_MSW=true
    ```
3. Make sure `.env` is included in your `.gitignore` file to prevent accidentally committing sensitive information
4. Start your development server with `npm run dev`
5. The application will automatically load environment variables from the `.env` file

### Running Tests

> **⚠️ Important:**
> For Playwright BDD tests to be generated against a `.feature` file, you **must** include the `@storybook-running` tag at the top of the feature or scenario.
> Component tests also require the @component tag to be present, or component tests will not run.
> Features or scenarios **without** `@storybook-running` will be **ignored** by the test runner.

When running tests that require API access:

1. Create a `.env.test` file with your test environment variables
2. Tests will use these variables when running in test mode

Note: The step-definitions for this exercise were brute forced and are not optimized.
Normally we would have some established domain specific Gherkin and composable functions to streamline our step-definitions.
These should be iterated over for better code reuse.  See [RJSF/Tailwind tests](https://github.com/cmelion/rjsf-tailwind/tree/main/tests)

## Deployed Resources

📚 **Interactive Storybook:** [View Component Library](https://cmelion.github.io/token-trio-calculator/storybook/)

🧪 **BDD Test Results:** [View Test Reports](https://cmelion.github.io/token-trio-calculator/bdd-reports/)

📊 **Component Coverage:** [View Coverage Reports](https://cmelion.github.io/token-trio-calculator/coverage/components/)