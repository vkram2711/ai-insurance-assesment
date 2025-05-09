import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import OpenAI from 'openai';
import { AIError, NetworkError } from '@/types/errors';

interface AIConfig {
    metadata: {
        model: string;
        temperature: number;
        max_tokens: number;
        response_format: { type: "json_object" };
    };
    prompts: Array<{
        name: string;
        input: string;
        metadata: {
            system_prompt: string;
            output_schema: {
                type: string;
                properties: Record<string, any>;
                required: string[];
            };
        };
    }>;
}

export class AiConfig {
    private config: AIConfig;
    private openai: OpenAI;

    constructor() {
        // Initialize OpenAI client
        if (!process.env.OPENAI_API_KEY) {
            throw new AIError('OPENAI_API_KEY environment variable is not set');
        }

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Load and parse the aiconfig.yaml file
        const configPath = path.join(process.cwd(), 'aiconfig.yaml');
        if (!fs.existsSync(configPath)) {
            throw new AIError('aiconfig.yaml file not found');
        }

        const configContent = fs.readFileSync(configPath, 'utf8');
        this.config = yaml.load(configContent) as AIConfig;

        // Validate config structure
        if (!this.config.metadata?.model) {
            throw new AIError('Invalid config: missing model in metadata');
        }
        if (!this.config.metadata?.max_tokens) {
            throw new AIError('Invalid config: missing max_tokens in metadata');
        }
        if (!this.config.prompts?.length) {
            throw new AIError('Invalid config: no prompts defined');
        }
    }

    /**
     * Gets the maximum number of tokens configured for the model
     * @returns The maximum number of tokens
     */
    getMaxTokens(): number {
        return this.config.metadata.max_tokens;
    }

    /**
     * Builds a system prompt that includes output schema information
     * @param promptConfig The prompt configuration containing system prompt and output schema
     * @returns Enhanced system prompt with schema information
     */
    private buildSystemPrompt(promptConfig: AIConfig['prompts'][0]): string {
        const {system_prompt, output_schema} = promptConfig.metadata;

        // Build schema description
        const schemaDescription = Object.entries(output_schema.properties)
            .map(([key, prop]) => {
                const required = output_schema.required.includes(key) ? ' (required)' : ' (optional)';
                return `- ${key}${required}: ${prop.description || prop.type}`;
            })
            .join('\n');

        // Build the enhanced system prompt
        return `${system_prompt}

Please respond in JSON format with the following structure:
${schemaDescription}

Required fields: ${output_schema.required.join(', ')}`;
    }

    /**
     * Creates a chat completion request based on the prompt name and input variables
     * @param promptName Name of the prompt in the config file
     * @param variables Object containing variables to replace in the prompt template
     * @returns The chat completion request
     */
    async createChatCompletion(promptName: string, variables: Record<string, string>) {
        const promptConfig = this.config.prompts.find(p => p.name === promptName);
        if (!promptConfig) {
            throw new AIError(`Prompt "${promptName}" not found in configuration`);
        }

        // Replace variables in the prompt template
        let prompt = promptConfig.input;
        Object.entries(variables).forEach(([key, value]) => {
            prompt = prompt.replace(`{{${key}}}`, value);
        });

        // Create the chat completion request
        return this.openai.chat.completions.create({
            model: this.config.metadata.model,
            temperature: this.config.metadata.temperature,
            max_tokens: this.config.metadata.max_tokens,
            response_format: {type: "json_object"},
            messages: [
                {
                    role: 'system',
                    content: this.buildSystemPrompt(promptConfig)
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });
    }

    /**
     * Creates a streaming chat completion request based on the prompt name and input variables
     * @param promptName Name of the prompt in the config file
     * @param variables Object containing variables to replace in the prompt template
     * @returns The streaming chat completion request
     */
    async createStreamingChatCompletion(promptName: string, variables: Record<string, string>) {
        const promptConfig = this.config.prompts.find(p => p.name === promptName);
        if (!promptConfig) {
            throw new AIError(`Prompt "${promptName}" not found in configuration`);
        }

        // Replace variables in the prompt template
        let prompt = promptConfig.input;
        Object.entries(variables).forEach(([key, value]) => {
            prompt = prompt.replace(`{{${key}}}`, value);
        });

        // Create the streaming chat completion request
        return this.openai.chat.completions.create({
            model: this.config.metadata.model,
            temperature: this.config.metadata.temperature,
            max_tokens: this.config.metadata.max_tokens,
            response_format: {type: "json_object"},
            messages: [
                {
                    role: 'system',
                    content: this.buildSystemPrompt(promptConfig)
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            stream: true
        });
    }
} 