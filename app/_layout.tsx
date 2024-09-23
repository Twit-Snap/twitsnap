import { Slot } from 'expo-router';
import { Provider } from 'jotai';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <Provider>
      <Slot />
    </Provider>
  );
}
