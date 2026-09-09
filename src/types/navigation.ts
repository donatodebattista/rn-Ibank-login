export type AuthRoutes = {
  'sign-in': undefined;
  'sign-up': undefined;
  'pending-confirmation': { email?: string };
  'forgot-password': { email?: string };
  'change-password': { code?: string };
};

export type AppRoutes = {
  home: undefined;
};
