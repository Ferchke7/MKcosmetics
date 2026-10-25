import React from 'react';

interface ProductDescriptionProps {
  description: string;
  excerpt?: string;
  brand?: string;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  excerpt,
}) => {
  const rawContent = description || excerpt || '';
  if (!rawContent.trim()) {
    return null;
  }

  // Normalize line breaks and strip any raw HTML tags
  let cleaned = rawContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .trim();

  // Split into logical paragraphs
  const paragraphs = cleaned
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // If text didn't have double line breaks, split by single line break
  const blocks = paragraphs.length > 1 ? paragraphs : cleaned.split('\n').map((l) => l.trim()).filter(Boolean);

  const keyPrefixes = [
    'способ применения:',
    'применение:',
    'как использовать:',
    'состав:',
    'активные ингредиенты:',
    'активные компоненты:',
    'линия основана на:',
    'особенности:',
    'действие:',
    'преимущества:',
    'объем:',
    'объём:',
    'вес:',
    'производство:',
  ];

  return (
    <div className="text-sm sm:text-base text-ink/85 leading-relaxed font-sans space-y-3.5 pt-1">
      {blocks.map((block, idx) => {
        const lower = block.toLowerCase();

        // Check if block starts with a bullet point
        if (block.startsWith('•') || block.startsWith('-') || block.startsWith('*')) {
          const content = block.replace(/^[•\-*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold/70 shrink-0 mt-2.5" />
              <span className="text-sm text-ink/80 leading-relaxed">{content}</span>
            </div>
          );
        }

        // Check if block starts with a known header like "Способ применения:", "Состав:"
        for (const prefix of keyPrefixes) {
          if (lower.startsWith(prefix)) {
            const splitPos = block.indexOf(':') + 1;
            const header = block.slice(0, splitPos);
            const rest = block.slice(splitPos).trim();

            return (
              <p key={idx} className="text-sm text-ink/80 leading-relaxed pt-1">
                <span className="font-semibold text-ink text-sm sm:text-base block mb-1">
                  {header}
                </span>
                {rest && <span>{rest}</span>}
              </p>
            );
          }
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-sm text-ink/80 leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
};
