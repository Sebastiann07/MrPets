import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../Theme/colors';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightLabel?: string;
  onRightPress?: () => void;
};

export default function Header({ title, subtitle, showBack = false, rightLabel, onRightPress }: Props) {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.brandRow}>
          {showBack ? (
            <TouchableOpacity style={styles.logoWrap} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={colors.textOnPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoWrap}>
              <Ionicons name="paw" size={20} color={colors.textOnPrimary} />
            </View>
          )}

          <View style={styles.textWrap}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        {rightLabel && onRightPress ? (
          <TouchableOpacity style={styles.actionButton} onPress={onRightPress}>
            <Text style={styles.actionButtonText}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.primary,
  },
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textOnPrimary,
    opacity: 0.88,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: colors.primary,
    fontWeight: '800',
  },
});
