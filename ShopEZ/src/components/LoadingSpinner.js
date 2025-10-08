import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { theme } from '../styles/theme';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ marginTop: 10, color: theme.colors.textLight }}>
        {message}
      </Text>
    </View>
  );
}