import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/theme';

export default function NotFoundScreen() {
  const { colors, fonts } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>
          Bu səhifə mövcud deyil.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primary, fontFamily: fonts.medium }]}>
            Ana səhifəyə qayıt
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
  },
});
