export type FormRules = {
  required: boolean;
  pattern?: RegExp;
  customValidation?: (value: string) => boolean;
  minLength?: number;
  maxLength?: number;
  errorMessage: string;
};
