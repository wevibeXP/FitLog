import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleProp,
  ViewStyle,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Onboarding from './Onboarding';
import { assess, AssessmentInput } from './assessment';
import { estimateFood, searchFoods, suggestAmount } from './nutrition';
import type { NutritionFood, NutritionUnit, FoodEstimate } from './nutrition';
import {
  createInitialData,
  FitlogData,
  FoodEntry,
  MealType,
  makeId,
  localDateKey,
  STORAGE_KEY,
  WorkoutEntry,
} from './tracker';

const C = {
  bg: '#FFF9F4',
  panel: '#FFFFFF',
  text: '#393340',
  muted: '#897F8D',
  accent: '#9A83D4',
  line: '#EAE1EB',
  mint: '#E2F1E8',
  peach: '#FBE8DF',
  butter: '#FFF2D8',
  lilac: '#F0EAFB',
  green: '#547A66',
  rose: '#9C6955',
};

type Tab = 'today' | 'food' | 'move' | 'progress';
type UpdateData = (recipe: (current: FitlogData) => FitlogData) => void;

function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: C.panel, borderRadius: 23, borderWidth: 1, borderColor: C.line, padding: 18, marginBottom: 14, shadowColor: '#7D688D', shadowOpacity: 0.045, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 1 }, style]}>{children}</View>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.7 }}>{children}</Text>;
}

function PageTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <View style={{ marginBottom: 21 }}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <Text style={{ color: C.text, fontSize: 30, fontWeight: '900', letterSpacing: 0.1, marginTop: 8 }}>{title}</Text>
    <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 6 }}>{subtitle}</Text>
  </View>;
}

function ActionButton({ label, onPress, disabled = false, tone = 'primary' }: { label: string; onPress: () => void; disabled?: boolean; tone?: 'primary' | 'soft' | 'outline' }) {
  const backgroundColor = tone === 'primary' ? (disabled ? '#EDE7EF' : C.accent) : tone === 'soft' ? C.lilac : C.panel;
  const borderColor = tone === 'outline' ? C.line : backgroundColor;
  const color = disabled ? '#A99EAC' : tone === 'primary' ? '#FFFFFF' : C.accent;
  return <TouchableOpacity activeOpacity={0.84} disabled={disabled} onPress={onPress} style={{ backgroundColor, borderWidth: 1, borderColor, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: 12, fontWeight: '900', letterSpacing: 0.8 }}>{label}</Text>
  </TouchableOpacity>;
}

function TextField({ label, value, onChange, placeholder, keyboardType = 'default', suffix }: {
  label: string; value: string; onChange: (value: string) => void; placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad'; suffix?: string;
}) {
  return <View style={{ marginBottom: 13 }}>
    <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 7 }}>{label}{suffix ? '  ·  ' + suffix : ''}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#B0A6B1"
      keyboardType={keyboardType}
      selectionColor={C.accent}
      style={{ backgroundColor: '#FFFCFA', borderColor: C.line, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 13, color: C.text, fontSize: 15 }}
    />
  </View>;
}

function ProgressBar({ value, target, color }: { value: number; target: number; color: string }) {
  const width = target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;
  return <View style={{ height: 8, backgroundColor: '#F1ECF1', borderRadius: 8, overflow: 'hidden', marginTop: 7 }}>
    <View style={{ height: 8, width: width + '%', backgroundColor: color, borderRadius: 8 }} />
  </View>;
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} style={{ paddingVertical: 9, paddingHorizontal: 13, backgroundColor: selected ? C.lilac : C.panel, borderRadius: 30, borderWidth: 1, borderColor: selected ? C.accent : C.line, marginRight: 7, marginBottom: 7 }}>
    <Text style={{ color: selected ? C.accent : C.muted, fontWeight: '800', fontSize: 11 }}>{label}</Text>
  </TouchableOpacity>;
}

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return <View style={{ alignItems: 'center', paddingVertical: 22, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 28 }}>{emoji}</Text>
    <Text style={{ color: C.text, fontWeight: '900', marginTop: 9 }}>{title}</Text>
    <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 5 }}>{subtitle}</Text>
  </View>;
}

