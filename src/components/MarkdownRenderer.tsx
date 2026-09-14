
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import GraphRenderer from './GraphRenderer';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

const getTextContent = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (node.children) {
    return node.children.map(getTextContent).join('');
  }
  return '';
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "", inline = false }) => {
  const wrapperProps = { className: `markdown-body ${inline ? 'inline-markdown' : ''} ${className}`.trim() };

  // Pre-process content to ensure SVGs are always treated as block-level code blocks
  let processedContent = content;
  
  // 1. Temporarily hide existing code blocks (both block and inline)
  let counter = 0;
  const blocks: Record<string, string> = {};
  
  // Hide block code
  processedContent = processedContent.replace(/```[\s\S]*?```/g, match => {
    const key = `__BLOCK_${counter++}__`;
    blocks[key] = match;
    return key;
  });
  
  // Hide inline code
  processedContent = processedContent.replace(/`[^`]+`/g, match => {
    const key = `__INLINE_${counter++}__`;
    blocks[key] = match;
    return key;
  });

  // 2. Wrap any raw SVGs in code blocks
  processedContent = processedContent.replace(/(<svg[\s\S]*?<\/svg>)/gi, '\n```xml\n$1\n```\n');

  // 3. Restore the original code blocks
  for (const key in blocks) {
    processedContent = processedContent.replace(key, blocks[key]);
  }

  // 4. Fix any code blocks that contain SVG but might be inline (e.g. ```xml <svg>...</svg> ```)
  // By ensuring they have newlines, react-markdown will parse them as block code (pre > code)
  processedContent = processedContent.replace(/```(?:xml|svg)?\s*(<svg[\s\S]*?<\/svg>)\s*```/gi, '\n```xml\n$1\n```\n');

  return (
    <div {...wrapperProps}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        children={processedContent}
        components={{
          code({ node, inline: isInlineCode, className, children, ...props }: any) {
            const match = /language-([\w-]+)/.exec(className || '');
            const isGraphDataClass = match && match[1] === 'graph-data';
            
            let graphDataString = '';
            let isGraphData = false;
            
            let nodeContent = getTextContent(node).trim();
            if (!nodeContent) {
              if (typeof children === 'string') {
                nodeContent = children.trim();
              } else if (Array.isArray(children)) {
                nodeContent = children.map(c => typeof c === 'string' ? c : '').join('').trim();
              }
            }

            if (isGraphDataClass) {
              isGraphData = true;
              graphDataString = nodeContent;
              if (!graphDataString) {
                graphDataString = node?.data?.meta || node?.properties?.meta || props.meta || '';
              }
            } else if (isInlineCode && nodeContent.startsWith('graph-data')) {
              // Handle case where it's parsed as inline code
              isGraphData = true;
              graphDataString = nodeContent.replace(/^graph-data\s*/, '').trim();
            } else if (nodeContent.startsWith('```graph-data')) {
               // Handle raw string case
               isGraphData = true;
               graphDataString = nodeContent.replace(/```graph-data\s*/, '').replace(/```$/, '').trim();
            } else {
               // Fallback: try to parse as JSON if it looks like graph data
               if (nodeContent.startsWith('{') && nodeContent.includes('"type"')) {
                 try {
                   const parsed = JSON.parse(nodeContent);
                   if (parsed && (parsed.type === 'line' || parsed.type === 'bar' || parsed.type === 'pie') && Array.isArray(parsed.data)) {
                     isGraphData = true;
                     graphDataString = nodeContent;
                   }
                 } catch (e) {
                   // Not JSON or not graph data
                 }
               }
            }
            
            if (isGraphData) {
              return (
                <GraphRenderer data={graphDataString} />
              );
            }

            // Handle SVG code blocks
            const isSvgMatch = nodeContent.match(/(<svg[\s\S]*<\/svg>)/i);
            if (isSvgMatch) {
              return (
                <span 
                  className="svg-container my-4 flex justify-center w-full"
                  dangerouslySetInnerHTML={{ __html: isSvgMatch[1] }} 
                />
              );
            }
            
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, children, ...props }: any) => {
            const firstChild = node?.children?.[0];
            const className = firstChild?.properties?.className;
            const hasGraphDataClass = Array.isArray(className) 
              ? className.includes('language-graph-data') 
              : className === 'language-graph-data' || (typeof className === 'string' && className.includes('language-graph-data'));
              
            let hasGraphData = hasGraphDataClass;
            let isSvg = false;
            let svgContent = '';
            
            let content = getTextContent(node).trim();
            if (!content) {
              if (typeof children === 'string') {
                content = children.trim();
              } else if (children && typeof children === 'object' && 'props' in children) {
                const childProps = children.props.children;
                if (typeof childProps === 'string') {
                  content = childProps.trim();
                } else if (Array.isArray(childProps)) {
                  content = childProps.map(c => typeof c === 'string' ? c : '').join('').trim();
                }
              }
            }
            console.log("MarkdownRenderer pre content:", content.substring(0, 50));
            
            if (!hasGraphData && content) {
               if (content.startsWith('{') && content.includes('"type"')) {
                 try {
                   const parsed = JSON.parse(content);
                   if (parsed && (parsed.type === 'line' || parsed.type === 'bar' || parsed.type === 'pie') && Array.isArray(parsed.data)) {
                     hasGraphData = true;
                   }
                 } catch (e) {
                   // Not JSON or not graph data
                 }
               } else {
                 const isSvgMatch = content.match(/(<svg[\s\S]*<\/svg>)/i);
                 if (isSvgMatch) {
                   isSvg = true;
                   svgContent = isSvgMatch[1];
                 }
               }
            }
              
            if (hasGraphData) {
              return <div className="w-full my-4">{children}</div>;
            }

            if (isSvg) {
              return (
                <span 
                  className="svg-container my-4 flex justify-center w-full"
                  dangerouslySetInnerHTML={{ __html: svgContent }} 
                />
              );
            }
            
            return <pre className="bg-slate-100 p-4 rounded-xl overflow-x-auto mb-4 text-sm font-mono text-slate-800" {...props}>{children}</pre>;
          },
          p: ({ children }) => inline ? <span className={className}>{children}</span> : <p className="mb-4 leading-relaxed break-keep whitespace-pre-wrap">{children}</p>,
          h1: ({ children }) => <h1 className="text-2xl font-black mb-4 mt-6">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-slate-700">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-200 pl-4 py-2 italic bg-slate-50 rounded-r-lg mb-4">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse border border-slate-200 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-slate-50 border border-slate-200 px-4 py-2 text-left text-sm font-bold text-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 px-4 py-2 text-sm text-slate-600">
              {children}
            </td>
          ),
        }}
      />
    </div>
  );
};

export default MarkdownRenderer;
