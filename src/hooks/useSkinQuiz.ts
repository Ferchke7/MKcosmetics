import { useState } from 'react';
import { Product } from '../core/types/product';
import { PRODUCTS_CATALOG } from '../services/product/productData';
import { buildWhatsAppUrl } from '../core/constants/brand';

export interface QuizQuestionData {
  title: string;
  subtitle: string;
  key: 'skinType' | 'skinConcern' | 'productType';
  options: {
    id: string;
    label: string;
    sublabel: string;
    icon: string;
  }[];
}

export const QUIZ_QUESTIONS: QuizQuestionData[] = [
  {
    key: 'skinType',
    title: '1. Какой у вас тип кожи?',
    subtitle: 'Выберите наиболее подходящее описание',
    options: [
      { id: 'dry', label: 'Сухая / Обезвоженная', sublabel: 'Стянутость, шелушения, тусклость', icon: '💧' },
      { id: 'combination', label: 'Комбинированная / Жирная', sublabel: 'Жирный блеск в Т-зоне, расширенные поры', icon: '✨' },
      { id: 'sensitive', label: 'Чувствительная / Реактивная', sublabel: 'Покраснения, раздражения, зуд', icon: '🌿' },
      { id: 'mature', label: 'Возрастная / Зрелая', sublabel: 'Снижение тонуса, мимические заломы', icon: '👑' },
      { id: 'normal', label: 'Нормальная', sublabel: 'Комфортное состояние, поддержка баланса', icon: '🌸' },
    ],
  },
  {
    key: 'skinConcern',
    title: '2. Какую главную задачу хотите решить?',
    subtitle: 'Наш эксперт подберет прицельное решение',
    options: [
      { id: 'anti-age', label: 'Лифтинг и разглаживание морщин', sublabel: 'Борьба с возрастными изменениями и заломами', icon: '💎' },
      { id: 'brightening', label: 'Пигментация и тусклый тон', sublabel: 'Осветление пятен, эффект сияния Glass Skin', icon: '🌟' },
      { id: 'pores-acne', label: 'Поры, черные точки, воспаления', sublabel: 'Борьба с акне, выравнивание микрорельефа', icon: '🧼' },
      { id: 'hydration', label: 'Глубокое увлажнение и комфорт', sublabel: 'Наполнение влагой изнутри, устранение сухости', icon: '🌊' },
      { id: 'sensitive', label: 'Восстановление барьера кожи', sublabel: 'Укрепление микробиома после стресса и пилингов', icon: '🛡️' },
    ],
  },
  {
    key: 'productType',
    title: '3. Какой формат ухода вам ближе?',
    subtitle: 'Выберите удобный формат',
    options: [
      { id: 'set', label: 'Комплексный премиум-набор', sublabel: 'Полная многоступенчатая система ухода', icon: '🎁' },
      { id: 'serum', label: 'Активная сыворотка / Ампула', sublabel: 'Концентрированное действие', icon: '🧪' },
      { id: 'peeling', label: 'Пилинг-пэды / Тонер', sublabel: 'Деликатное обновление и очищение', icon: '✨' },
      { id: 'sun', label: 'Защита от солнца и фотостарения', sublabel: 'Легкий SPF для ежедневного применения', icon: '☀️' },
    ],
  },
];

export function useSkinQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{
    skinType?: string;
    skinConcern?: string;
    productType?: string;
  }>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectOption = (key: 'skinType' | 'skinConcern' | 'productType', value: string) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const restartQuiz = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
  };

  const getRecommendedProducts = (): Product[] => {
    if (!isCompleted) return [];

    let filtered = PRODUCTS_CATALOG.filter((product) => {
      if (answers.skinConcern && product.skinConcerns.includes(answers.skinConcern as any)) {
        return true;
      }
      return false;
    });

    if (filtered.length < 2) {
      filtered = PRODUCTS_CATALOG.slice(0, 3);
    }

    return filtered.slice(0, 3);
  };

  const generateConsultationUrl = (): string => {
    const typeLabel = QUIZ_QUESTIONS[0].options.find((o) => o.id === answers.skinType)?.label || 'не указан';
    const concernLabel = QUIZ_QUESTIONS[1].options.find((o) => o.id === answers.skinConcern)?.label || 'не указана';
    const productLabel = QUIZ_QUESTIONS[2].options.find((o) => o.id === answers.productType)?.label || 'не указан';

    const message = `🌸 *Здравствуйте, Мухаббат!*
Я прошел(ла) тест по подбору ухода на вашем сайте MK KOREA COSMETIC:

▫️ *Тип кожи:* ${typeLabel}
▫️ *Главная задача:* ${concernLabel}
▫️ *Желаемый формат:* ${productLabel}

Пожалуйста, помогите подобрать идеальную корейскую программу ухода и оформить доставку ✨`;

    return buildWhatsAppUrl(message);
  };

  return {
    currentStep,
    totalSteps: QUIZ_QUESTIONS.length,
    currentQuestion: QUIZ_QUESTIONS[currentStep],
    answers,
    isCompleted,
    handleSelectOption,
    restartQuiz,
    getRecommendedProducts,
    generateConsultationUrl,
    setCurrentStep,
  };
}