function TabBar({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  const items: { key: Tab; emoji: string; label: string }[] = [
    { key: 'today', emoji: '☀️', label: 'Today' },
    { key: 'food', emoji: '🍓', label: 'Food' },
    { key: 'move', emoji: '🧘', label: 'Move' },
    { key: 'progress', emoji: '🌷', label: 'Progress' },
  ];
  return <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10, paddingBottom: 5, paddingHorizontal: 9 }}>
    {items.map(item => {
      const active = selected === item.key;
      return <TouchableOpacity key={item.key} onPress={() => onSelect(item.key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 16, backgroundColor: active ? C.lilac : 'transparent' }}>
        <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
        <Text style={{ color: active ? C.accent : C.muted, fontSize: 10, fontWeight: active ? '900' : '700', marginTop: 3, letterSpacing: 0.3 }}>{item.label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
}

function TodayScreen({ data, update, goTo }: { data: FitlogData; update: UpdateData; goTo: (tab: Tab) => void }) {
  const date = localDateKey();
  const food = data.food.filter(item => item.date === date);
  const workouts = data.workouts.filter(item => item.date === date);
  const water = data.waterByDate[date] || 0;
  const totals = food.reduce((sum, item) => ({
    calories: sum.calories + item.calories,
    protein: sum.protein + item.protein,
    carbs: sum.carbs + item.carbs,
    fat: sum.fat + item.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const target = data.assessment.targetCalories;
  const macros = data.assessment.macros;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const addWater = (amount: number) => update(current => ({ ...current, waterByDate: { ...current.waterByDate, [date]: (current.waterByDate[date] || 0) + amount } }));

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 28 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
      <View>
        <Eyebrow>FITLOG  ✳  YOUR LITTLE WELLNESS SPACE</Eyebrow>
        <Text style={{ color: C.text, fontSize: 28, fontWeight: '900', marginTop: 8 }}>{greeting} ☁️</Text>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{dateLabel}</Text>
      </View>
      <View style={{ backgroundColor: C.mint, width: 49, height: 49, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 23 }}>🌼</Text>
      </View>
    </View>

    <Card style={{ backgroundColor: '#F2ECFB', borderColor: '#E6DDF4' }}>
      <Eyebrow>YOUR DAILY NOURISHMENT</Eyebrow>
      {target === null ? <View style={{ marginTop: 13 }}>
        <Text style={{ color: C.text, fontSize: 19, fontWeight: '900' }}>Your calorie target is paused</Text>
        <Text style={{ color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 6 }}>You can still log meals and notice patterns while you get personalised guidance.</Text>
      </View> : <>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 }}>
          <View>
            <Text style={{ color: C.accent, fontSize: 38, fontWeight: '900', letterSpacing: -1 }}>{Math.round(totals.calories)}</Text>
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700' }}>calories logged</Text>
          </View>
          <View style={{ alignItems: 'flex-end', paddingBottom: 4 }}>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: '900' }}>{Math.max(0, Math.round(target - totals.calories))}</Text>
            <Text style={{ color: C.muted, fontSize: 10 }}>remaining of {target}</Text>
          </View>
        </View>
        <ProgressBar value={totals.calories} target={target} color={C.accent} />
        <View style={{ flexDirection: 'row', marginTop: 17, gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#7964AE', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 }}>PROTEIN</Text>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 17, marginTop: 4 }}>{Math.round(totals.protein)}<Text style={{ fontSize: 10, color: C.muted }}> / {macros?.proteinG ?? '—'}g</Text></Text>
            {macros && <ProgressBar value={totals.protein} target={macros.proteinG} color="#A38BD9" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 }}>CARBS</Text>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 17, marginTop: 4 }}>{Math.round(totals.carbs)}<Text style={{ fontSize: 10, color: C.muted }}> / {macros?.carbsG ?? '—'}g</Text></Text>
            {macros && <ProgressBar value={totals.carbs} target={macros.carbsG} color="#8DBA9D" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.rose, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 }}>FAT</Text>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 17, marginTop: 4 }}>{Math.round(totals.fat)}<Text style={{ fontSize: 10, color: C.muted }}> / {macros?.fatG ?? '—'}g</Text></Text>
            {macros && <ProgressBar value={totals.fat} target={macros.fatG} color="#E5AE98" />}
          </View>
        </View>
      </>}
    </Card>

    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Card style={{ flex: 1, backgroundColor: C.mint, borderColor: '#D5E8DC' }}>
        <Text style={{ fontSize: 21 }}>💧</Text>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900', marginTop: 8 }}>{water}<Text style={{ fontSize: 11 }}> ml</Text></Text>
        <Text style={{ color: C.green, fontSize: 10, fontWeight: '800', marginTop: 2 }}>WATER LOGGED</Text>
        <TouchableOpacity onPress={() => addWater(250)} style={{ marginTop: 12, backgroundColor: '#FFFFFF', padding: 9, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>+ 250 ml</Text>
        </TouchableOpacity>
      </Card>
      <Card style={{ flex: 1, backgroundColor: C.peach, borderColor: '#F2DED5' }}>
        <Text style={{ fontSize: 21 }}>🏃‍♀️</Text>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900', marginTop: 8 }}>{workouts.length}</Text>
        <Text style={{ color: C.rose, fontSize: 10, fontWeight: '800', marginTop: 2 }}>WORKOUTS TODAY</Text>
        <TouchableOpacity onPress={() => goTo('move')} style={{ marginTop: 12, backgroundColor: '#FFFFFF', padding: 9, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: C.rose, fontSize: 11, fontWeight: '900' }}>Log movement</Text>
        </TouchableOpacity>
      </Card>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7, marginBottom: 9 }}>
      <Text style={{ color: C.text, fontSize: 19, fontWeight: '900' }}>A little nourishment</Text>
      <TouchableOpacity onPress={() => goTo('food')}><Text style={{ color: C.accent, fontWeight: '900', fontSize: 11 }}>ADD FOOD +</Text></TouchableOpacity>
    </View>
    <Card>
      {food.length === 0 ? <EmptyState emoji="🍑" title="Your food diary is waiting" subtitle="Add your first meal or snack. Small logs make useful patterns over time." /> :
        food.slice().reverse().slice(0, 4).map(item => <FoodRow key={item.id} item={item} />)}
    </Card>
    <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 1, textAlign: 'center' }}>Gentle reminder: these are estimates, not rules. Eat enough, enjoy your food and listen to your body. 🌷</Text>
  </ScrollView>;
}

