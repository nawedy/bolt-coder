/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />
/// <reference lib="webworker" />

declare global {
  var ENV: 'development' | 'production';
  var OPENAI_API_KEY: string | undefined;
  var BOLT_DIY_API: string | undefined;
  var ANTHROPIC_API_KEY: string | undefined;
  var OPEN_ROUTER_API_KEY: string | undefined;
  var GOOGLE_GENERATIVE_AI_API_KEY: string | undefined;
  var OPENAI_API_BASE: string | undefined;
  var HuggingFace_API_KEY: string | undefined;
  var HUGGINGFACEHUB_API_TOKEN: string | undefined;
  var COHERE_API_KEY: string | undefined;
  var LMSTUDIO_API_BASE_URL: string | undefined;
  var TOGETHER_API_KEY: string | undefined;
  var DEEPSEEK_API_KEY: string | undefined;
  var XAI_API_KEY: string | undefined;
  var PERPLEXITY_API_KEY: string | undefined;
  var AWS_BEDROCK_CONFIG: string | undefined;
  var AWS_BEDROCK_API_KEY: string | undefined;
}
