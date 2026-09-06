import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Links to uploaded files (/api/files/<id>) open in a new tab so a PDF
// preview or download doesn't navigate away from the note.
const components: Components = {
  a({ href, children, ...props }) {
    const isFile = typeof href === "string" && href.startsWith("/api/files/");
    return (
      <a
        href={href}
        {...(isFile ? { target: "_blank", rel: "noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
