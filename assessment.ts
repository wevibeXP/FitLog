export type Goal = 'fat_loss'|'muscle_gain'|'recomposition'|'general_fitness';
export type EquationSex = 'female'|'male'|'range';
export type Activity = 'sedentary'|'light'|'moderate'|'high'|'athlete';
export type AssessmentInput = {
  age:number; heightCm:number; weightKg:number; goalWeightKg:number;
  goal:Goal; days:number; equationSex:EquationSex; activity:Activity;
  trainingDays:number; dietStyle:string; proteinPreference:string;
  steps:number; healthFlag:string;
};
const activityFactor:Record<Activity,number> = {
  sedentary:1.2, light:1.375, moderate:1.55, high:1.725, athlete:1.9
};
const round=(n:number)=>Math.round(n);
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
function bmrFor(weight:number,height:number,age:number,sex:'female'|'male') {
  return 10*weight + 6.25*height - 5*age + (sex==='male'?5:-161);
}
export function assess(input:AssessmentInput) {
  const {age,heightCm,weightKg,goalWeightKg,goal,days,equationSex,activity}=input;
  const bmrValues = equationSex==='range'
    ? [bmrFor(weightKg,heightCm,age,'female'),bmrFor(weightKg,heightCm,age,'male')]
    : [bmrFor(weightKg,heightCm,age,equationSex)];
  const bmrLow=Math.min(...bmrValues), bmrHigh=Math.max(...bmrValues);
  const factor=activityFactor[activity];
  const tdeeLow=bmrLow*factor, tdeeHigh=bmrHigh*factor;
  const tdee=(tdeeLow+tdeeHigh)/2;
  const delta=goalWeightKg-weightKg;
  const requestedLoss=Math.max(0,-delta);
  const requiredDailyDeficit=days>0?requestedLoss*7700/days:0;
  const maxPlanningDeficit=Math.min(500,tdee*0.20);
  const safeWeeklyKg=weightKg*0.005;
  const requestedWeeklyKg=days>0?requestedLoss/(days/7):0;
  const weeklyRatePercent=weightKg>0?(requestedWeeklyKg/weightKg)*100:0;
  const isLoss=goal==='fat_loss'||(goal==='recomposition'&&delta<0);
  const isGain=goal==='muscle_gain'||(goal==='recomposition'&&delta>0);
  const estimatedTargetCalories = isLoss
    ? tdee-Math.min(maxPlanningDeficit,Math.max(150,requiredDailyDeficit))
    : isGain ? tdee+Math.min(250,tdee*0.10) : tdee;
  const needsReview = age<18 || (!!input.healthFlag && input.healthFlag!=='None to declare');
  const feasible = !isLoss || (requestedLoss===0 ? true :
    requiredDailyDeficit<=maxPlanningDeficit && weeklyRatePercent<=1);
  const proteinPerKg=goal==='muscle_gain'?1.8:goal==='recomposition'?1.7:1.6;
  const proteinG=round(weightKg*proteinPerKg);
  const fatG=round((estimatedTargetCalories*0.27)/9);
  const carbsG=round(Math.max(0,(estimatedTargetCalories-proteinG*4-fatG*9)/4));
  const bmi=weightKg/Math.pow(heightCm/100,2);
  return {
    bmr:{low:round(bmrLow),high:round(bmrHigh)},
    tdee:{low:round(tdeeLow),high:round(tdeeHigh),central:round(tdee)},
    targetCalories:needsReview?null:round(estimatedTargetCalories),
    macros:needsReview?null:{proteinG,fatG,carbsG},
    bmi:Math.round(bmi*10)/10,
    requiredDailyDeficit:round(requiredDailyDeficit),
    maxPlanningDeficit:round(maxPlanningDeficit),
    requestedWeeklyKg:Math.round(requestedWeeklyKg*100)/100,
    weeklyRatePercent:Math.round(weeklyRatePercent*100)/100,
    feasible,
    needsReview,
    notes:[
      'BMR and TDEE are population-level estimates, not direct measurements.',
      'Activity multipliers are starting assumptions; wearable calorie estimates are not added again.',
      'Macro targets are starting points and should be adjusted for preferences, training and clinical needs.'
    ]
  };
}