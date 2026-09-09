import { useMemo } from 'react';
import { PasswordCriteria } from '@/types/auth';
import { checkPasswordCriteria } from '@/utils/validation';

export function usePasswordRules(password: string = '') {
  const criteria = useMemo<PasswordCriteria>(() => {
    return checkPasswordCriteria(password);
  }, [password]);

  const isValid = useMemo(() => {
    return (
      criteria.minLength &&
      criteria.hasUppercase &&
      criteria.hasLowercase &&
      criteria.hasDigit &&
      criteria.hasSymbol
    );
  }, [criteria]);

  return {
    criteria,
    isValid,
  };
}
