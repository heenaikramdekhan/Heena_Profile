// src/components/chat/tool-renderer.tsx
import { Contact } from '../contact';
import AvailabilityCard from '../AvailabilityCard';
import { Presentation } from '../presentation';
import AllProjects from '../projects/AllProjects';
import Resume from '../resume';
import Skills from '../skills';

/**
 * A finished tool call, flattened out of the message parts by its caller.
 *
 * The AI SDK types each tool part as `tool-<name>` with the payload on `output`,
 * so the name and payload are pulled off there and handed over in this shape.
 * Keeping the flattening in one place means the renderer stays a plain switch.
 */
export type RenderedTool = {
  toolCallId: string;
  toolName: string;
  output: unknown;
};

interface ToolRendererProps {
  toolInvocations: RenderedTool[];
  messageId: string;
}

export default function ToolRenderer({ toolInvocations }: ToolRendererProps) {
  return (
    <div className="w-full transition-all duration-300">
      {toolInvocations.map((tool) => {
        const { toolCallId, toolName } = tool;

        // Return specialized components based on tool name
        switch (toolName) {
          case 'getProjects':
            return (
              <div
                key={toolCallId}
                className="w-full overflow-hidden rounded-lg"
              >
                <AllProjects />
              </div>
            );

          case 'getPresentation':
            return (
              <div
                key={toolCallId}
                className="w-full overflow-hidden rounded-lg"
              >
                <Presentation />
              </div>
            );

          case 'getResume':
            return (
              <div key={toolCallId} className="w-full rounded-lg">
                <Resume />
              </div>
            );

          case 'getContact':
            return (
              <div key={toolCallId} className="w-full rounded-lg">
                <Contact />
              </div>
            );

          case 'getSkills':
            return (
              <div key={toolCallId} className="w-full rounded-lg">
                <Skills />
              </div>
            );

          case 'getInternship':
            return (
              <div key={toolCallId} className="w-full rounded-lg">
                {/* Shaped by the tool on the server, so it already matches. */}
                <AvailabilityCard data={tool.output as never} />
              </div>
            );

          // Default renderer for other tools
          default:
            return (
              <div
                key={toolCallId}
                className="bg-secondary/10 w-full rounded-lg p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-medium">{toolName}</h3>
                  <span className="bg-accent2/15 text-accent2 rounded-full px-2 py-0.5 text-xs">
                    Tool Result
                  </span>
                </div>
                <div className="mt-2">
                  {typeof tool.output === 'object' ? (
                    <pre className="bg-secondary/20 overflow-x-auto rounded p-3 text-sm">
                      {JSON.stringify(tool.output, null, 2)}
                    </pre>
                  ) : (
                    <p>{String(tool.output)}</p>
                  )}
                </div>
              </div>
            );
        }
      })}
    </div>
  );
}
