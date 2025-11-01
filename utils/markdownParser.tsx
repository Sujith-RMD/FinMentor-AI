import React from 'react';

const parseInline = (text: string): React.ReactNode[] => {
    // Handles **bold** text
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const MarkdownRenderer = ({ text }: { text: string }) => {
    if (!text) return null;

    // Split by multiple newlines to identify blocks
    const blocks = text.split(/\n\s*\n/).filter(Boolean);

    return (
        <div className="space-y-2">
            {blocks.map((block, i) => {
                const trimmedBlock = block.trim();
                
                // Headings
                if (trimmedBlock.startsWith('# ')) {
                    return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{parseInline(trimmedBlock.substring(2))}</h1>;
                }
                if (trimmedBlock.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-semibold mt-3 mb-1">{parseInline(trimmedBlock.substring(3))}</h2>;
                }

                // Lists
                if (trimmedBlock.startsWith('* ') || trimmedBlock.startsWith('- ')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^[*-]\s/, ''));
                    return (
                        <ul key={i} className="list-disc list-inside space-y-1 pl-2">
                            {items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
                        </ul>
                    );
                }

                // Tables
                if (trimmedBlock.includes('|')) {
                    const lines = trimmedBlock.split('\n').filter(Boolean);
                    if (lines.length < 2 || !lines[1].includes('---')) {
                        return <p key={i}>{parseInline(trimmedBlock)}</p>;
                    }

                    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
                    const rows = lines.slice(2).map(rowLine => rowLine.split('|').map(cell => cell.trim()).filter(Boolean));

                    if (headers.length === 0) return <p key={i}>{parseInline(trimmedBlock)}</p>;

                    return (
                        <div key={i} className="my-4 overflow-x-auto rounded-lg border dark:border-gray-600 border-gray-300">
                            <table className="min-w-full text-sm">
                                <thead className="dark:bg-gray-700/40 bg-gray-100">
                                    <tr>
                                        {headers.map((header, hIndex) => (
                                            <th key={hIndex} className="px-4 py-2 text-left font-semibold dark:text-gray-200 text-gray-700">{parseInline(header)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="dark:divide-gray-600 divide-gray-300">
                                    {rows.map((row, rIndex) => (
                                        <tr key={rIndex} className="dark:even:bg-gray-800/20 even:bg-gray-50/50">
                                            {row.map((cell, cIndex) => (
                                                <td key={cIndex} className="px-4 py-2 align-top">{parseInline(cell)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }

                // Paragraph
                return <p key={i}>{parseInline(trimmedBlock)}</p>;
            })}
        </div>
    );
};

export default MarkdownRenderer;
