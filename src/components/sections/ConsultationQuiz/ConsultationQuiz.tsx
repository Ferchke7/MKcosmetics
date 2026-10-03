import React from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { CheckCircle2, HeartHandshake, MessageCircle, RotateCcw, Loader2 } from 'lucide-react';
import { useSkinQuiz } from '../../../hooks/useSkinQuiz';
import { QUIZ_QUESTIONS } from '../../../hooks/useSkinQuiz';
import { adminService } from '../../../services/admin/adminService';

export const ConsultationQuiz: React.FC = () => {
  const {
    currentStep,
    totalSteps,
    currentQuestion,
    isCompleted,
    answers,
    handleSelectOption,
    restartQuiz,
    generateConsultationUrl,
  } = useSkinQuiz();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedAnswers = QUIZ_QUESTIONS.map((question) => {
    const answerId = answers[question.key];
    const answer = question.options.find((option) => option.id === answerId);
    return answer ? { question: question.title.replace(/^\d+\.\s*/, ''), answer: answer.label } : null;
  }).filter((answer): answer is { question: string; answer: string } => answer !== null);

  const handleOpenWhatsApp = async () => {
    setIsSubmitting(true);
    const answersSummary = selectedAnswers.map((a) => `${a.question}: ${a.answer}`).join('\n');
    try {
      await adminService.createPublicOrder({
        customerName: 'Лид из Квиза (Подбор ухода)',
        phone: '',
        channelSource: 'skin_quiz',
        type: 'quiz_consultation',
        items: [],
        totalAmount: 0,
        currency: 'KRW',
        notes: `Ответы на тест по подбору ухода:\n${answersSummary}`,
      });
    } catch (err) {
      console.warn('Could not save quiz lead to CRM:', err);
    } finally {
      setIsSubmitting(false);
    }

    window.open(generateConsultationUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="skin-quiz" className="scroll-mt-20 bg-[#FAF8F5] py-16 sm:py-24 border-t border-[#ECE8E1]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Консультация"
          badgeIcon={<HeartHandshake className="h-3.5 w-3.5 text-[#B89254]" />}
          title="Подобрать уход"
          subtitle="Ответьте на три вопроса. Мы подготовим сообщение для консультации в WhatsApp."
        />

        <Card glass className="relative overflow-hidden border-[#ECE8E1] bg-white p-6 sm:p-9 shadow-sm">
          {!isCompleted ? (
            <div className="space-y-7">
              <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B89254]">
                  Шаг {currentStep + 1} из {totalSteps}
                </span>
                <div className="flex items-center gap-1.5" aria-label={`Шаг ${currentStep + 1} из ${totalSteps}`}>
                  {[...Array(totalSteps)].map((_, index) => (
                    <span
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'w-8 bg-[#B89254]'
                          : index < currentStep
                          ? 'w-3 bg-[#DFCBA0]'
                          : 'w-3 bg-[#ECE8E1]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A1917] sm:text-2xl">
                  {currentQuestion.title}
                </h3>
                <p className="mt-1 text-sm text-[#8A8680]">{currentQuestion.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.key, option.id)}
                    className="group flex items-start gap-3.5 rounded-2xl border border-[#ECE8E1] bg-[#FAF8F5] p-4 text-left shadow-2xs transition-colors hover:border-[#B89254] hover:bg-[#F7F4EF] cursor-pointer"
                  >
                    <span className="rounded-xl bg-white p-2 text-2xl transition-colors border border-[#ECE8E1]">
                      {option.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#1A1917] transition-colors group-hover:text-[#B89254]">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#8A8680]">
                        {option.sublabel}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1A1917] sm:text-3xl">
                  Ваш запрос готов
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#8A8680]">
                  Проверьте ответы и продолжите в WhatsApp. Консультант обсудит с вами подходящий уход.
                </p>
              </div>

              <dl className="mx-auto max-w-lg divide-y divide-[#ECE8E1] rounded-2xl border border-[#ECE8E1] bg-[#FAF8F5] px-4 text-left">
                {selectedAnswers.map(({ question, answer }) => (
                  <div key={question} className="py-3">
                    <dt className="text-xs text-[#8A8680]">{question}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-[#1A1917]">{answer}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col items-center justify-center gap-3 border-t border-[#ECE8E1] pt-5 sm:flex-row">
                <Button
                  variant="whatsapp"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handleOpenWhatsApp}
                  icon={isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
                >
                  {isSubmitting ? 'Создание...' : 'Продолжить в WhatsApp'}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={restartQuiz}
                  icon={<RotateCcw className="h-4 w-4" />}
                  className="border border-[#ECE8E1] text-[#1A1917] hover:border-[#B89254]"
                >
                  Начать заново
                </Button>
              </div>
              <p className="text-xs text-[#8A8680]">В WhatsApp откроется черновик. Нажмите «Отправить».</p>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};
