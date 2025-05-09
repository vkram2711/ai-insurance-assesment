# AI Insurance Claims Processing

A Next.js application that leverages AI to process and analyze insurance claims documents.

## Setup & Run Instructions

1. **Prerequisites**
   - Node.js (v18 or higher)
   - npm or yarn

2. **Installation**
   ```bash
   # Install dependencies
   npm install
   # or
   yarn install
   ```
   Also follow the .env.example file to create a .env file with the required environment variables (OPENAI_API_KEY).

3. **Running the Application**
   ```bash
   # Development mode
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:3000`

4. **Building for Production**
   ```bash
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

## Architecture

This application is built using Next.js 15 with TypeScript and follows a modern React architecture. The project structure is organized into several key directories:

- `src/app`: Contains the main application routes and pages
- `src/components`: Reusable UI components
- `src/lib`: Core utilities and business logic
- `src/hooks`: Custom React hooks
- `src/types`: TypeScript type definitions
- `src/sample-claims`: Sample claim documents for testing

The application uses Tailwind CSS for styling and includes Jest for testing. Document processing is handled through various libraries (mammoth, pdf2json) to support multiple file formats.

AI related settings are stored in aiconfig.yml (model, token limit, prompts, etc.)

## Assumptions & Trade-offs
- Currently supports PDF, TXT, and DOCX formats
- Assumes documents are well-structured and readable
- May require additional processing for complex layouts, especially with PDF
- GPT usually fixes some of the formatting issues or misspellings when it comes to names which works well but may create problems on really large set of insureds
- The application is designed using Server-Sent Events (SSE) for event streaming which requires keeping open http connections and may not scale well
- If there is insured with name "undefined" it will certainly be a problem


## Testing

Run the test suite using:
```bash
npm test
# or
yarn test
```
