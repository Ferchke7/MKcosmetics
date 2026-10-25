import React, { useState } from 'react';
import { Sparkles, Droplets, Scale, Globe2, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ProductDescriptionProps {
  description: string;
  excerpt?: string;
  brand?: string;
}

interface ParsedSections {
  specs: { volume?: string; weight?: string; origin?: string };
  mainText: string[];
  featuresText: string[];
  usageText: string;
  ingredientsText: string;
}

function parseDescription(raw: string): ParsedSections {
  // Normalize line breaks and clean tags
  let text = raw.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<[^>]*>/g, '');

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const specs: { volume?: string; weight?: string; origin?: string } = {
    origin: 'Южная Корея (Сеул)',
  };

  let usageLines: string[] = [];
  let ingredientLines: string[] = [];
  let featureLines: string[] = [];
  let mainLines: string[] = [];

  let currentSection: 'main' | 'features' | 'usage' | 'ingredients' = 'main';

  for (let line of lines) {
    const lower = line.toLowerCase();

    // Check for volume
    if (lower.startsWith('объем:') || lower.startsWith('объём:') || lower.startsWith('объем ') || lower.startsWith('объём ')) {
      const val = line.replace(/^[оО][бБ][ъЪьЬ][еЕ][мМ][: ]*/, '').trim();
      if (val && !specs.volume) {
        specs.volume = val;
        continue;
      }
    }

    // Check for weight
    if (lower.startsWith('вес:') || lower.startsWith('вес ')) {
      const val = line.replace(/^[вВ][еЕ][сС][: ]*/, '').trim();
      if (val && !specs.weight) {
        specs.weight = val;
        continue;
      }
    }

    // Check for country/origin
    if (lower.includes('производство:') || lower.includes('производитель:')) {
      const val = line.replace(/^[пП]роизводство[: ]*/, '').trim();
      if (val) {
        specs.origin = val;
        continue;
      }
    }

    // Check section transitions
    if (lower.startsWith('способ применения:') || lower.startsWith('применение:') || lower.startsWith('как использовать:') || lower.includes('способ применения')) {
      currentSection = 'usage';
      const clean = line.replace(/^[^:]*:\s*/, '').trim();
      if (clean) usageLines.push(clean);
      continue;
    }

    if (lower.startsWith('состав:') || lower.startsWith('активные ингредиенты:') || lower.startsWith('активные компоненты:') || lower.startsWith('линия основана на:')) {
      currentSection = 'ingredients';
      const clean = line.replace(/^[^:]*:\s*/, '').trim();
      if (clean) ingredientLines.push(clean);
      continue;
    }

    if (lower.startsWith('особенности:') || lower.startsWith('действие:') || lower.startsWith('преимущества:')) {
      currentSection = 'features';
      const clean = line.replace(/^[^:]*:\s*/, '').trim();
      if (clean) featureLines.push(clean);
      continue;
    }

    // Append to current section
    if (currentSection === 'usage') {
      usageLines.push(line);
    } else if (currentSection === 'ingredients') {
      ingredientLines.push(line);
    } else if (currentSection === 'features') {
      featureLines.push(line);
    } else {
      mainLines.push(line);
    }
  }

  return {
    specs,
    mainText: mainLines,
    featuresText: featureLines,
    usageText: usageLines.join(' '),
    ingredientsText: ingredientLines.join('\n'),
  };
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  excerpt,
  brand,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawContent = description || excerpt || '';
  if (!rawContent.trim()) {
    return null;
  }

  const parsed = parseDescription(rawContent);
  const isLongContent = rawContent.length > 380 || parsed.mainText.length > 3 || Boolean(parsed.usageText) || Boolean(parsed.ingredientsText);

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Quick Luxury Specs Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {parsed.specs.volume && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream/70 border border-gold/20 text-ink text-xs font-medium">
            <Droplets className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>Объем: <strong>{parsed.specs.volume}</strong></span>
          </div>
        )}
        {parsed.specs.weight && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream/70 border border-gold/20 text-ink text-xs font-medium">
            <Scale className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>Вес: <strong>{parsed.specs.weight}</strong></span>
          </div>
        )}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-line text-ink/70 text-xs">
          <Globe2 className="w-3.5 h-3.5 text-gold/80 shrink-0" />
          <span>{parsed.specs.origin}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Оригинал</span>
        </div>
      </div>

      {/* 2. Structured Description Content */}
      <div className="relative">
        <div
          className={`space-y-4 text-xs sm:text-sm text-ink/80 leading-relaxed font-sans overflow-hidden transition-all duration-300 ${
            !isExpanded && isLongContent ? 'max-h-48' : 'max-h-[3000px]'
          }`}
        >
          {/* Main Story Paragraphs */}
          {parsed.mainText.length > 0 ? (
            parsed.mainText.map((p, idx) => {
              // Highlight first paragraph as an elegant lead quote
              if (idx === 0) {
                return (
                  <p
                    key={idx}
                    className="font-serif text-sm sm:text-base text-ink font-normal leading-relaxed pl-3 border-l-2 border-gold/40 py-0.5"
                  >
                    {p}
                  </p>
                );
              }

              // Check if bullet point
              if (p.startsWith('•') || p.startsWith('-') || p.startsWith('*')) {
                const bulletText = p.replace(/^[•\-*]\s*/, '');
                return (
                  <div key={idx} className="flex items-start gap-2 pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-2" />
                    <span>{bulletText}</span>
                  </div>
                );
              }

              return <p key={idx}>{p}</p>;
            })
          ) : (
            <p>{rawContent}</p>
          )}

          {/* Features Block (if present) */}
          {parsed.featuresText.length > 0 && (
            <div className="bg-cream/30 rounded-2xl p-4 border border-gold/15 space-y-2 mt-3">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-gold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Особенности и преимущества</span>
              </div>
              <div className="space-y-1.5">
                {parsed.featuresText.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-ink/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage / Ritual Block */}
          {parsed.usageText && (
            <div className="bg-gradient-to-r from-cream/40 via-cream/20 to-transparent rounded-2xl p-4 sm:p-5 border border-gold/25 space-y-2 mt-3">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-gold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Ритуал применения</span>
              </div>
              <p className="text-xs sm:text-sm text-ink/85 leading-relaxed font-serif italic">
                {parsed.usageText}
              </p>
            </div>
          )}

          {/* Ingredients / Active Formula Block */}
          {parsed.ingredientsText && (
            <div className="rounded-2xl p-4 bg-paper border border-line space-y-2 mt-3">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-ink/60 flex items-center gap-1.5">
                <span>Активные компоненты и формула</span>
              </div>
              <p className="text-xs text-ink/75 leading-relaxed">
                {parsed.ingredientsText}
              </p>
            </div>
          )}
        </div>

        {/* Gradient fade overlay when collapsed */}
        {!isExpanded && isLongContent && (
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / Collapse Button */}
      {isLongContent && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-dark transition-colors cursor-pointer py-1"
        >
          <span>{isExpanded ? 'Свернуть описание' : 'Читать описание полностью'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}
    </div>
  );
};
