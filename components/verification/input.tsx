// components/VerificationCodeInput.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface VerificationCodeInputProps {
  length?: number;
  onComplete: (code: string, channel: string) => Promise<boolean>;
  loading?: boolean;
  onResend?: (channel: string) => void;
  resendDelay?: number; // in seconds
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  length = 6,
  onComplete,
  loading = false,
  onResend,
  resendDelay = 30
}) => {
  const [channel, setChannel] = useState<string>('');
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const [countdown, setCountdown] = useState(resendDelay);
  const [canResend, setCanResend] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, canResend]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setChannel('');
        setCode(Array(length).fill(''));
        setCanResend(true);
        setError(false);
      };
    }, [])
  );

  const handleChange = async (text: string, index: number) => {
    setError(false);
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move to next input if value is entered
    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }

    // Check if code is complete
    if (newCode.every((digit) => digit) && newCode.join('').length === length) {
      Keyboard.dismiss();
      setError(!(await onComplete(newCode.join(''), channel)));
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handleResend = (channel: string) => {
    setChannel(channel);
    if (canResend && onResend) {
      onResend(channel);
      setCountdown(resendDelay);
      setCanResend(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>Please enter the verification code sent</Text>

      <View style={styles.inputContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => ref && (inputs.current[index] = ref)}
            style={[
              styles.input,
              { borderColor: error ? 'rgb(255 100 100)' : digit ? '#007AFF' : '#E5E5E5' }
            ]}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
          />
        ))}
      </View>

      {loading ? <ActivityIndicator size="small" color="#007AFF" style={styles.loader} /> : null}

      {canResend ? (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => handleResend('sms')}
            disabled={!canResend}
            style={styles.resendButton}
          >
            <Text style={[styles.resendText, { color: '#007AFF' }]}>{'Send SMS code'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleResend('email')}
            disabled={!canResend}
            style={styles.resendButton}
          >
            <Text style={[styles.resendText, { color: '#007AFF' }]}>{'Send E-mail code'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text
          style={[styles.resendText, { color: '#999' }]}
        >{`Resend code in ${countdown} seconds`}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white'
  },
  subtitle: {
    fontSize: 14,
    color: 'rgb(200 200 200)',
    textAlign: 'center',
    marginBottom: 30
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  input: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 5,
    backgroundColor: '#FFF'
  },
  loader: {
    marginVertical: 20
  },
  resendButton: {
    marginTop: 20,
    padding: 10
  },
  resendText: {
    fontSize: 16
  }
});
