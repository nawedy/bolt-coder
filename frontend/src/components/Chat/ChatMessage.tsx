'use client';

import { Message } from '@/types/chat';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Types
interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

interface MarkdownCodeProps extends React.HTMLProps<HTMLElement> {
  inline?: boolean;
  className?: string;
}

// Sub-components
const CodeBlock = ({ language, children }: { language: string; children: string }): JSX.Element => (
  <Prism
    style={vscDarkPlus}
    language={language}
    PreTag="div"
    customStyle={{
      margin: '0.5em 0',
      padding: '1em',
      backgroundColor: '#1e1e1e',
      borderRadius: '4px',
    }}
  >
    {children}
  </Prism>
);

const InlineCode = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm">
    {children}
  </code>
);

const Avatar = ({ role }: { role: 'user' | 'assistant' | 'system' }): JSX.Element => (
  <div 
    className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white text-sm font-medium"
    aria-label={`${role} avatar`}
  >
    {role === 'assistant' ? 'AI' : role === 'user' ? 'U' : 'S'}
  </div>
);

// Main component
export function ChatMessage({ message, isLatest }: ChatMessageProps): JSX.Element {
  const messageRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isLatest && messageRef.current) {
      messageRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [isLatest, message.content]);

  // Markdown code renderer
  const renderCode = (props: MarkdownCodeProps): JSX.Element | null => {
    const { inline, className, children } = props;
    if (!children) return null;
    
    const code = String(children).replace(/\n$/, '');
    const language = /language-(\w+)/.exec(className || '')?.[1] || 'text';
    
    return inline ? (
      <InlineCode>{code}</InlineCode>
    ) : (
      <CodeBlock language={language}>{code}</CodeBlock>
    );
  };

  return (
    <div
      ref={messageRef}
      className={`py-6 transition-colors ${message.role === 'assistant' ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
      role="article"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-start gap-4">
          <Avatar role={message.role} />
          <div className="flex-1 overflow-hidden">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                code: renderCode,
                p: ({ children }) => (
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4 last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4">
                    {children}
                  </ol>
                ),
                pre: ({ children }) => (
                  <pre className="mb-4 last:mb-0">{children}</pre>
                ),
              }}
            >
              {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
