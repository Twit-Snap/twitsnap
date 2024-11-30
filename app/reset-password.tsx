import { useLocalSearchParams, useRootNavigationState, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import useAxiosInstance from '@/hooks/useAxios';
import { FormRules } from '@/utils/form';

type ResetPasswordFormField = {
  value: string;
  errorMessage?: string;
};

type ResetPasswordForm = {
  password: ResetPasswordFormField;
  repeatPassword: ResetPasswordFormField;
};

const validationRules: Record<keyof ResetPasswordForm, FormRules> = {
  password: {
    required: true,
    minLength: 3,
    maxLength: 50,
    errorMessage: 'Password must be between 3 and 50 characters long.'
  },
  repeatPassword: {
    required: true,
    errorMessage: 'Passwords do not match.'
  }
};

const ResetPassword: () => React.JSX.Element = () => {
  const router = useRouter();
  const { email, token } = useLocalSearchParams<{ email: string; token: string }>();
  const axiosUsers = useAxiosInstance('users');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFormTouched, setIsFormTouched] = useState(false);
  const rootNavigationState = useRootNavigationState();

  const [form, setForm] = useState<ResetPasswordForm>({
    password: { value: '' },
    repeatPassword: { value: '' }
  });

  const handleResetPassword = async () => {
    if (form.password.value !== form.repeatPassword.value) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await axiosUsers.post(
        `auth/reset-password`,
        { email, token, newPassword: form.password.value },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.status === 200) {
        setSuccessMessage('Password has been reset successfully.');
        setErrorMessage(null);
        router.push('/sign-in'); // Redirect to sign-in page
      } else {
        setErrorMessage('Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  const onBlurValidate = useCallback(
    (field: keyof ResetPasswordForm) => {
      const rules: FormRules = validationRules[field];
      const value = form[field].value;

      if (rules.required && !value) {
        setForm({
          ...form,
          [field]: { value, errorMessage: rules.errorMessage }
        });
        return;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        setForm({
          ...form,
          [field]: { value, errorMessage: rules.errorMessage }
        });
        return;
      }

      if (rules.customValidation && !rules.customValidation(value)) {
        setForm({
          ...form,
          [field]: { value, errorMessage: rules.errorMessage }
        });
        return;
      }

      if (rules.minLength && value.length < rules.minLength) {
        setForm({
          ...form,
          [field]: { value, errorMessage: rules.errorMessage }
        });
        return;
      }

      if (field === 'repeatPassword' && form.password.value !== form.repeatPassword.value) {
        setForm({
          ...form,
          [field]: { value, errorMessage: validationRules.repeatPassword.errorMessage }
        });
        return;
      }
    },
    [form]
  );

  const handleChange = useCallback(
    (field: keyof ResetPasswordForm, value: string) => {
      setForm({ ...form, [field]: { value } });
      setIsFormTouched(true);
    },
    [form]
  );

  const isFormValid = useMemo(() => {
    return (
      isFormTouched &&
      form.password.value === form.repeatPassword.value &&
      !form.password.errorMessage
    );
  }, [form, isFormTouched]);

  useEffect(() => {
    console.log('effect', email, token);
    if (!email || !token) {
      console.log('invalid link');
      if (rootNavigationState?.key) {
        // Check if mounted before navigating
        console.log('pushing to home');
        //router.push('/'); // Redirect to home or another appropriate page
      }
    }
  }, [email, router, token, rootNavigationState]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={form.password.value}
          mode="outlined"
          label="Password"
          onChangeText={(value) => handleChange('password', value)}
          onBlur={() => onBlurValidate('password')}
          error={!!form.password.errorMessage}
          placeholder="Password"
          secureTextEntry
          theme={inputTheme}
        />
        {form.password.errorMessage && (
          <HelperText padding="none" type="error">
            {form.password.errorMessage}
          </HelperText>
        )}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          value={form.repeatPassword.value}
          mode="outlined"
          label="Repeat Password"
          onChangeText={(value) => handleChange('repeatPassword', value)}
          onBlur={() => onBlurValidate('repeatPassword')}
          error={!!form.repeatPassword.errorMessage}
          placeholder="Repeat Password"
          secureTextEntry
          theme={inputTheme}
        />
        {form.repeatPassword.errorMessage && (
          <HelperText padding="none" type="error">
            {form.repeatPassword.errorMessage}
          </HelperText>
        )}
      </View>
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}
      <Button
        onPress={handleResetPassword}
        mode="contained"
        style={styles.button}
        disabled={!isFormValid}
      >
        Reset Password
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgb(5, 5, 5)'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20
  },
  inputContainer: {
    marginBottom: 12
  },
  error: {
    color: 'red',
    marginBottom: 12
  },
  success: {
    color: 'green',
    marginBottom: 12
  },
  button: {
    marginTop: 20,
    backgroundColor: 'rgb(3, 165, 252)'
  }
});

const inputTheme = {
  colors: {
    primary: 'rgb(3, 165, 252)',
    placeholder: 'rgb(113, 118, 123)',
    onSurface: 'white',
    background: 'rgb(5, 5, 5)'
  }
};

export default ResetPassword;
