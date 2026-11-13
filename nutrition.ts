export type NutritionFood = {
  id: string; name: string; aliases: string[]; category: string;
  kcal: number; protein: number; carbs: number; fat: number;
  servingGrams: number; servingLabel: string;
};
export type NutritionUnit = 'serving' | 'g';
export type FoodEstimate = { grams: number; calories: number; protein: number; carbs: number; fat: number };

const foods: NutritionFood[] = [
  {id:'rice-white',name:'White rice, cooked',aliases:['rice','cooked rice','white rice','steamed rice','sona masoori rice'],category:'Grains',kcal:130,protein:2.7,carbs:28.2,fat:0.3,servingGrams:150,servingLabel:'1 bowl'},
  {id:'rice-brown',name:'Brown rice, cooked',aliases:['brown rice'],category:'Grains',kcal:123,protein:2.7,carbs:25.6,fat:1,servingGrams:150,servingLabel:'1 bowl'},
  {id:'roti',name:'Chapati / roti',aliases:['chapati','roti','phulka','wheat roti'],category:'Grains',kcal:297,protein:9.8,carbs:46,fat:7,servingGrams:40,servingLabel:'1 medium'},
  {id:'idli',name:'Idli',aliases:['idli','idlys','steamed idli'],category:'South Indian',kcal:146,protein:4.5,carbs:29,fat:0.7,servingGrams:40,servingLabel:'1 piece'},
  {id:'dosa',name:'Plain dosa',aliases:['dosa','dosai','plain dosa'],category:'South Indian',kcal:168,protein:4,carbs:28,fat:4,servingGrams:90,servingLabel:'1 medium'},
  {id:'appam',name:'Appam',aliases:['appam','palappam'],category:'South Indian',kcal:128,protein:2.5,carbs:25,fat:1.5,servingGrams:70,servingLabel:'1 piece'},
  {id:'idiyappam',name:'Idiyappam',aliases:['idiyappam','string hoppers','sevai'],category:'South Indian',kcal:130,protein:2.2,carbs:28,fat:0.4,servingGrams:75,servingLabel:'1 nest'},
  {id:'pongal',name:'Ven pongal',aliases:['pongal','ven pongal'],category:'South Indian',kcal:160,protein:4,carbs:23,fat:5.5,servingGrams:150,servingLabel:'1 bowl'},
  {id:'upma',name:'Vegetable upma',aliases:['upma','rava upma','sooji upma'],category:'South Indian',kcal:145,protein:3.5,carbs:23,fat:4.5,servingGrams:150,servingLabel:'1 bowl'},
  {id:'sambar',name:'Sambar',aliases:['sambar','sambhar'],category:'South Indian',kcal:70,protein:3.5,carbs:10,fat:1.8,servingGrams:150,servingLabel:'1 katori'},
  {id:'rasam',name:'Rasam',aliases:['rasam'],category:'South Indian',kcal:30,protein:1.2,carbs:4.5,fat:0.8,servingGrams:150,servingLabel:'1 bowl'},
  {id:'dal',name:'Dal, cooked',aliases:['dal','dhal','paruppu','cooked lentils','moong dal','toor dal','thuvaram paruppu'],category:'Indian meals',kcal:116,protein:7.6,carbs:20.1,fat:0.4,servingGrams:150,servingLabel:'1 katori'},
  {id:'curd-rice',name:'Curd rice',aliases:['curd rice','thayir sadam','yogurt rice'],category:'Indian meals',kcal:135,protein:3.5,carbs:22,fat:3.2,servingGrams:180,servingLabel:'1 bowl'},
  {id:'beans-poriyal',name:'Beans poriyal',aliases:['beans poriyal','green beans poriyal','beans stir fry'],category:'Indian meals',kcal:85,protein:2.5,carbs:8,fat:4.5,servingGrams:100,servingLabel:'1 serving'},
  {id:'potato',name:'Potato, boiled',aliases:['potato','boiled potato','urulai kizhangu'],category:'Vegetables',kcal:87,protein:1.9,carbs:20.1,fat:0.1,servingGrams:100,servingLabel:'100 g'},
  {id:'spinach',name:'Spinach',aliases:['spinach','palak','keerai'],category:'Vegetables',kcal:23,protein:2.9,carbs:3.6,fat:0.4,servingGrams:100,servingLabel:'1 cup raw'},
  {id:'green-beans',name:'Green beans, cooked',aliases:['green beans','beans','french beans'],category:'Vegetables',kcal:35,protein:1.9,carbs:7.9,fat:0.3,servingGrams:100,servingLabel:'1 cup'},
  {id:'carrot',name:'Carrot',aliases:['carrot','carrots'],category:'Vegetables',kcal:41,protein:0.9,carbs:9.6,fat:0.2,servingGrams:60,servingLabel:'1 medium'},
  {id:'cucumber',name:'Cucumber',aliases:['cucumber','vellari'],category:'Vegetables',kcal:15,protein:0.7,carbs:3.6,fat:0.1,servingGrams:100,servingLabel:'1 cup'},
  {id:'broccoli',name:'Broccoli, cooked',aliases:['broccoli'],category:'Vegetables',kcal:35,protein:2.4,carbs:7.2,fat:0.4,servingGrams:100,servingLabel:'1 cup'},
  {id:'chow-chow',name:'Chayote / chow chow',aliases:['chow chow','chayote'],category:'Vegetables',kcal:19,protein:0.8,carbs:4.5,fat:0.1,servingGrams:100,servingLabel:'1 cup'},
  {id:'banana',name:'Banana',aliases:['banana','vazhai pazham'],category:'Fruit',kcal:89,protein:1.1,carbs:22.8,fat:0.3,servingGrams:118,servingLabel:'1 medium'},
  {id:'apple',name:'Apple',aliases:['apple'],category:'Fruit',kcal:52,protein:0.3,carbs:13.8,fat:0.2,servingGrams:182,servingLabel:'1 medium'},
  {id:'mango',name:'Mango',aliases:['mango','maanga'],category:'Fruit',kcal:60,protein:0.8,carbs:15,fat:0.4,servingGrams:100,servingLabel:'100 g'},
  {id:'papaya',name:'Papaya',aliases:['papaya','papita'],category:'Fruit',kcal:43,protein:0.5,carbs:10.8,fat:0.3,servingGrams:150,servingLabel:'1 cup'},
  {id:'pomegranate',name:'Pomegranate arils',aliases:['pomegranate','anar','mathulai','pomegranate seeds'],category:'Fruit',kcal:83,protein:1.7,carbs:18.7,fat:1.2,servingGrams:100,servingLabel:'100 g'},
  {id:'orange',name:'Orange',aliases:['orange','oranges'],category:'Fruit',kcal:47,protein:0.9,carbs:11.8,fat:0.1,servingGrams:130,servingLabel:'1 medium'},
  {id:'egg',name:'Egg, whole',aliases:['egg','eggs','boiled egg','whole egg','muttai'],category:'Protein',kcal:143,protein:12.6,carbs:0.7,fat:9.5,servingGrams:50,servingLabel:'1 large'},
  {id:'egg-white',name:'Egg white',aliases:['egg white','egg whites'],category:'Protein',kcal:52,protein:10.9,carbs:0.7,fat:0.2,servingGrams:33,servingLabel:'1 white'},
  {id:'chicken',name:'Chicken breast, cooked',aliases:['chicken','chicken breast','cooked chicken','grilled chicken'],category:'Protein',kcal:165,protein:31,carbs:0,fat:3.6,servingGrams:100,servingLabel:'100 g'},
  {id:'chicken-thigh',name:'Chicken thigh, cooked',aliases:['chicken thigh','thigh chicken'],category:'Protein',kcal:209,protein:26,carbs:0,fat:10.9,servingGrams:100,servingLabel:'100 g'},
  {id:'prawns',name:'Prawns, cooked',aliases:['prawn','prawns','shrimp','chemmeen'],category:'Protein',kcal:99,protein:24,carbs:0.2,fat:0.3,servingGrams:100,servingLabel:'100 g'},
  {id:'fish',name:'Fish, cooked',aliases:['fish','cooked fish','grilled fish'],category:'Protein',kcal:128,protein:26,carbs:0,fat:2.7,servingGrams:100,servingLabel:'100 g'},
  {id:'paneer',name:'Paneer',aliases:['paneer','cottage cheese indian'],category:'Protein',kcal:265,protein:18.3,carbs:1.2,fat:20.8,servingGrams:50,servingLabel:'50 g'},
  {id:'greek-yogurt',name:'Greek yogurt, plain',aliases:['greek yogurt','hung curd','strained yogurt'],category:'Dairy',kcal:59,protein:10.3,carbs:3.6,fat:0.4,servingGrams:100,servingLabel:'100 g'},
  {id:'curd',name:'Curd / plain yogurt',aliases:['curd','yogurt','dahi','thayir'],category:'Dairy',kcal:61,protein:3.5,carbs:4.7,fat:3.3,servingGrams:100,servingLabel:'100 g'},
  {id:'milk',name:'Milk, whole',aliases:['milk','whole milk','full fat milk'],category:'Dairy',kcal:61,protein:3.2,carbs:4.8,fat:3.3,servingGrams:200,servingLabel:'1 glass'},
  {id:'oats',name:'Oats, dry',aliases:['oats','rolled oats','dry oats'],category:'Grains',kcal:389,protein:16.9,carbs:66.3,fat:6.9,servingGrams:40,servingLabel:'40 g'},
  {id:'bread',name:'Whole wheat bread',aliases:['bread','toast','whole wheat bread','brown bread'],category:'Grains',kcal:247,protein:13,carbs:41,fat:4.2,servingGrams:30,servingLabel:'1 slice'},
  {id:'almonds',name:'Almonds',aliases:['almond','almonds','badam'],category:'Nuts',kcal:579,protein:21.2,carbs:21.6,fat:49.9,servingGrams:15,servingLabel:'12 almonds'},
  {id:'cashew',name:'Cashews',aliases:['cashew','cashews'],category:'Nuts',kcal:553,protein:18.2,carbs:30.2,fat:43.8,servingGrams:15,servingLabel:'10 cashews'},
  {id:'peanut',name:'Peanuts',aliases:['peanut','peanuts','groundnut','verkadalai'],category:'Nuts',kcal:567,protein:25.8,carbs:16.1,fat:49.2,servingGrams:15,servingLabel:'1 small handful'},
  {id:'peanut-butter',name:'Peanut butter',aliases:['peanut butter'],category:'Nuts',kcal:588,protein:25,carbs:20,fat:50,servingGrams:16,servingLabel:'1 tbsp'},
  {id:'dark-chocolate',name:'Dark chocolate',aliases:['dark chocolate','chocolate'],category:'Treats',kcal:598,protein:7.8,carbs:45.9,fat:42.6,servingGrams:10,servingLabel:'1 small square'},
  {id:'sugar',name:'Sugar',aliases:['sugar','white sugar'],category:'Extras',kcal:387,protein:0,carbs:100,fat:0,servingGrams:4,servingLabel:'1 tsp'},
  {id:'honey',name:'Honey',aliases:['honey'],category:'Extras',kcal:304,protein:0.3,carbs:82.4,fat:0,servingGrams:7,servingLabel:'1 tsp'},
  {id:'coconut-milk',name:'Coconut milk, canned',aliases:['coconut milk'],category:'Extras',kcal:197,protein:2,carbs:2.8,fat:21.3,servingGrams:30,servingLabel:'2 tbsp'},
];

