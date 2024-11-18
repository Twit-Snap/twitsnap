import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Button } from 'react-native-paper';

export default function VerifyButton() {
  const user = useAtomValue(authenticatedAtom);
  const router = useRouter();

  return user?.verified ? (
    <></>
  ) : (
    <Button
      labelStyle={{
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 16,
        marginBottom: 1
      }}
      buttonColor="white"
      style={{ borderWidth: 1, borderColor: 'rgb(5 5 5)', height: 35, width: 80 }}
      onPress={() => router.push('/verification')}
    >
      {'Verify'}
    </Button>
  );
}