function FoodRow({ item }: { item: FoodEntry }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F4EEF3' }}>
    <View style={{ width: 37, height: 37, borderRadius: 13, backgroundColor: C.peach, alignItems: 'center', justifyContent: 'center', marginRight: 11 }}>
      <Text style={{ fontSize: 17 }}>{item.meal === 'Breakfast' ? '🍳' : item.meal === 'Lunch' ? '🥗' : item.meal === 'Dinner' ? '🍲' : '🍓'}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: C.text, fontWeight: '800', fontSize: 13 }}>{item.name}</Text>
      <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{item.meal} · P {item.protein}g · C {item.carbs}g · F {item.fat}g</Text>
      <Text style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>{item.estimateMethod === 'catalogue' ? 'Calculated from food catalogue' : item.estimateMethod === 'manual' ? 'Manual estimate' : 'Saved entry'}</Text>
    </View>
    <Text style={{ color: C.text, fontWeight: '900', fontSize: 13 }}>{item.calories} kcal</Text>
  </View>;
}

type DraftFood = { food: NutritionFood; amount: number; unit: NutritionUnit; estimate: FoodEstimate };

function FoodScreen({ data, update }: { data: FitlogData; update: UpdateData }) {
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState<MealType>('Breakfast');
  const [selectedFood, setSelectedFood] = useState<NutritionFood | null>(null);
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState<NutritionUnit>('serving');
  const [draft, setDraft] = useState<DraftFood[]>([]);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const date = localDateKey();
  const todaysFood = data.food.filter(item => item.date === date);
  const totals = todaysFood.reduce((sum, item) => ({
    kcal: sum.kcal + item.calories,
    p: sum.p + item.protein,
    c: sum.c + item.carbs,
    f: sum.f + item.fat,
  }), { kcal: 0, p: 0, c: 0, f: 0 });
  const suggestions = useMemo(() => searchFoods(query), [query]);
  const quantity = Number(amount);
  const selectedEstimate = selectedFood && Number.isFinite(quantity) && quantity > 0
    ? estimateFood(selectedFood, quantity, unit)
    : null;
  const draftTotals = draft.reduce((sum, item) => ({
    kcal: sum.kcal + item.estimate.calories,
    p: sum.p + item.estimate.protein,
    c: sum.c + item.estimate.carbs,
    f: sum.f + item.estimate.fat,
  }), { kcal: 0, p: 0, c: 0, f: 0 });

  const chooseFood = (food: NutritionFood) => {
    const suggested = suggestAmount(query, food);
    setSelectedFood(food);
    setAmount(String(suggested.amount));
    setUnit(suggested.unit);
  };

  const addIngredient = () => {
    if (!selectedFood || !selectedEstimate) {
      Alert.alert('Choose a food and portion', 'Select a food and enter a portion greater than zero.');
      return;
    }
    setDraft(current => [...current, {
      food: selectedFood,
      amount: quantity,
      unit,
      estimate: selectedEstimate,
    }]);
    setSelectedFood(null);
    setQuery('');
    setAmount('1');
    setUnit('serving');
  };

  const saveMeal = () => {
    if (draft.length === 0) {
      Alert.alert('Your meal is empty', 'Search for a food and add it to your meal first.');
      return;
    }
    const entry: FoodEntry = {
      id: makeId(),
      date,
      name: draft.map(item => item.food.name).join(' + '),
      meal,
      calories: draftTotals.kcal,
      protein: Math.round(draftTotals.p * 10) / 10,
      carbs: Math.round(draftTotals.c * 10) / 10,
      fat: Math.round(draftTotals.f * 10) / 10,
      createdAt: Date.now(),
      estimateMethod: 'catalogue',
      ingredients: draft.map(item => ({
        foodId: item.food.id,
        name: item.food.name,
        grams: item.estimate.grams,
      })),
    };
    update(current => ({ ...current, food: [...current.food, entry] }));
    setDraft([]);
    setSelectedFood(null);
    setQuery('');
    Alert.alert('Meal saved 🌷', 'Fitlog added the estimated calories and macros to today’s diary.');
  };

  const saveCustomFood = () => {
    const kcal = Number(customCalories);
    if (!customName.trim() || !Number.isFinite(kcal) || kcal < 0) {
      Alert.alert('Check the custom food', 'Enter a food name and a valid calorie value.');
      return;
    }
    const entry: FoodEntry = {
      id: makeId(), date, name: customName.trim(), meal,
      calories: kcal,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      createdAt: Date.now(),
      estimateMethod: 'manual',
    };
    update(current => ({ ...current, food: [...current.food, entry] }));
    setCustomName(''); setCustomCalories(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat('');
    setCustomMode(false); setQuery('');
    Alert.alert('Custom entry saved', 'Your manually entered nutrition values were added to the diary.');
  };

  const removeFood = (id: string) => Alert.alert('Remove this entry?', 'This only removes the selected food log.', [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => update(current => ({ ...current, food: current.food.filter(item => item.id !== id) })) },
  ]);

  return <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 35 }}>
    <PageTitle eyebrow="FOOD JOURNAL  ✳  ONE BITE AT A TIME" title="Nourish yourself 🍓" subtitle="Search a food, choose the portion and Fitlog calculates the estimated nutrition for you." />
    <Card style={{ backgroundColor: C.lilac }}>
      <Eyebrow>TODAY'S TOTAL</Eyebrow>
      <Text style={{ color: C.text, fontSize: 31, fontWeight: '900', marginTop: 8 }}>{Math.round(totals.kcal)} <Text style={{ fontSize: 13, color: C.muted }}>kcal logged</Text></Text>
      <Text style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>Protein {Math.round(totals.p)}g  ·  Carbs {Math.round(totals.c)}g  ·  Fat {Math.round(totals.f)}g</Text>
    </Card>
    <Card>
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 14 }}>Build your meal ✨</Text>
      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 9 }}>WHAT ARE YOU LOGGING?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map(option => <Chip key={option} label={option} selected={meal === option} onPress={() => setMeal(option)} />)}
      </View>

      <TextField label="Search food or dish" value={query} onChange={value => { setQuery(value); setSelectedFood(null); }} placeholder="e.g. 2 eggs, idli, cooked rice" />
      {!selectedFood && <View style={{ marginTop: 1, marginBottom: 10 }}>
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '800', marginBottom: 8 }}>{query.trim() ? 'MATCHING FOODS' : 'POPULAR STARTERS'}</Text>
        {suggestions.length === 0 ? <View style={{ padding: 13, borderRadius: 14, backgroundColor: '#FFFCFA' }}>
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>No match in the starter catalogue yet. Try a simpler food name or add the ingredients separately.</Text>
        </View> : suggestions.slice(0, 6).map(food => <TouchableOpacity key={food.id} onPress={() => chooseFood(food)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: '#FFFCFA', marginBottom: 7 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: '900' }}>{food.name}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{food.category} · {food.servingLabel}</Text>
          </View>
          <Text style={{ color: C.accent, fontWeight: '900', fontSize: 12 }}>{Math.round(food.kcal * food.servingGrams / 100)} kcal</Text>
          <Text style={{ color: C.accent, fontSize: 20, marginLeft: 10 }}>＋</Text>
        </TouchableOpacity>)}
        <TouchableOpacity onPress={() => { setCustomName(query.trim()); setCustomMode(value => !value); }} style={{ paddingVertical: 10, alignSelf: 'flex-start' }}>
          <Text style={{ color: C.accent, fontSize: 11, fontWeight: '900' }}>{customMode ? 'CLOSE CUSTOM ENTRY' : 'CAN’T FIND YOUR FOOD? ADD CUSTOM VALUES'}</Text>
        </TouchableOpacity>
      </View>}
      {customMode && <View style={{ backgroundColor: C.butter, borderRadius: 17, borderWidth: 1, borderColor: '#F0E5CA', padding: 14, marginBottom: 13 }}>
        <Text style={{ color: C.text, fontWeight: '900', marginBottom: 10 }}>Custom food or recipe</Text>
        <TextField label="Food name" value={customName} onChange={setCustomName} placeholder="e.g. Homemade chicken curry" />
        <TextField label="Calories" value={customCalories} onChange={setCustomCalories} placeholder="Only for unlisted foods" keyboardType="decimal-pad" suffix="kcal" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}><TextField label="Protein" value={customProtein} onChange={setCustomProtein} placeholder="0" keyboardType="decimal-pad" suffix="g" /></View>
          <View style={{ flex: 1 }}><TextField label="Carbs" value={customCarbs} onChange={setCustomCarbs} placeholder="0" keyboardType="decimal-pad" suffix="g" /></View>
          <View style={{ flex: 1 }}><TextField label="Fat" value={customFat} onChange={setCustomFat} placeholder="0" keyboardType="decimal-pad" suffix="g" /></View>
        </View>
        <ActionButton label="SAVE CUSTOM ENTRY" onPress={saveCustomFood} />
      </View>}

      {selectedFood && <View style={{ backgroundColor: '#F7F2FC', borderWidth: 1, borderColor: '#E4D9F2', borderRadius: 18, padding: 15, marginTop: 4, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 15 }}>{selectedFood.name}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{selectedFood.category} · estimated values</Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedFood(null)}><Text style={{ color: C.accent, fontWeight: '900', padding: 6 }}>CHANGE</Text></TouchableOpacity>
        </View>
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 16, marginBottom: 8 }}>PORTION SIZE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 9 }}>
          <Chip label={selectedFood.servingLabel} selected={unit === 'serving'} onPress={() => setUnit('serving')} />
          <Chip label="Grams" selected={unit === 'g'} onPress={() => setUnit('g')} />
        </View>
        <TextField label={unit === 'serving' ? 'Number of servings' : 'Weight'} value={amount} onChange={setAmount} placeholder="1" keyboardType="decimal-pad" suffix={unit === 'serving' ? 'servings' : 'g'} />
        {selectedEstimate && <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 13, marginTop: 1 }}>
          <Text style={{ color: C.accent, fontSize: 24, fontWeight: '900' }}>{selectedEstimate.calories} kcal</Text>
          <Text style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>{selectedEstimate.grams} g  ·  Protein {selectedEstimate.protein}g  ·  Carbs {selectedEstimate.carbs}g  ·  Fat {selectedEstimate.fat}g</Text>
        </View>}
        <View style={{ marginTop: 12 }}><ActionButton label="ADD THIS FOOD TO MEAL  +" onPress={addIngredient} disabled={!selectedEstimate} /></View>
      </View>}

      {draft.length > 0 && <View style={{ backgroundColor: '#FFFCFA', borderRadius: 17, padding: 14, marginTop: 5 }}>
        <Text style={{ color: C.text, fontSize: 13, fontWeight: '900', marginBottom: 8 }}>In this meal · {draft.length} item{draft.length === 1 ? '' : 's'}</Text>
        {draft.map((item, index) => <View key={item.food.id + '-' + index} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '800', fontSize: 12 }}>{item.food.name}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{item.estimate.grams} g · {item.estimate.calories} kcal</Text>
          </View>
          <Text style={{ color: C.text, fontSize: 11, fontWeight: '900' }}>{item.estimate.protein}g P</Text>
          <TouchableOpacity onPress={() => setDraft(current => current.filter((_, i) => i !== index))} style={{ marginLeft: 12, padding: 5 }}><Text style={{ color: '#B27D87', fontWeight: '900' }}>×</Text></TouchableOpacity>
        </View>)}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13 }}>
          <View>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>MEAL ESTIMATE</Text>
            <Text style={{ color: C.text, fontSize: 22, fontWeight: '900', marginTop: 3 }}>{draftTotals.kcal} kcal</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>P {draftTotals.p.toFixed(1)}g · C {draftTotals.c.toFixed(1)}g · F {draftTotals.f.toFixed(1)}g</Text>
          </View>
          <TouchableOpacity onPress={() => setDraft([])}><Text style={{ color: '#B27D87', fontSize: 10, fontWeight: '900' }}>CLEAR</Text></TouchableOpacity>
        </View>
        <View style={{ marginTop: 13 }}><ActionButton label="SAVE MEAL TO DIARY  ✓" onPress={saveMeal} /></View>
      </View>}
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 14 }}>Estimates use typical values per 100 g and standard household portions. Oil, recipe, brand and cooking method can change the real numbers.</Text>
    </Card>

    <Text style={{ color: C.text, fontSize: 19, fontWeight: '900', marginBottom: 10 }}>Today's diary</Text>
    <Card>
      {todaysFood.length === 0 ? <EmptyState emoji="🥣" title="Nothing logged yet" subtitle="Your saved meals will appear here." /> :
        todaysFood.slice().reverse().map(item => <View key={item.id}>
          <FoodRow item={item} />
          <TouchableOpacity onPress={() => removeFood(item.id)} style={{ alignSelf: 'flex-end', paddingVertical: 5 }}><Text style={{ color: '#B27D87', fontWeight: '800', fontSize: 10 }}>REMOVE</Text></TouchableOpacity>
        </View>)}
    </Card>
    <Card style={{ backgroundColor: C.butter, borderColor: '#F0E5CA' }}>
      <Text style={{ color: C.text, fontWeight: '900' }}>📷 Food photo scan</Text>
      <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>Photo recognition is a separate AI feature we can add next. The current catalogue calculator works offline and never guesses from a photo.</Text>
    </Card>
  </ScrollView>;
}
function MoveScreen({ data, update }: { data: FitlogData; update: UpdateData }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Strength');
  const [minutes, setMinutes] = useState('');
  const date = localDateKey();
  const options = ['Strength', 'Pilates', 'Walk', 'Run', 'Cycling', 'Mobility', 'Other'];
  const todays = data.workouts.filter(item => item.date === date);
  const totalMinutes = todays.reduce((sum, item) => sum + item.minutes, 0);
  const addWorkout = () => {
    const duration = Number(minutes);
    if (!name.trim() || !Number.isFinite(duration) || duration <= 0) {
      Alert.alert('Add your movement', 'Enter an activity and its duration in minutes.');
      return;
    }
    const item: WorkoutEntry = { id: makeId(), date, name: name.trim(), category, minutes: duration, createdAt: Date.now() };
    update(current => ({ ...current, workouts: [...current.workouts, item] }));
    setName(''); setMinutes('');
  };
  const removeWorkout = (id: string) => Alert.alert('Remove workout?', 'This will remove the selected activity log.', [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => update(current => ({ ...current, workouts: current.workouts.filter(item => item.id !== id) })) },
  ]);

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 35 }}>
    <PageTitle eyebrow="MOVEMENT JOURNAL  ✳  YOUR PACE, YOUR WAY" title="Move a little 🌱" subtitle="Strength, Pilates, running, walks or a stretch break. It all counts as movement." />
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Card style={{ flex: 1, backgroundColor: C.mint }}>
        <Text style={{ fontSize: 21 }}>🌼</Text>
        <Text style={{ color: C.text, fontSize: 26, fontWeight: '900', marginTop: 7 }}>{todays.length}</Text>
        <Text style={{ color: C.green, fontWeight: '800', fontSize: 10 }}>SESSIONS TODAY</Text>
      </Card>
      <Card style={{ flex: 1, backgroundColor: C.peach }}>
        <Text style={{ fontSize: 21 }}>⏱️</Text>
        <Text style={{ color: C.text, fontSize: 26, fontWeight: '900', marginTop: 7 }}>{totalMinutes}</Text>
        <Text style={{ color: C.rose, fontWeight: '800', fontSize: 10 }}>MINUTES MOVED</Text>
      </Card>
    </View>
    <Card>
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 15 }}>Log a session</Text>
      <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800', marginBottom: 9 }}>WHAT DID YOU DO?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map(option => <Chip key={option} label={option} selected={category === option} onPress={() => setCategory(option)} />)}
      </View>
      <TextField label="Activity" value={name} onChange={setName} placeholder={category === 'Strength' ? 'e.g. Upper body session' : 'e.g. Evening walk'} />
      <TextField label="Duration" value={minutes} onChange={setMinutes} placeholder="e.g. 35" keyboardType="decimal-pad" suffix="minutes" />
      <ActionButton label="SAVE MOVEMENT  +" onPress={addWorkout} />
    </Card>
    <Text style={{ color: C.text, fontSize: 19, fontWeight: '900', marginBottom: 10 }}>Today's movement</Text>
    <Card>
      {todays.length === 0 ? <EmptyState emoji="🧘‍♀️" title="No sessions logged yet" subtitle="Rest days count too. Add movement only when it happens." /> :
        todays.slice().reverse().map(item => <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F4EEF3' }}>
          <View style={{ width: 40, height: 40, backgroundColor: C.lilac, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 11 }}><Text style={{ fontSize: 18 }}>{item.category === 'Strength' ? '🏋️' : item.category === 'Pilates' ? '🧘' : item.category === 'Run' ? '🏃' : item.category === 'Walk' ? '🚶' : '🌿'}</Text></View>
          <View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: '900', fontSize: 13 }}>{item.name}</Text><Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{item.category}</Text></View>
          <Text style={{ color: C.text, fontWeight: '900' }}>{item.minutes} min</Text>
          <TouchableOpacity onPress={() => removeWorkout(item.id)} style={{ marginLeft: 9, padding: 5 }}><Text style={{ color: '#B27D87', fontWeight: '900' }}>×</Text></TouchableOpacity>
        </View>)}
    </Card>
    <Card style={{ backgroundColor: C.butter, borderColor: '#F0E5CA' }}>
      <Text style={{ color: C.text, fontWeight: '900' }}>A note on recovery ☁️</Text>
      <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>Fitlog doesn't assign calorie credits for workouts. Move because it supports your strength, energy and wellbeing—not to earn food.</Text>
    </Card>
  </ScrollView>;
}

