import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { blockedAtom } from '@/atoms/blockedAtom';
import useAxiosInstance from '@/hooks/useAxios';
import { validatePreviousDate } from '@/utils/date';
import { registerForPushNotificationsAsync } from '@/utils/notifications';

import ImagePicker from '../components/common/ImagePicker';

import { authenticatedAtom } from './authAtoms/authAtom';

type SignUpFormField = {
  value: string;
  errorMessage?: string;
};

type SignUpForm = {
  email: SignUpFormField;
  phoneNumber: SignUpFormField;
  username: SignUpFormField;
  password: SignUpFormField;
  name: SignUpFormField;
  lastname: SignUpFormField;
  birthdate: SignUpFormField;
  repeatPassword: SignUpFormField;
  profilePicture?: SignUpFormField;
};

const getFormProps = (form: SignUpForm, prop: keyof SignUpFormField) => {
  return {
    name: form.name[prop],
    lastname: form.lastname[prop],
    email: form.email[prop],
    username: form.username[prop],
    birthdate: form.birthdate[prop],
    password: form.password[prop],
    repeatPassword: form.repeatPassword[prop],
    profilePicture: form.profilePicture?.[prop],
    phoneNumber: form.phoneNumber[prop]
  };
};

type FormRules = {
  required: boolean;
  pattern?: RegExp;
  customValidation?: (value: string) => boolean;
  minLength?: number;
  maxLength?: number;
  errorMessage: string;
};

const validationRules: Record<
  keyof Omit<SignUpForm, 'profilePicture' | 'registrationTime'>,
  FormRules
> = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 50,
    errorMessage: 'Name must be between 3 and 50 characters long.'
  },
  lastname: {
    required: true,
    minLength: 3,
    maxLength: 50,
    errorMessage: 'Last name must be between 3 and 50 characters long.'
  },
  email: {
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    errorMessage: 'Please enter a valid email address.'
  },
  phoneNumber: {
    required: true,
    pattern: /^\+\d{10,12}$/,
    errorMessage: 'Please enter a valid phone number'
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    errorMessage: 'Username must be between 3 and 50 characters long.'
  },
  birthdate: {
    required: true,
    customValidation: validatePreviousDate,
    errorMessage: 'Please enter a valid date in YYYY-MM-DD format.'
  },
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

