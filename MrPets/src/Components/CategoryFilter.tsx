import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Categoria } from '../Models/models';
import { colors } from '../Theme/colors';

interface CategoryFilterProps {
  categories: Categoria[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity
        style={[
          styles.pill,
          selectedCategoryId === null && styles.pillSelected,
        ]}
        onPress={() => onSelectCategory(null)}
      >
        <Ionicons
          name="apps-outline"
          size={16}
          color={selectedCategoryId === null ? 'white' : colors.primary}
        />
        <Text
          style={[
            styles.text,
            selectedCategoryId === null && styles.textSelected,
          ]}
        >
          Todos
        </Text>
      </TouchableOpacity>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelectCategory(cat.id)}
          >
            {/* @ts-ignore */}
            <Ionicons
              name={(cat.icono || 'pricetag-outline') as any}
              size={16}
              color={isSelected ? 'white' : colors.primary}
            />
            <Text style={[styles.text, isSelected && styles.textSelected]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  textSelected: {
    color: 'white',
  },
});