function ProgressScreen({ data, update, onReset }: { data: FitlogData; update: UpdateData; onReset: () => void }) {
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [sleep, setSleep] = useState('');
  const date = localDateKey();
  const sortedWeights = data.weights.slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const latest = sortedWeights[0];
  const previous = sortedWeights.find(item => item.id !== latest?.id);
  const addWeight = () => {
    const value = Number(weight);
    if (!Number.isFinite(value) || value < 20 || value > 400) {
      Alert.alert('Check that weight', 'Enter a weight in kilograms between 20 and 400.');
      return;
    }
    update(current => ({ ...current, weights: [...current.weights, { id: makeId(), date, kg: value }] }));
    setWeight('');
  };
  const addMeasurements = () => {
    const waistValue = waist.trim() ? Number(waist) : undefined;
    const hipsValue = hips.trim() ? Number(hips) : undefined;
    if (waistValue === undefined && hipsValue === undefined) {
      Alert.alert('Add a measurement', 'Enter waist, hips or both in centimetres.');
      return;
    }
    if ((waistValue !== undefined && (!Number.isFinite(waistValue) || waistValue < 30 || waistValue > 250)) ||
        (hipsValue !== undefined && (!Number.isFinite(hipsValue) || hipsValue < 30 || hipsValue > 250))) {
      Alert.alert('Check the measurements', 'Enter values in centimetres between 30 and 250.');
      return;
    }
    update(current => ({ ...current, measurements: [...current.measurements, { id: makeId(), date, waistCm: waistValue, hipsCm: hipsValue }] }));
    setWaist(''); setHips('');
  };
  const addSleep = () => {
    const hours = Number(sleep);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
      Alert.alert('Check your sleep entry', 'Enter a number of hours between 0 and 24.');
      return;
    }
    update(current => ({ ...current, sleep: [...current.sleep, { id: makeId(), date, hours }] }));
    setSleep('');
  };
  const lastMeasurements = data.measurements.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastSleep = data.sleep.slice().sort((a, b) => b.date.localeCompare(a.date))[0];

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 35 }}>
    <PageTitle eyebrow="YOUR CHECK-INS  ✳  PROGRESS, NOT PERFECTION" title="Notice your growth 🌷" subtitle="A few calm check-ins help you notice longer-term patterns. No daily judgement, no pressure." />
    <Card style={{ backgroundColor: C.lilac }}>
      <Eyebrow>YOUR WEIGHT CHECK-IN</Eyebrow>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
        <View>
          <Text style={{ color: C.text, fontSize: 30, fontWeight: '900' }}>{latest ? latest.kg.toFixed(1) : '—'} <Text style={{ color: C.muted, fontSize: 12 }}>kg</Text></Text>
          <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{latest ? 'Latest entry · ' + latest.date : 'No weigh-in yet'}</Text>
        </View>
        {latest && previous && <View style={{ alignItems: 'flex-end' }}><Text style={{ color: C.accent, fontSize: 16, fontWeight: '900' }}>{(latest.kg - previous.kg) > 0 ? '+' : ''}{(latest.kg - previous.kg).toFixed(1)} kg</Text><Text style={{ color: C.muted, fontSize: 10 }}>vs previous entry</Text></View>}
      </View>
      <View style={{ height: 1, backgroundColor: '#E3D9F0', marginVertical: 15 }} />
      <Text style={{ color: C.muted, fontSize: 11 }}>Goal weight · {data.profile.goalWeightKg.toFixed(1)} kg</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginTop: 13 }}>
        <View style={{ flex: 1 }}><TextField label="New weigh-in" value={weight} onChange={setWeight} placeholder="e.g. 62.5" keyboardType="decimal-pad" suffix="kg" /></View>
        <View style={{ paddingBottom: 13 }}><ActionButton label="SAVE" onPress={addWeight} /></View>
      </View>
    </Card>
    <Card>
      <Text style={{ color: C.text, fontWeight: '900', fontSize: 17, marginBottom: 13 }}>Body measurements 📏</Text>
      <View style={{ flexDirection: 'row', gap: 9 }}>
        <View style={{ flex: 1 }}><TextField label="Waist" value={waist} onChange={setWaist} placeholder="e.g. 72" keyboardType="decimal-pad" suffix="cm" /></View>
        <View style={{ flex: 1 }}><TextField label="Hips" value={hips} onChange={setHips} placeholder="e.g. 96" keyboardType="decimal-pad" suffix="cm" /></View>
      </View>
      <ActionButton label="SAVE MEASUREMENTS  +" onPress={addMeasurements} tone="soft" />
      {lastMeasurements && <Text style={{ color: C.muted, fontSize: 11, marginTop: 12 }}>Latest: {lastMeasurements.waistCm ? 'Waist ' + lastMeasurements.waistCm + ' cm' : ''}{lastMeasurements.waistCm && lastMeasurements.hipsCm ? '  ·  ' : ''}{lastMeasurements.hipsCm ? 'Hips ' + lastMeasurements.hipsCm + ' cm' : ''} · {lastMeasurements.date}</Text>}
    </Card>
    <Card style={{ backgroundColor: C.mint, borderColor: '#D8E9DC' }}>
      <Text style={{ color: C.text, fontWeight: '900', fontSize: 17, marginBottom: 6 }}>How did you sleep? 🌙</Text>
      <Text style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>Log your sleep duration. Connect Apple Health later for automatic imports.</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 9 }}>
        <View style={{ flex: 1 }}><TextField label="Sleep duration" value={sleep} onChange={setSleep} placeholder="e.g. 7.5" keyboardType="decimal-pad" suffix="hours" /></View>
        <View style={{ paddingBottom: 13 }}><ActionButton label="SAVE" onPress={addSleep} /></View>
      </View>
      {lastSleep && <Text style={{ color: C.green, fontSize: 11, fontWeight: '800' }}>Latest: {lastSleep.hours} hours · {lastSleep.date}</Text>}
    </Card>
    <Text style={{ color: C.text, fontWeight: '900', fontSize: 18, marginBottom: 9 }}>Recent weigh-ins</Text>
    <Card>
      {sortedWeights.length === 0 ? <EmptyState emoji="🌱" title="Your first check-in is waiting" subtitle="Add a weigh-in whenever it feels useful. You don't need to weigh every day." /> :
        sortedWeights.slice(0, 7).map(item => <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F4EEF3' }}>
          <Text style={{ color: C.muted, fontSize: 12 }}>{item.date}</Text><Text style={{ color: C.text, fontWeight: '900' }}>{item.kg.toFixed(1)} kg</Text>
        </View>)}
    </Card>
    <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, textAlign: 'center' }}>Weight naturally fluctuates with hydration, digestion, training and your cycle. Look at longer trends, not single readings.</Text>
    <Card style={{ backgroundColor: '#FFFCFA' }}>
      <Text style={{ color: C.text, fontWeight: '900' }}>Your data, your call 🔐</Text>
      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 18, marginTop: 6 }}>This prototype stores entries locally on this iPhone. There is no Fitlog cloud account or sync yet.</Text>
      <TouchableOpacity onPress={() => Alert.alert('Reset Fitlog on this iPhone?', 'This deletes your local profile, food diary, workouts and check-ins from this app. This cannot be undone.', [
        { text: 'Keep my data', style: 'cancel' },
        { text: 'Delete local data', style: 'destructive', onPress: onReset },
      ])} style={{ alignSelf: 'flex-start', paddingVertical: 10, marginTop: 5 }}>
        <Text style={{ color: '#B27D87', fontWeight: '900', fontSize: 11, letterSpacing: 0.5 }}>RESET LOCAL APP DATA</Text>
      </TouchableOpacity>
    </Card>
  </ScrollView>;
}