const popularIds = ['egg','rice-white','idli','dosa','chicken','greek-yogurt','banana','dal'];

function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function searchFoods(query: string, limit = 8): NutritionFood[] {
  const q = normalize(query);
  if (!q) return popularIds.map(id => foods.find(food => food.id === id)!).filter(Boolean);
  const tokens = q.split(' ').filter(token => token.length > 1 && !/^\d+(\.\d+)?$/.test(token) && token !== 'g' && token !== 'gram' && token !== 'grams');
  const ranked = foods.map(food => {
    const fields = [normalize(food.name), ...food.aliases.map(normalize)];
    let score = 0;
    if (fields.some(field => field === q)) score += 100;
    if (fields.some(field => field.startsWith(q))) score += 60;
    if (fields.some(field => q.includes(field) || field.includes(q))) score += 35;
    const matched = tokens.filter(token => fields.some(field => field.includes(token))).length;
    score += matched * 10;
    return { food, score };
  }).filter(row => row.score > 0).sort((a,b) => b.score - a.score || a.food.name.localeCompare(b.food.name));
  return ranked.slice(0, limit).map(row => row.food);
}

export function suggestAmount(query: string, food: NutritionFood): { amount: number; unit: NutritionUnit } {
  const q = normalize(query);
  const gramMatch = q.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(?:g|gram|grams)\b/);
  if (gramMatch) return { amount: Number(gramMatch[1]), unit: 'g' };
  const aliases = [food.name, ...food.aliases].map(normalize).sort((a,b) => b.length-a.length);
  for (const alias of aliases) {
    const index = q.indexOf(alias);
    if (index >= 0) {
      const preceding = q.slice(0,index).match(/(\d+(?:\.\d+)?)\s*$/);
      if (preceding) return { amount: Number(preceding[1]), unit: 'serving' };
    }
  }
  return { amount: 1, unit: 'serving' };
}

export function estimateFood(food: NutritionFood, amount: number, unit: NutritionUnit): FoodEstimate {
  const grams = unit === 'serving' ? food.servingGrams * amount : amount;
  const factor = grams / 100;
  return {
    grams: Math.round(grams),
    calories: Math.round(food.kcal * factor),
    protein: Math.round(food.protein * factor * 10) / 10,
    carbs: Math.round(food.carbs * factor * 10) / 10,
    fat: Math.round(food.fat * factor * 10) / 10,
  };
}

export const FOOD_CATALOGUE_COUNT = foods.length;
