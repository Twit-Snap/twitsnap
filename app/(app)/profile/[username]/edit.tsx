import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, HelperText, IconButton, TextInput } from 'react-native-paper';

import { ModifiableUser } from '@/app/types/publicUser';
import ImagePicker from '@/components/common/ImagePicker';
import useAxiosInstance from '@/hooks/useAxios';
import { validatePreviousDate } from '@/utils/date';
import { FormRules } from '@/utils/form';

type FormField = {
  value: string;
  errorMessage?: string;
};

type ModifiableUserForm = {
  name: FormField;
  lastname: FormField;
  birthdate: FormField;
  isPrivate: FormField;
  profilePicture?: FormField;
  backgroundPicture?: FormField;
};

type ModifiableUserFormInputs = Omit<
  ModifiableUserForm,
  'profilePicture' | 'backgroundPicture' | 'isPrivate'
>;

const getFormProps = (form: ModifiableUserForm, prop: keyof FormField) => {
  return {
    name: form.name[prop],
    lastname: form.lastname[prop],
    birthdate: form.birthdate[prop],
    isPrivate: form.isPrivate[prop]
  };
};

const validationRules: Record<keyof ModifiableUserFormInputs, FormRules> = {
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
  birthdate: {
    required: true,
    customValidation: validatePreviousDate,
    errorMessage: 'Please enter a valid date in YYYY-MM-DD format.'
  }
};

const extractUserChanges = (originalUserData: ModifiableUser, newUserData: ModifiableUserForm) => {
  const changes: Partial<ModifiableUser> = {
    name: newUserData.name.value === originalUserData.name ? undefined : newUserData.name.value,
    lastname:
      newUserData.lastname.value === originalUserData.lastname
        ? undefined
        : newUserData.lastname.value,
    birthdate:
      newUserData.birthdate.value === originalUserData.birthdate
        ? undefined
        : newUserData.birthdate.value,
    isPrivate:
      newUserData.isPrivate.value === originalUserData.isPrivate?.toString()
        ? undefined
        : newUserData.isPrivate.value === 'true',
    profilePicture:
      newUserData.profilePicture?.value === originalUserData.profilePicture
        ? undefined
        : newUserData.profilePicture?.value,
    backgroundPicture:
      newUserData.backgroundPicture?.value === originalUserData.backgroundPicture
        ? undefined
        : newUserData.backgroundPicture?.value
  };
  return changes;
};

const EditProfileScreen = () => {
  const { username } = useLocalSearchParams<{ username: string }>();
  const axiosUsers = useAxiosInstance('users');
  const [originalUserData, setUserData] = useState<ModifiableUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormTouched, setIsFormTouched] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  const [form, setForm] = useState<ModifiableUserForm>({
    name: { value: originalUserData?.name || '' },
    lastname: { value: originalUserData?.lastname || '' },
    birthdate: { value: originalUserData?.birthdate || '' },
    isPrivate: { value: originalUserData?.isPrivate?.toString() || 'false' },
    profilePicture: { value: originalUserData?.profilePicture || '' },
    backgroundPicture: { value: originalUserData?.backgroundPicture || '' }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosUsers.get(`users/${username}`);
        setUserData(response.data.data);
        setForm({
          name: { value: response.data.data.name },
          lastname: { value: response.data.data.lastname },
          birthdate: { value: response.data.data.birthdate },
          isPrivate: { value: response.data.data.isPrivate.toString() }
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleChange = useCallback((name: keyof ModifiableUserForm, value: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      [name]: { value }
    }));
    setIsFormTouched(true);
  }, []);

  const onBlurValidate = useCallback(
    (field: keyof ModifiableUserFormInputs) => {
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
    },
    [form]
  );
  const handleSubmit = async () => {
    if (originalUserData) {
      try {
        const updatedUserData = extractUserChanges(originalUserData, form);
        console.log(updatedUserData);
        await axiosUsers.patch(`users/${username}`, updatedUserData);
        // Optionally navigate back or show success message
      } catch (err) {
        console.error(err);
        setError('Failed to update user data');
      }
    }
  };

  const isFormValid = useMemo(() => {
    const formProps = getFormProps(form, 'errorMessage');
    return (
      isFormTouched && Object.values(formProps).every((value) => !value) && !isUploadingPicture
    );
  }, [form, isFormTouched, isUploadingPicture]);

  if (loading) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          onPress={() => {
            // eslint-disable-next-line no-unused-expressions
            router.canGoBack() ? router.back() : router.replace(`/profile/${username}`);
          }}
        />
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.headerButton}
          disabled={!isFormValid}
        >
          Save
        </Button>
      </View>
      <View style={styles.bannerImageContainer}>
        <ImagePicker
          isBanner={true}
          imageUri={form.backgroundPicture?.value}
          username={username}
          onImagePicked={(uri) => handleChange('backgroundPicture', uri)}
          onLoadingChange={setIsUploadingPicture}
        />
      </View>
      <View style={styles.profileImageContainer}>
        <ImagePicker
          imageUri={form.profilePicture?.value}
          username={username}
          onImagePicked={(uri) => handleChange('profilePicture', uri)}
          onLoadingChange={setIsUploadingPicture}
        />
      </View>
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
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Birthdate"
          value={form.birthdate.value}
          mode="outlined"
          onChangeText={(value) => handleChange('birthdate', value)}
          onBlur={() => onBlurValidate('birthdate')}
          error={!!form.birthdate.errorMessage}
          placeholder="Birthdate (YYYY-MM-DD)"
          theme={inputTheme}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: 'white', marginRight: 10 }}>Private Profile</Text>
        <Switch
          value={form.isPrivate.value === 'true'}
          onValueChange={(value) => handleChange('isPrivate', value.toString())}
          thumbColor="white"
          trackColor={{ false: 'gray', true: 'rgb(3, 165, 252)' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgb(5, 5, 5)'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'gray'
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold'
  },
  headerButton: {
    borderRadius: 10,
    backgroundColor: 'rgb(3, 165, 252)'
  },
  bannerImageContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputContainer: {
    marginBottom: 12
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20
  },
  switch: {
    color: 'white'
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

export default EditProfileScreen;
