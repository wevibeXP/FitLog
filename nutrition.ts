export type NutritionFood = {
  id: string; name: string; aliases: string[]; category: string;
  kcal: number; protein: number; carbs: number; fat: number;
  servingGrams: number; servingLabel: string;
};
export type NutritionUnit = 'serving' | 'g';
export type FoodEstimate = { grams: number; calories: number; protein: number; carbs: number; fat: number };

const foods: NutritionFood[] = [
  {id:'rice-white',name:'White rice, cooked',aliases:['rice','cooked rice','white rice','steamed rice','sona masoori rice','sadam','saadam','soru','arisi'],category:'Grains',kcal:130,protein:2.7,carbs:28.2,fat:0.3,servingGrams:150,servingLabel:'1 bowl'},
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
  {id:'chicken',name:'Chicken breast, cooked',aliases:['chicken','chicken breast','cooked chicken','grilled chicken','kozhi'],category:'Protein',kcal:165,protein:31,carbs:0,fat:3.6,servingGrams:100,servingLabel:'100 g'},
  {id:'chicken-thigh',name:'Chicken thigh, cooked',aliases:['chicken thigh','thigh chicken'],category:'Protein',kcal:209,protein:26,carbs:0,fat:10.9,servingGrams:100,servingLabel:'100 g'},
  {id:'prawns',name:'Prawns, cooked',aliases:['prawn','prawns','shrimp','chemmeen','eral'],category:'Protein',kcal:99,protein:24,carbs:0.2,fat:0.3,servingGrams:100,servingLabel:'100 g'},
  {id:'fish',name:'Fish, cooked',aliases:['fish','cooked fish','grilled fish','meen'],category:'Protein',kcal:128,protein:26,carbs:0,fat:2.7,servingGrams:100,servingLabel:'100 g'},
  {id:'paneer',name:'Paneer',aliases:['paneer','cottage cheese indian'],category:'Protein',kcal:265,protein:18.3,carbs:1.2,fat:20.8,servingGrams:50,servingLabel:'50 g'},
  {id:'greek-yogurt',name:'Greek yogurt, plain',aliases:['greek yogurt','hung curd','strained yogurt'],category:'Dairy',kcal:59,protein:10.3,carbs:3.6,fat:0.4,servingGrams:100,servingLabel:'100 g'},
  {id:'curd',name:'Curd / plain yogurt',aliases:['curd','yogurt','dahi','thayir'],category:'Dairy',kcal:61,protein:3.5,carbs:4.7,fat:3.3,servingGrams:100,servingLabel:'100 g'},
  {id:'milk',name:'Milk, whole',aliases:['milk','whole milk','full fat milk','paal'],category:'Dairy',kcal:61,protein:3.2,carbs:4.8,fat:3.3,servingGrams:200,servingLabel:'1 glass'},
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

  // Everyday staples and dishes. Recipe-based values vary with oil, portions and preparation.
  {id:'rice-basmati',name:'Basmati rice, cooked',aliases:['basmati rice','cooked basmati'],category:'Grains',kcal:121,protein:3.5,carbs:25.2,fat:0.4,servingGrams:150,servingLabel:'1 bowl'},
  {id:'rice-red',name:'Red rice, cooked',aliases:['red rice','matta rice','kerala red rice'],category:'Grains',kcal:115,protein:2.6,carbs:24,fat:0.8,servingGrams:150,servingLabel:'1 bowl'},
  {id:'millet-cooked',name:'Millet, cooked',aliases:['millet','cooked millet','small millet','samai','varagu'],category:'Grains',kcal:119,protein:3.5,carbs:23.7,fat:1,servingGrams:150,servingLabel:'1 bowl'},
  {id:'quinoa-cooked',name:'Quinoa, cooked',aliases:['quinoa','cooked quinoa'],category:'Grains',kcal:120,protein:4.4,carbs:21.3,fat:1.9,servingGrams:100,servingLabel:'100 g'},
  {id:'poha',name:'Poha / aval',aliases:['poha','aval','flattened rice','aval upma'],category:'Indian meals',kcal:130,protein:2.5,carbs:26,fat:2.5,servingGrams:150,servingLabel:'1 bowl'},
  {id:'oats-cooked',name:'Oats, cooked with water',aliases:['cooked oats','oatmeal','oats porridge'],category:'Grains',kcal:71,protein:2.5,carbs:12,fat:1.5,servingGrams:200,servingLabel:'1 bowl'},
  {id:'pasta-cooked',name:'Pasta, cooked',aliases:['pasta','cooked pasta','macaroni'],category:'Grains',kcal:157,protein:5.8,carbs:30.6,fat:0.9,servingGrams:150,servingLabel:'1 bowl'},
  {id:'noodles-cooked',name:'Noodles, cooked',aliases:['noodles','cooked noodles','hakka noodles'],category:'Grains',kcal:138,protein:4.5,carbs:25,fat:2,servingGrams:150,servingLabel:'1 bowl'},
  {id:'bread-white',name:'White bread',aliases:['white bread','white toast','sandwich bread'],category:'Grains',kcal:266,protein:8.9,carbs:49,fat:3.2,servingGrams:30,servingLabel:'1 slice'},
  {id:'bread-multigrain',name:'Multigrain bread',aliases:['multigrain bread','seeded bread'],category:'Grains',kcal:250,protein:11,carbs:43,fat:4,servingGrams:30,servingLabel:'1 slice'},
  {id:'naan',name:'Naan',aliases:['naan','butter naan'],category:'Grains',kcal:290,protein:9,carbs:50,fat:5,servingGrams:90,servingLabel:'1 piece'},
  {id:'parotta',name:'Parotta',aliases:['parotta','parotta bread','kerala parotta'],category:'South Indian',kcal:326,protein:6,carbs:45,fat:14,servingGrams:90,servingLabel:'1 piece'},
  {id:'masala-dosa',name:'Masala dosa',aliases:['masala dosa','potato dosa'],category:'South Indian',kcal:190,protein:4,carbs:28,fat:7,servingGrams:150,servingLabel:'1 medium'},
  {id:'rava-idli',name:'Rava idli',aliases:['rava idli','sooji idli'],category:'South Indian',kcal:160,protein:4,carbs:26,fat:4,servingGrams:60,servingLabel:'1 piece'},
  {id:'uttapam',name:'Uttapam',aliases:['uttapam','uthappam','onion uttapam'],category:'South Indian',kcal:165,protein:4,carbs:28,fat:3,servingGrams:100,servingLabel:'1 medium'},
  {id:'medu-vada',name:'Medu vada',aliases:['medu vada','vada','ulundu vadai'],category:'South Indian',kcal:280,protein:7,carbs:34,fat:13,servingGrams:45,servingLabel:'1 piece'},
  {id:'puttu',name:'Puttu',aliases:['puttu','puttu kadala'],category:'South Indian',kcal:150,protein:3.5,carbs:30,fat:1.5,servingGrams:150,servingLabel:'1 serving'},
  {id:'lemon-rice',name:'Lemon rice',aliases:['lemon rice','elumichai sadam','chitranna'],category:'South Indian',kcal:170,protein:3.5,carbs:28,fat:5,servingGrams:180,servingLabel:'1 bowl'},
  {id:'tomato-rice',name:'Tomato rice',aliases:['tomato rice','thakkali sadam'],category:'South Indian',kcal:150,protein:3,carbs:26,fat:4,servingGrams:180,servingLabel:'1 bowl'},
  {id:'veg-pulao',name:'Vegetable pulao',aliases:['veg pulao','vegetable pulao','pulao'],category:'Indian meals',kcal:155,protein:3.5,carbs:27,fat:3.5,servingGrams:180,servingLabel:'1 bowl'},
  {id:'veg-biryani',name:'Vegetable biryani',aliases:['veg biryani','vegetable biryani'],category:'Indian meals',kcal:160,protein:3.5,carbs:26,fat:4.5,servingGrams:200,servingLabel:'1 bowl'},
  {id:'chicken-biryani',name:'Chicken biryani',aliases:['chicken biryani','biriyani chicken','chicken biriyani','chicken briyani','briyani'],category:'Indian meals',kcal:180,protein:9,carbs:19,fat:7,servingGrams:200,servingLabel:'1 bowl'},
  {id:'egg-fried-rice',name:'Egg fried rice',aliases:['egg fried rice','egg rice'],category:'Indian meals',kcal:170,protein:6,carbs:25,fat:5,servingGrams:200,servingLabel:'1 bowl'},
  {id:'chicken-fried-rice',name:'Chicken fried rice',aliases:['chicken fried rice'],category:'Indian meals',kcal:180,protein:9,carbs:24,fat:5,servingGrams:200,servingLabel:'1 bowl'},
  {id:'sambar-rice',name:'Sambar rice',aliases:['sambar rice','sambar sadam','sambar sadham'],category:'South Indian',kcal:125,protein:3.5,carbs:21,fat:3,servingGrams:200,servingLabel:'1 bowl'},
  {id:'rasam-rice',name:'Rasam rice',aliases:['rasam rice','rasam sadam'],category:'South Indian',kcal:120,protein:2.5,carbs:22,fat:2,servingGrams:200,servingLabel:'1 bowl'},
  {id:'chicken-curry',name:'Chicken curry',aliases:['chicken curry','chicken gravy','kozhi kulambu'],category:'Indian meals',kcal:155,protein:16,carbs:4,fat:8,servingGrams:150,servingLabel:'1 katori'},
  {id:'tandoori-chicken',name:'Tandoori chicken',aliases:['tandoori chicken','chicken tikka'],category:'Protein',kcal:165,protein:29,carbs:2,fat:4,servingGrams:120,servingLabel:'1 portion'},
  {id:'chicken-65',name:'Chicken 65',aliases:['chicken 65','chicken sixty five'],category:'Indian meals',kcal:250,protein:18,carbs:10,fat:16,servingGrams:100,servingLabel:'100 g'},
  {id:'omelette',name:'Omelette, plain',aliases:['omelette','omelet','egg omelette'],category:'Protein',kcal:154,protein:11,carbs:1,fat:11,servingGrams:60,servingLabel:'2 eggs'},
  {id:'egg-bhurji',name:'Egg bhurji',aliases:['egg bhurji','mutta podimas','scrambled eggs indian'],category:'Indian meals',kcal:170,protein:10,carbs:4,fat:12,servingGrams:120,servingLabel:'1 serving'},
  {id:'egg-curry',name:'Egg curry',aliases:['egg curry','mutta curry'],category:'Indian meals',kcal:150,protein:8,carbs:6,fat:10,servingGrams:150,servingLabel:'1 katori'},
  {id:'chickpeas',name:'Chickpeas, cooked',aliases:['chickpeas','chana','channa','kabuli chana','boiled chickpeas'],category:'Protein',kcal:164,protein:8.9,carbs:27.4,fat:2.6,servingGrams:100,servingLabel:'100 g'},
  {id:'black-chana',name:'Black chana, cooked',aliases:['black chana','kala chana','kondakadalai','black chickpeas'],category:'Protein',kcal:164,protein:8.9,carbs:27,fat:2.6,servingGrams:100,servingLabel:'100 g'},
  {id:'rajma',name:'Rajma, cooked',aliases:['rajma','kidney beans','red kidney beans'],category:'Protein',kcal:127,protein:8.7,carbs:22.8,fat:0.5,servingGrams:100,servingLabel:'100 g'},
  {id:'moong-sprouts',name:'Moong sprouts',aliases:['moong sprouts','green gram sprouts','pachai payaru sprouts'],category:'Protein',kcal:30,protein:3,carbs:6,fat:0.2,servingGrams:100,servingLabel:'1 cup'},
  {id:'soya-chunks',name:'Soya chunks, cooked',aliases:['soya chunks','soy chunks','meal maker','meal maker cooked'],category:'Protein',kcal:120,protein:18,carbs:12,fat:0.5,servingGrams:100,servingLabel:'100 g'},
  {id:'tofu',name:'Tofu, firm',aliases:['tofu','soy paneer'],category:'Protein',kcal:76,protein:8,carbs:1.9,fat:4.8,servingGrams:100,servingLabel:'100 g'},
  {id:'salmon',name:'Salmon, cooked',aliases:['salmon','cooked salmon'],category:'Protein',kcal:206,protein:22,carbs:0,fat:12,servingGrams:100,servingLabel:'100 g'},
  {id:'tuna',name:'Tuna, canned in water',aliases:['tuna','canned tuna'],category:'Protein',kcal:116,protein:26,carbs:0,fat:1,servingGrams:100,servingLabel:'100 g'},
  {id:'tomato',name:'Tomato, raw',aliases:['tomato','tomatoes','thakkali'],category:'Vegetables',kcal:18,protein:0.9,carbs:3.9,fat:0.2,servingGrams:120,servingLabel:'1 medium'},
  {id:'onion',name:'Onion, raw',aliases:['onion','onions','vengayam'],category:'Vegetables',kcal:40,protein:1.1,carbs:9.3,fat:0.1,servingGrams:80,servingLabel:'1 small'},
  {id:'capsicum',name:'Capsicum / bell pepper',aliases:['capsicum','bell pepper','green pepper','kudai milagai'],category:'Vegetables',kcal:20,protein:0.9,carbs:4.6,fat:0.2,servingGrams:75,servingLabel:'1 small'},
  {id:'cauliflower',name:'Cauliflower, cooked',aliases:['cauliflower','gobi','cauliflower poriyal'],category:'Vegetables',kcal:23,protein:1.8,carbs:4.1,fat:0.5,servingGrams:100,servingLabel:'1 cup'},
  {id:'cabbage',name:'Cabbage, cooked',aliases:['cabbage','muttaikose'],category:'Vegetables',kcal:25,protein:1.3,carbs:5.8,fat:0.1,servingGrams:100,servingLabel:'1 cup'},
  {id:'beetroot',name:'Beetroot',aliases:['beetroot','beet','beetroot poriyal'],category:'Vegetables',kcal:43,protein:1.6,carbs:9.6,fat:0.2,servingGrams:80,servingLabel:'1 small'},
  {id:'okra',name:'Okra / bhindi',aliases:['okra','bhindi','ladies finger','vendakkai'],category:'Vegetables',kcal:33,protein:1.9,carbs:7.5,fat:0.2,servingGrams:100,servingLabel:'1 cup'},
  {id:'brinjal',name:'Brinjal / eggplant',aliases:['brinjal','eggplant','aubergine','kathirikai'],category:'Vegetables',kcal:25,protein:1,carbs:6,fat:0.2,servingGrams:100,servingLabel:'1 cup'},
  {id:'mushroom',name:'Mushroom',aliases:['mushroom','mushrooms'],category:'Vegetables',kcal:22,protein:3.1,carbs:3.3,fat:0.3,servingGrams:70,servingLabel:'1 cup'},
  {id:'sweet-potato',name:'Sweet potato, boiled',aliases:['sweet potato','sakkaraivalli kizhangu'],category:'Vegetables',kcal:76,protein:1.4,carbs:17.7,fat:0.1,servingGrams:130,servingLabel:'1 medium'},
  {id:'peas',name:'Green peas',aliases:['peas','green peas','matar'],category:'Vegetables',kcal:81,protein:5.4,carbs:14.5,fat:0.4,servingGrams:80,servingLabel:'1/2 cup'},
  {id:'corn',name:'Sweet corn',aliases:['corn','sweet corn','makkacholam'],category:'Vegetables',kcal:96,protein:3.4,carbs:21,fat:0.8,servingGrams:80,servingLabel:'1/2 cup'},
  {id:'pumpkin',name:'Pumpkin, cooked',aliases:['pumpkin','parangikai'],category:'Vegetables',kcal:26,protein:1,carbs:6.5,fat:0.1,servingGrams:100,servingLabel:'1 cup'},
  {id:'lettuce',name:'Lettuce',aliases:['lettuce','salad greens'],category:'Vegetables',kcal:15,protein:1.4,carbs:2.9,fat:0.2,servingGrams:50,servingLabel:'2 cups'},
  {id:'grapes',name:'Grapes',aliases:['grapes','green grapes','black grapes'],category:'Fruit',kcal:69,protein:0.7,carbs:18.1,fat:0.2,servingGrams:100,servingLabel:'1 cup'},
  {id:'watermelon',name:'Watermelon',aliases:['watermelon','tharpoosani'],category:'Fruit',kcal:30,protein:0.6,carbs:7.6,fat:0.2,servingGrams:150,servingLabel:'1 cup'},
  {id:'guava',name:'Guava',aliases:['guava','koyya pazham'],category:'Fruit',kcal:68,protein:2.6,carbs:14.3,fat:1,servingGrams:100,servingLabel:'1 medium'},
  {id:'pineapple',name:'Pineapple',aliases:['pineapple','annasi'],category:'Fruit',kcal:50,protein:0.5,carbs:13.1,fat:0.1,servingGrams:100,servingLabel:'1 cup'},
  {id:'strawberry',name:'Strawberries',aliases:['strawberry','strawberries'],category:'Fruit',kcal:32,protein:0.7,carbs:7.7,fat:0.3,servingGrams:100,servingLabel:'1 cup'},
  {id:'kiwi',name:'Kiwi',aliases:['kiwi','kiwifruit'],category:'Fruit',kcal:61,protein:1.1,carbs:14.7,fat:0.5,servingGrams:75,servingLabel:'1 fruit'},
  {id:'pear',name:'Pear',aliases:['pear','pears'],category:'Fruit',kcal:57,protein:0.4,carbs:15.2,fat:0.1,servingGrams:170,servingLabel:'1 medium'},
  {id:'avocado',name:'Avocado',aliases:['avocado','butter fruit'],category:'Fruit',kcal:160,protein:2,carbs:8.5,fat:14.7,servingGrams:70,servingLabel:'1/2 fruit'},
  {id:'dates',name:'Dates',aliases:['date','dates','pericham pazham'],category:'Fruit',kcal:282,protein:2.5,carbs:75,fat:0.4,servingGrams:8,servingLabel:'1 date'},
  {id:'blueberries',name:'Blueberries',aliases:['blueberry','blueberries'],category:'Fruit',kcal:57,protein:0.7,carbs:14.5,fat:0.3,servingGrams:75,servingLabel:'1/2 cup'},
  {id:'sweet-lime',name:'Sweet lime / mosambi',aliases:['sweet lime','mosambi','sathukudi'],category:'Fruit',kcal:43,protein:0.7,carbs:9.3,fat:0.2,servingGrams:130,servingLabel:'1 medium'},
  {id:'milk-toned',name:'Toned milk',aliases:['toned milk','2 percent milk'],category:'Dairy',kcal:58,protein:3,carbs:4.8,fat:3,servingGrams:200,servingLabel:'1 glass'},
  {id:'milk-skim',name:'Skim milk',aliases:['skim milk','low fat milk','fat free milk'],category:'Dairy',kcal:34,protein:3.4,carbs:5,fat:0.1,servingGrams:200,servingLabel:'1 glass'},
  {id:'buttermilk',name:'Buttermilk / neer mor',aliases:['buttermilk','neer mor','chaas','more'],category:'Dairy',kcal:40,protein:3,carbs:4,fat:0.8,servingGrams:200,servingLabel:'1 glass'},
  {id:'lassi',name:'Lassi, sweetened',aliases:['lassi','sweet lassi'],category:'Dairy',kcal:80,protein:3,carbs:12,fat:2,servingGrams:200,servingLabel:'1 glass'},
  {id:'cheese-slice',name:'Cheese slice',aliases:['cheese slice','processed cheese','cheddar slice'],category:'Dairy',kcal:300,protein:18,carbs:3,fat:23,servingGrams:20,servingLabel:'1 slice'},
  {id:'mozzarella',name:'Mozzarella cheese',aliases:['mozzarella','mozzarella cheese'],category:'Dairy',kcal:280,protein:28,carbs:3,fat:17,servingGrams:30,servingLabel:'30 g'},
  {id:'butter',name:'Butter',aliases:['butter','salted butter'],category:'Dairy',kcal:717,protein:0.9,carbs:0.1,fat:81,servingGrams:5,servingLabel:'1 tsp'},
  {id:'ghee',name:'Ghee',aliases:['ghee','clarified butter','nei'],category:'Extras',kcal:900,protein:0,carbs:0,fat:100,servingGrams:5,servingLabel:'1 tsp'},
  {id:'whey-protein',name:'Whey protein powder',aliases:['whey','whey protein','protein powder'],category:'Protein',kcal:400,protein:80,carbs:8,fat:5,servingGrams:30,servingLabel:'1 scoop'},
  {id:'walnuts',name:'Walnuts',aliases:['walnut','walnuts','akhrot'],category:'Nuts',kcal:654,protein:15.2,carbs:13.7,fat:65.2,servingGrams:15,servingLabel:'5 halves'},
  {id:'pistachios',name:'Pistachios',aliases:['pistachio','pistachios','pista'],category:'Nuts',kcal:562,protein:20,carbs:28,fat:45,servingGrams:15,servingLabel:'1 small handful'},
  {id:'chia-seeds',name:'Chia seeds',aliases:['chia','chia seeds'],category:'Nuts',kcal:486,protein:16.5,carbs:42.1,fat:30.7,servingGrams:12,servingLabel:'1 tbsp'},
  {id:'flax-seeds',name:'Flax seeds',aliases:['flax','flax seeds','linseed'],category:'Nuts',kcal:534,protein:18.3,carbs:28.9,fat:42.2,servingGrams:10,servingLabel:'1 tbsp'},
  {id:'pumpkin-seeds',name:'Pumpkin seeds',aliases:['pumpkin seeds','pepitas'],category:'Nuts',kcal:559,protein:30,carbs:10.7,fat:49.1,servingGrams:15,servingLabel:'1 tbsp'},
  {id:'raisins',name:'Raisins',aliases:['raisin','raisins','kishmish'],category:'Nuts',kcal:299,protein:3.1,carbs:79,fat:0.5,servingGrams:15,servingLabel:'1 tbsp'},
  {id:'coffee-black',name:'Coffee, brewed black',aliases:['coffee','black coffee','brewed coffee','americano','americano black','black americano'],category:'Beverages',kcal:2,protein:0.1,carbs:0,fat:0,servingGrams:200,servingLabel:'1 cup (200 ml)'},
  {id:'espresso',name:'Espresso',aliases:['espresso','espresso shot'],category:'Beverages',kcal:9,protein:0.1,carbs:1.7,fat:0.2,servingGrams:30,servingLabel:'1 shot (30 ml)'},
  {id:'filter-coffee',name:'South Indian filter coffee, milk and sugar',aliases:['filter coffee','south indian filter coffee','kaapi','degree coffee','coffee with milk and sugar','milk coffee'],category:'Beverages',kcal:45,protein:2,carbs:6,fat:1.5,servingGrams:150,servingLabel:'1 tumbler (150 ml)'},
  {id:'latte',name:'Latte, unsweetened',aliases:['latte','cafe latte'],category:'Beverages',kcal:60,protein:3.2,carbs:5,fat:2.5,servingGrams:200,servingLabel:'1 cup (200 ml)'},
  {id:'tea-black',name:'Tea, brewed without milk or sugar',aliases:['tea','black tea','plain tea'],category:'Beverages',kcal:1,protein:0,carbs:0.3,fat:0,servingGrams:200,servingLabel:'1 cup (200 ml)'},
  {id:'chai',name:'Chai / tea with milk and sugar',aliases:['chai','milk tea','indian tea','tea with milk','tea with milk and sugar'],category:'Beverages',kcal:45,protein:1.8,carbs:6.5,fat:1.4,servingGrams:180,servingLabel:'1 cup (180 ml)'},
  {id:'green-tea',name:'Green tea, unsweetened',aliases:['green tea'],category:'Beverages',kcal:1,protein:0,carbs:0.2,fat:0,servingGrams:200,servingLabel:'1 cup (200 ml)'},
  {id:'coconut-water',name:'Tender coconut water',aliases:['coconut water','tender coconut water','ilaneer','elaneer'],category:'Beverages',kcal:19,protein:0.7,carbs:3.7,fat:0.2,servingGrams:200,servingLabel:'1 glass (200 ml)'},
  {id:'orange-juice',name:'Orange juice, unsweetened',aliases:['orange juice','fresh orange juice'],category:'Beverages',kcal:45,protein:0.7,carbs:10.4,fat:0.2,servingGrams:200,servingLabel:'1 glass (200 ml)'},
  {id:'chocolate-milk',name:'Chocolate milk',aliases:['chocolate milk','chocolate milkshake','cocoa milkshake'],category:'Beverages',kcal:90,protein:3.5,carbs:13,fat:2.5,servingGrams:180,servingLabel:'1 glass (180 ml)'},
  {id:'lemon-water',name:'Lemon water, unsweetened',aliases:['lemon water','lemon juice water','elumichai water'],category:'Beverages',kcal:4,protein:0.1,carbs:1.3,fat:0,servingGrams:250,servingLabel:'1 glass (250 ml)'},
  {id:'cooking-oil',name:'Cooking oil',aliases:['oil','cooking oil','sunflower oil','groundnut oil'],category:'Extras',kcal:884,protein:0,carbs:0,fat:100,servingGrams:5,servingLabel:'1 tsp'},
  {id:'olive-oil',name:'Olive oil',aliases:['olive oil'],category:'Extras',kcal:884,protein:0,carbs:0,fat:100,servingGrams:5,servingLabel:'1 tsp'},
  {id:'popcorn',name:'Popcorn, air-popped',aliases:['popcorn','air popped popcorn'],category:'Snacks',kcal:387,protein:13,carbs:78,fat:4.5,servingGrams:15,servingLabel:'3 cups'},
  {id:'samosa',name:'Vegetable samosa',aliases:['samosa','veg samosa'],category:'Snacks',kcal:260,protein:5,carbs:30,fat:13,servingGrams:80,servingLabel:'1 piece'},
  {id:'marie-biscuit',name:'Marie biscuit',aliases:['marie biscuit','marie biscuits'],category:'Snacks',kcal:430,protein:7,carbs:78,fat:10,servingGrams:7,servingLabel:'1 biscuit'},
  {id:'digestive-biscuit',name:'Digestive biscuit',aliases:['digestive biscuit','digestive biscuits'],category:'Snacks',kcal:470,protein:7,carbs:65,fat:20,servingGrams:14,servingLabel:'1 biscuit'},
  {id:'murukku',name:'Murukku',aliases:['murukku','chakli'],category:'Snacks',kcal:500,protein:7,carbs:55,fat:28,servingGrams:25,servingLabel:'1 small piece'},
  {id:'chole',name:'Chole masala',aliases:['chole','chana masala','chole masala'],category:'Indian meals',kcal:160,protein:7,carbs:20,fat:6,servingGrams:150,servingLabel:'1 katori'},
  {id:'paneer-butter-masala',name:'Paneer butter masala',aliases:['paneer butter masala','butter paneer'],category:'Indian meals',kcal:240,protein:10,carbs:10,fat:18,servingGrams:150,servingLabel:'1 katori'},
  {id:'fish-curry',name:'Fish curry',aliases:['fish curry','meen kulambu','meen kuzhambu'],category:'Indian meals',kcal:150,protein:13,carbs:5,fat:8,servingGrams:150,servingLabel:'1 katori'},
  {id:'coconut-chutney',name:'Coconut chutney',aliases:['coconut chutney','thengai chutney'],category:'South Indian',kcal:230,protein:3,carbs:7,fat:22,servingGrams:30,servingLabel:'2 tbsp'},
  {id:'tomato-chutney',name:'Tomato chutney',aliases:['tomato chutney','thakkali chutney'],category:'South Indian',kcal:90,protein:2,carbs:8,fat:5,servingGrams:30,servingLabel:'2 tbsp'},
  {id:'veg-kurma',name:'Vegetable kurma',aliases:['veg kurma','vegetable kurma','kurma'],category:'Indian meals',kcal:150,protein:3,carbs:10,fat:10,servingGrams:150,servingLabel:'1 katori'},
];

const popularIds = ['egg','rice-white','idli','dosa','chicken','coffee-black','greek-yogurt','banana'];

function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getFoodById(id: string): NutritionFood | undefined {
  return foods.find(food => food.id === id);
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
