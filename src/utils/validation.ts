import { z } from 'zod';
import { PasswordCriteria } from '@/types/auth';

export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Ingresa un formato de email válido');

// Password criteria checks
export const checkPasswordCriteria = (password: string): PasswordCriteria => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
};

export const isPasswordValid = (password: string): boolean => {
  const criteria = checkPasswordCriteria(password);
  return (
    criteria.minLength &&
    criteria.hasUppercase &&
    criteria.hasLowercase &&
    criteria.hasDigit &&
    criteria.hasSymbol
  );
};

// Sign In Schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

// Sign Up Schema
export const signUpSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .refine((val) => /[A-Z]/.test(val), 'Debe incluir al menos una mayúscula')
    .refine((val) => /[a-z]/.test(val), 'Debe incluir al menos una minúscula')
    .refine((val) => /[0-9]/.test(val), 'Debe incluir al menos un dígito')
    .refine((val) => /[^A-Za-z0-9]/.test(val), 'Debe incluir al menos un símbolo'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los Términos y Condiciones',
  }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Change Password Schema
export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .refine((val) => /[A-Z]/.test(val), 'Debe incluir al menos una mayúscula')
      .refine((val) => /[a-z]/.test(val), 'Debe incluir al menos una minúscula')
      .refine((val) => /[0-9]/.test(val), 'Debe incluir al menos un dígito')
      .refine((val) => /[^A-Za-z0-9]/.test(val), 'Debe incluir al menos un símbolo'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
