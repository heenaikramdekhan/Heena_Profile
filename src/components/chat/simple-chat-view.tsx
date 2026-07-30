'use client';

import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import { getToolName, isTextUIPart, isToolUIPart, type UIMessage } from 'ai';
import { motion } from 'framer-motion';
import { Transition } from 'framer-motion';
import ChatMessageContent from './chat-message-content';
import ToolRenderer, { type RenderedTool } from './tool-renderer';

interface SimplifiedChatViewProps {
  message: UIMessage;
  isLoading: boolean;
}

const MOTION_CONFIG: {
  initial: { opacity: number; y: number };
  animate: { opacity: number; y: number };
  exit: { opacity: number; y: number };
  transition: Transition;
} = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    // cubic-bezier equivalent of "easeOut"
    ease: [0.16, 1, 0.3, 1],
  },
};

export function SimplifiedChatView({
  message,
  isLoading,
}: SimplifiedChatViewProps) {
  if (message.role !== 'assistant') return null;

  const parts = message.parts ?? [];

  /**
   * Tool calls that have actually returned. A tool part carries its name in the
   * part type (`tool-getSkills`) and its payload on `output`, so both are read
   * through the SDK helpers rather than by slicing the string.
   */
  const finishedTools: RenderedTool[] = parts
    .filter(isToolUIPart)
    .filter((part) => part.state === 'output-available')
    .map((part) => ({
      toolCallId: part.toolCallId,
      toolName: getToolName(part),
      output: part.output,
    }));

  // Only display the first tool (if any)
  const currentTool = finishedTools.slice(0, 1);

  // Text now lives only in the parts array, so it gets assembled here.
  const text = parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join('')
    .trim();

  const hasTools = currentTool.length > 0;

  // With a tool card on screen, a short lead-in line is just noise above it.
  const showTextContent = text.length > 0 && (!hasTools || text.length > 50);

  return (
    <motion.div {...MOTION_CONFIG} className="flex h-full w-full flex-col px-4">
      {/* Single scrollable container for both tool and text content */}
      <div className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto">
        {/* Tool invocation result - displayed at the top */}
        {hasTools && (
          <div className="mb-4 w-full">
            <ToolRenderer
              toolInvocations={currentTool}
              messageId={message.id || 'current-msg'}
            />
          </div>
        )}

        {/* Text content - only show if meaningful and not redundant with tools */}
        {showTextContent && (
          <div className="w-full">
            <ChatBubble variant="received" className="w-full">
              <ChatBubbleMessage className="w-full">
                <ChatMessageContent
                  message={message}
                  isLast={true}
                  isLoading={isLoading}
                  skipToolRendering={true}
                />
              </ChatBubbleMessage>
            </ChatBubble>
          </div>
        )}

        {/* Add some padding at the bottom for better scrolling experience */}
        <div className="pb-4"></div>
      </div>
    </motion.div>
  );
}
