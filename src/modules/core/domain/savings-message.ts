export type SavingsLevel = 'warn' | 'info' | 'good';

export function savingsMessage(rate: number): { level: SavingsLevel; text: string } {
  const pct = rate * 100;
  if (pct <= 5) {
    return {
      level: 'warn',
      text: 'Podrías ahorrar más. Revisa tus gastos y ajusta tu plan.',
    };
  }
  if (pct <= 10) {
    return {
      level: 'info',
      text: 'Es un porcentaje aceptable. Mantén la disciplina para lograrlo.',
    };
  }
  if (pct <= 15) {
    return {
      level: 'good',
      text: 'Buena meta de ahorro. Tu yo del futuro te lo va a agradecer.',
    };
  }
  if (pct <= 25) {
    return {
      level: 'good',
      text: 'Muy bien: es un nivel de ahorro ideal.',
    };
  }
  return {
    level: 'good',
    text: 'Excelente. El siguiente paso es poner ese ahorro a rendir.',
  };
}
