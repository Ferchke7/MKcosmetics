import React from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Sparkles, MessageCircle, RotateCcw, ArrowRight, CheckCircle2, HeartHandshake } from 'lucide-react';
import { useSkinQuiz } from '../../../hooks/useSkinQuiz';
import { Product } from '../../../core/types/product';

interface ConsultationQuizProps {
  formatPrice: (amt: number) => string;
  onQuickView: (p: Product) => void;
}

export const ConsultationQuiz: React.FC<ConsultationQuizProps> = ({
  formatPrice,
  onQuickView,
}) => {
  const {
    currentStep,
    totalSteps,
    currentQuestion,
    isCompleted,
    answers,
    handleSelectOption,
    restartQuiz,
    getRecommendedProducts,
    generateConsultationUrl,
  } = useSkinQuiz();

  const recommended = getRecommendedProducts();

  const handleOpenWhatsApp = () => {
    const url = generateConsultationUrl();
    window.open(url, '_blank');
  };

  return (
    <section id="skin-quiz" className="py-20 sm:py-28 bg-gradient-to-b from-[#FAF7F2] via-[#F7EDE8]/50 to-[#FAF7F2] scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Индивидуальный подбор"
          badgeIcon={<HeartHandshake className="w-3.5 h-3.5 text-[#C2836B]" />}
          title="Пройдите быстрый тест за 1 минуту"
          subtitle="Ответьте на 3 простых вопроса, и эксперт составит персональную программу корейского ухода"
        />

        <Card glass className="p-6 sm:p-10 border-[#EED9CF] relative overflow-hidden">
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#E8A598]/20 rounded-full blur-2xl pointer-events-none" />

          {!isCompleted ? (
            <div className="space-y-8">
              {/* Progress Steps Indicator */}
              <div className="flex items-center justify-between border-b border-[#F0E6DE] pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A96851]">
                    Шаг {currentStep + 1} из {totalSteps}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[...Array(totalSteps)].map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStep
                          ? 'w-8 bg-[#C2836B]'
                          : idx < currentStep
                          ? 'w-3 bg-[#E1BEAF]'
                          : 'w-3 bg-[#F0E6DE]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Heading */}
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#2D2A2E]">
                  {currentQuestion.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8C827A] mt-1">
                  {currentQuestion.subtitle}
                </p>
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(currentQuestion.key, option.id)}
                    className="p-4 rounded-2xl bg-white hover:bg-[#FAF5EE] border border-[#EED9CF] hover:border-[#C2836B] transition-all text-left group flex items-start gap-3.5 shadow-xs hover:shadow-soft"
                  >
                    <span className="text-2xl p-2 rounded-xl bg-[#FAF7F2] group-hover:bg-white transition-colors">
                      {option.icon}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#2D2A2E] group-hover:text-[#C2836B] transition-colors">
                        {option.label}
                      </h4>
                      <p className="text-xs text-[#8C827A] mt-0.5 leading-relaxed">
                        {option.sublabel}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Quiz Completed State */
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#2D2A2E]">
                  Ваша индивидуальная программа готова!
                </h3>
                <p className="text-xs sm:text-sm text-[#6C635B] max-w-md mx-auto mt-2">
                  Мы подобрали средства, которые идеально дополнят друг друга и решат поставленную задачу:
                </p>
              </div>

              {/* Recommended Mini-cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
                {recommended.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => onQuickView(prod)}
                    className="p-3.5 rounded-2xl bg-white border border-[#EED9CF] hover:border-[#C2836B] transition-all cursor-pointer shadow-xs hover:shadow-soft"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full aspect-square object-cover rounded-xl mb-2"
                    />
                    <span className="text-[10px] font-semibold text-[#A96851] uppercase block">
                      {prod.brand}
                    </span>
                    <h5 className="text-xs font-medium text-[#2D2A2E] truncate mt-0.5">
                      {prod.name}
                    </h5>
                    <span className="text-xs font-bold text-[#C2836B] block mt-1">
                      {formatPrice(prod.priceKrw)}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#F0E6DE]">
                <Button
                  variant="whatsapp"
                  size="lg"
                  onClick={handleOpenWhatsApp}
                  icon={<MessageCircle className="w-5 h-5" />}
                >
                  Отправить результат Мухаббат в WhatsApp
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={restartQuiz}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Пройти тест заново
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};