const SignUp: () => React.JSX.Element = () => {
  const [, setIsAuthenticated] = useAtom(authenticatedAtom);
  const setBlocked = useSetAtom(blockedAtom);
  const axiosUsers = useAxiosInstance('users');
  const [entryTime, setEntryTime] = useState<Date>(new Date());
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isFormTouched, setIsFormTouched] = useState(false);

  const [form, setForm] = useState<SignUpForm>({
    name: { value: '' },
    lastname: { value: '' },
    email: { value: '' },
    phoneNumber: { value: '' },
    username: { value: '' },
    birthdate: { value: '' },
    password: { value: '' },
    repeatPassword: { value: '' },
    profilePicture: undefined
  });

  const calculateEventTime = () => {
    const now = new Date();
    const elapseTime = now.getTime() - entryTime.getTime();
    return elapseTime.toString();
  };

  const handleChange = useCallback((name: keyof SignUpForm, value: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      [name]: { value }
    }));
    setIsFormTouched(true);
  }, []);

  const onBlurValidate = useCallback(
    (field: keyof Omit<SignUpForm, 'profilePicture' | 'registrationTime'>) => {
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

  const handleImagePicked = (uri: string) => {
    setForm({
      ...form,
      profilePicture: { value: uri }
    });
  };

  const handleSubmit = async () => {
    if (form.password.value !== form.repeatPassword.value) {
      setForm({
        ...form,
        repeatPassword: { value: '', errorMessage: validationRules.repeatPassword.errorMessage }
      });
      return;
    }
    const timeSpent = calculateEventTime();

    const formData = getFormProps(form, 'value');

    const expoToken = await registerForPushNotificationsAsync();

    try {
      const response = await axiosUsers.post(
        `auth/register`,
        { ...formData, expoToken, registrationTime: timeSpent },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      if (response.status === 200) {
        await AsyncStorage.setItem('auth', JSON.stringify(response.data));
        setIsAuthenticated(response.data);
        setBlocked(false);
        router.push('./sign-up-location');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        alert('Error! Invalid email or username.');
      } else if (error.response && error.response.status === 409) {
        const existentField = error.response.data['custom-field'];
        alert(`${existentField} already in use. Please try another one.`);
      } else {
        alert('Error! Some fields are missing or have incorrect format.');
      }
      console.log('Last registration time in error: ', entryTime);
      setEntryTime(new Date());
    }
  };

  const isFormValid = useMemo(() => {
    const formProps = getFormProps(form, 'errorMessage');
    return (
      isFormTouched && Object.values(formProps).every((value) => !value) && !isUploadingPicture
    );
  }, [form, isUploadingPicture, isFormTouched]);

  return (
    <>
      <StatusBar backgroundColor={'rgb(5 5 5)'} barStyle={'light-content'} />
      <SafeAreaView style={{ flex: 1, flexDirection: 'column', backgroundColor: 'rgb(5 5 5)' }}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Create Account</Text>
          <View style={styles.inputContainer}>
            <TextInput
              label="First Name"
              value={form.name.value}
              mode="outlined"
              onChangeText={(value) => handleChange('name', value)}
              onBlur={() => onBlurValidate('name')}
              error={!!form.name.errorMessage}
              placeholder="First Name"
              theme={inputTheme}
            />
            {form.name.errorMessage && (
              <HelperText padding="none" type="error">
                {form.name.errorMessage}
              </HelperText>
            )}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              label="Last Name"
              value={form.lastname.value}
              mode="outlined"
              onChangeText={(value) => handleChange('lastname', value)}
              onBlur={() => onBlurValidate('lastname')}
              error={!!form.lastname.errorMessage}
              placeholder="Last Name"
              theme={inputTheme}
            />
            {form.lastname.errorMessage && (
              <HelperText padding="none" type="error">
                {form.lastname.errorMessage}
              </HelperText>
            )}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              label="Email"
              value={form.email.value}
              mode="outlined"
              onChangeText={(value) => handleChange('email', value)}
              onBlur={() => onBlurValidate('email')}
              error={!!form.email.errorMessage}
              placeholder="Email"
              theme={inputTheme}
            />
            {form.email.errorMessage && (
              <HelperText padding="none" type="error">
                {form.email.errorMessage}
              </HelperText>
            )}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              label="Phone number"
              value={form.phoneNumber.value}
              mode="outlined"
              onChangeText={(value) => handleChange('phoneNumber', value)}
              onBlur={() => onBlurValidate('phoneNumber')}
              error={!!form.phoneNumber.errorMessage}
              placeholder="Phone number"
              theme={inputTheme}
            />
            {form.phoneNumber.errorMessage && (
              <HelperText padding="none" type="error">
                {form.phoneNumber.errorMessage}
              </HelperText>
            )}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              label="Username"
              value={form.username.value}
              mode="outlined"
              onChangeText={(value) => handleChange('username', value)}
              onBlur={() => onBlurValidate('username')}
              error={!!form.username.errorMessage}
              placeholder="Username"
              theme={inputTheme}
            />
            {form.username.errorMessage && (
              <HelperText padding="none" type="error">
                {form.username.errorMessage}
              </HelperText>
            )}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              label="Birthdate"
              value={form.birthdate.value}
              mode="outlined"
              onChangeText={(value) => handleChange('birthdate', value)}
              placeholder="YYYY-MM-DD"
              onBlur={() => onBlurValidate('birthdate')}
              error={!!form.birthdate.errorMessage}
              theme={inputTheme}
            />
            {form.birthdate.errorMessage && (
              <HelperText padding="none" type="error">
                {form.birthdate.errorMessage}
              </HelperText>
            )}
          </View>
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
          <ImagePicker
            username={form.username.value}
            onImagePicked={handleImagePicked}
            onLoadingChange={setIsUploadingPicture}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            disabled={!isFormValid}
          >
            Sign Up
          </Button>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5, 5, 5)',
    paddingHorizontal: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white'
  },
  inputContainer: {
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

export default SignUp;
