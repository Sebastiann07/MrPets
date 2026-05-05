import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../Theme/colors';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type Props = {
  items: MenuItem[];
};

export default function MenuBar({ items }: Props) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity key={item.label} style={styles.item} onPress={item.onPress}>
          <Ionicons name={item.icon} size={22} color={colors.primary} />
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  item: {
    minWidth: 140,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
  },
});