function LoadingScreen() {
  return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 34 }}>🌷</Text>
    <Text style={{ color: C.text, fontSize: 19, fontWeight: '900', marginTop: 12 }}>Getting your little space ready...</Text>
  </View>;
}

export default function App() {
  const [data, setData] = useState<FitlogData | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('today');
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw) as FitlogData;
        if (parsed && parsed.version === 1 && parsed.profile && parsed.assessment) setData(parsed);
      })
      .catch(() => {
        if (active) Alert.alert('Could not load saved Fitlog data', 'Your previous entries may be unavailable. You can still start a fresh profile on this device.');
      })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!data || !ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      .then(() => setSaveFailed(false))
      .catch(() => setSaveFailed(true));
  }, [data, ready]);

  const update: UpdateData = recipe => setData(current => current ? recipe(current) : current);
  const finishOnboarding = (profile: AssessmentInput) => {
    const result = assess(profile);
    setData(createInitialData(profile, result));
    setTab('today');
  };

  if (!ready) return <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}><LoadingScreen /></SafeAreaView></SafeAreaProvider>;
  return <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      {!data ? <Onboarding onComplete={(profile) => finishOnboarding(profile)} /> : <>
        <View style={{ flex: 1 }}>
          {tab === 'today' && <TodayScreen data={data} update={update} goTo={setTab} />}
          {tab === 'food' && <FoodScreen data={data} update={update} />}
          {tab === 'move' && <MoveScreen data={data} update={update} />}
          {tab === 'progress' && <ProgressScreen data={data} update={update} onReset={() => {
            AsyncStorage.removeItem(STORAGE_KEY)
              .then(() => { setData(null); setTab('today'); })
              .catch(() => Alert.alert('Could not reset', 'Please try again after checking your device storage.'));
          }} />}
          {saveFailed && <Text style={{ color: '#A45F60', fontSize: 10, textAlign: 'center', paddingVertical: 4 }}>Could not save changes to this iPhone. Check available storage.</Text>}
        </View>
        <TabBar selected={tab} onSelect={setTab} />
      </>}
    </SafeAreaView>
  </SafeAreaProvider>;
}
