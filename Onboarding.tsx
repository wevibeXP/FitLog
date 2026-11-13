import React,{useMemo,useState} from 'react';
import {ScrollView,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {assess,AssessmentInput,Goal,Activity,EquationSex} from './assessment';
const C={bg:'#FFF9F4',panel:'#FFFFFF',panel2:'#F6F0F7',text:'#393340',muted:'#897F8D',accent:'#9A83D4',line:'#EAE1EB',mint:'#E2F1E8',peach:'#FBE8DF',butter:'#FFF2D8'};
type Props={onComplete:(data:AssessmentInput,result:ReturnType<typeof assess>)=>void};
const goals:{key:Goal;label:string;desc:string}[]=[
 {key:'fat_loss',label:'Fat loss',desc:'Reduce body fat while protecting health and strength'},
 {key:'muscle_gain',label:'Muscle gain',desc:'Support progressive strength and muscle development'},
 {key:'recomposition',label:'Body recomposition',desc:'Work toward changing body composition'},
 {key:'general_fitness',label:'General fitness',desc:'Build sustainable health and fitness habits'}];
const activities:{key:Activity;label:string;desc:string}[]=[
 {key:'sedentary',label:'Mostly sitting',desc:'Desk-based, little intentional exercise'},
 {key:'light',label:'Lightly active',desc:'Some walking or exercise 1–3 days/week'},
 {key:'moderate',label:'Moderately active',desc:'Exercise 3–5 days/week'},
 {key:'high',label:'Very active',desc:'Hard training 6–7 days/week or active work'},
 {key:'athlete',label:'Athlete-level',desc:'Very high training volume / physical job'}];
undefined
undefined
export default function Onboarding({onComplete}:Props){
 const [step,setStep]=useState(0);
 const [age,setAge]=useState('');const [height,setHeight]=useState('');const [weight,setWeight]=useState('');const [goalWeight,setGoalWeight]=useState('');const [days,setDays]=useState('90');
 const [goal,setGoal]=useState<Goal>('fat_loss');const [sex,setSex]=useState<EquationSex>('range');
 const [activity,setActivity]=useState<Activity>('light');const [training,setTraining]=useState('3');const [steps,setSteps]=useState('5000');
 const [diet,setDiet]=useState('No preference');const [protein,setProtein]=useState('Mixed');
 const [healthFlag,setHealthFlag]=useState('');const [cycle,setCycle]=useState('Apple Health connection planned');
 const [consent,setConsent]=useState(false);
 const data:AssessmentInput={age:Number(age),heightCm:Number(height),weightKg:Number(weight),goalWeightKg:Number(goalWeight||weight),goal,days:Number(days),equationSex:sex,activity,trainingDays:Number(training),dietStyle:diet,proteinPreference:protein,steps:Number(steps),healthFlag};
 const result=useMemo(()=>[data.age,data.heightCm,data.weightKg,data.goalWeightKg,data.days].every(v=>Number.isFinite(v)&&v>0)?assess(data):null,[age,height,weight,goalWeight,days,goal,sex,activity,training,steps,healthFlag]);
 const titles=['Start with you','Your goal','Your activity','Your nutrition','Health & recovery','Your assessment'];
 const canNext=step===0?Number(age)>0&&Number(age)<=120&&Number(height)>0&&Number(weight)>0:
   step===1?Number(goalWeight)>0&&Number(days)>0:step===4?consent:true;
 const next=()=>{if(step<5)setStep(step+1);else if(result)onComplete(data,result)};
 const back=()=>setStep(Math.max(0,step-1));
 undefined
 return <View style={{flex:1,backgroundColor:C.bg}}>
  <ScrollView contentContainerStyle={{paddingHorizontal:23,paddingTop:18,paddingBottom:42}}>
   <View style={{alignSelf:'flex-start',backgroundColor:C.mint,paddingHorizontal:14,paddingVertical:9,borderRadius:30}}><Text style={{color:'#547A66',fontWeight:'900',letterSpacing:2.5,fontSize:10}}>F I T L O G  ✳  PERSONAL RESET</Text></View>
   <View style={{height:7,backgroundColor:'#EFE7EF',borderRadius:9,marginTop:24,marginBottom:23,overflow:'hidden'}}><View style={{height:7,width:(step+1)/6*100+'%',backgroundColor:C.accent,borderRadius:9}}/></View>
   <Text style={{color:C.muted,fontSize:10,fontWeight:'800',letterSpacing:2}}>A LITTLE STEP  {step+1}  /  6</Text>
   <Text style={{color:C.text,fontSize:30,fontWeight:'900',letterSpacing:0.3,marginTop:9,marginBottom:9}}>{titles[step]}</Text>
   <Text style={{color:C.muted,lineHeight:23,letterSpacing:0.1,marginBottom:23}}>{step===0?'We need a few basics to estimate your energy needs. You can review everything before accepting a plan.':step===1?'Choose the outcome you want. Fitlog will check whether your target and timeline are realistic.':step===2?'Daily movement matters as much as planned workouts. Choose the option that best describes a typical week.':step===3?'Your food preferences help us create targets and recommendations you can actually follow.':step===4?'Share only what you are comfortable sharing. This helps Fitlog avoid inappropriate recommendations.': 'Here is your initial estimate. It is a starting point, not a medical measurement.'}</Text>
   {step===0&&<>
    <Field label="Age" value={age} onChange={setAge} placeholder="e.g. 28" unit="years"/>
    <Field label="Height" value={height} onChange={setHeight} placeholder="e.g. 165" unit="cm"/>
    <Field label="Current weight" value={weight} onChange={setWeight} placeholder="e.g. 68" unit="kg"/>
    <Text style={{color:C.muted,fontSize:10,fontWeight:'900',letterSpacing:1.6,marginBottom:10}}>HOW SHOULD WE ESTIMATE YOUR BMR?</Text>
    <Choice selected={sex==='female'} label="Female equation coefficient" desc="Mifflin–St Jeor coefficient −161" onPress={()=>setSex('female')}/>
    <Choice selected={sex==='male'} label="Male equation coefficient" desc="Mifflin–St Jeor coefficient +5" onPress={()=>setSex('male')}/>
    <Choice selected={sex==='range'} label="Show an estimate range" desc="Displays both equation estimates when you'd rather not select one" onPress={()=>setSex('range')}/>
   </>}
   {step===1&&<>
    <Text style={{color:C.muted,fontWeight:'900',fontSize:10,letterSpacing:1.6,marginBottom:10}}>WHAT FEELS LIKE YOUR GOAL?</Text>
    {goals.map(g=><Choice key={g.key} selected={goal===g.key} label={g.label} desc={g.desc} onPress={()=>setGoal(g.key)}/>)}
    <Field label="Target weight" value={goalWeight} onChange={setGoalWeight} placeholder="e.g. 62" unit="kg"/>
    <Field label="Desired timeline" value={days} onChange={setDays} placeholder="e.g. 90" unit="days"/>
   </>}
   {step===2&&<>
    <Text style={{color:C.muted,fontWeight:'900',fontSize:10,letterSpacing:1.6,marginBottom:10}}>YOUR EVERYDAY MOVEMENT</Text>
    {activities.map(a=><Choice key={a.key} selected={activity===a.key} label={a.label} desc={a.desc} onPress={()=>setActivity(a.key)}/>)}
    <Field label="Average steps per day (if known)" value={steps} onChange={setSteps} placeholder="e.g. 6500" unit="steps"/>
    <Field label="Planned training days per week" value={training} onChange={setTraining} placeholder="e.g. 4" unit="days"/>
   </>}
   {step===3&&<>
    <Text style={{color:C.muted,fontWeight:'900',fontSize:10,letterSpacing:1.6,marginBottom:10}}>HOW DO YOU LIKE TO EAT?</Text>
    {['No preference','Vegetarian','Eggetarian','Pescatarian','Non-vegetarian','Vegan'].map(x=><Choice key={x} selected={diet===x} label={x} onPress={()=>setDiet(x)}/>)}
    <Text style={{color:C.muted,fontWeight:'900',fontSize:10,letterSpacing:1.6,marginTop:18,marginBottom:10}}>YOUR FAVOURITE PROTEIN SOURCES</Text>
    {['Mixed','Plant-based','Dairy and eggs','Chicken, fish and eggs','No preference'].map(x=><Choice key={x} selected={protein===x} label={x} onPress={()=>setProtein(x)}/>)}
   </>}
   {step===4&&<>
    <Text style={{color:C.muted,fontWeight:'900',fontSize:10,letterSpacing:1.4,marginBottom:10}}>ANYTHING WE SHOULD BE GENTLE AROUND?</Text>
    {['None to declare','Under 18','Pregnant or breastfeeding','Eating disorder history or current concerns','Medical condition or medication affecting diet / exercise','Prefer not to say'].map(x=><Choice key={x} selected={x==='None to declare'?healthFlag==='':healthFlag===x} label={x} onPress={()=>setHealthFlag(x==='None to declare'?'':x)}/>)}
    <Text style={{color:C.muted,fontSize:12,marginTop:10,lineHeight:19}}>Cycle tracking: Fitlog will request Apple Health permissions separately when the iOS integration is built. Cycle predictions will never automatically dictate workout intensity.</Text>
    <Choice selected={cycle==='Apple Health connection planned'} label="Apple Health integration planned" desc="No health data is accessed in this prototype." onPress={()=>setCycle('Apple Health connection planned')}/>
    <TouchableOpacity onPress={()=>setConsent(!consent)} style={{flexDirection:'row',alignItems:'center',marginTop:18,backgroundColor:C.panel,borderRadius:16,padding:13,borderWidth:1,borderColor:C.line}}><View style={{width:23,height:23,borderRadius:8,borderWidth:1.5,borderColor:consent?C.accent:C.muted,backgroundColor:consent?C.accent:C.panel,marginRight:11}}/><Text style={{color:C.text,flex:1,fontSize:12,lineHeight:19}}>I understand these calculations are estimates, not medical advice, and I can change my answers or goals later.</Text></TouchableOpacity>
   </>}
   {step===5&&result&&<>
    <View style={{backgroundColor:C.panel,borderRadius:24,padding:20,borderWidth:1,borderColor:C.line,marginBottom:14,shadowColor:'#7D688D',shadowOpacity:0.06,shadowRadius:14,shadowOffset:{width:0,height:6},elevation:2}}>
     <Text style={{color:C.muted,fontSize:10,fontWeight:'900',letterSpacing:1.6}}>YOUR DAILY ENERGY ESTIMATE</Text>
     <Text style={{color:C.accent,fontSize:31,fontWeight:'900',letterSpacing:-0.5,marginTop:10}}>{result.tdee.low===result.tdee.high?result.tdee.central:`${result.tdee.low}–${result.tdee.high}`} <Text style={{fontSize:13,color:C.muted}}>kcal TDEE</Text></Text>
     <Text style={{color:C.muted,fontSize:12,marginTop:5}}>BMR estimate: {result.bmr.low===result.bmr.high?result.bmr.low:`${result.bmr.low}–${result.bmr.high}`} kcal/day</Text>
     <View style={{height:1,backgroundColor:C.line,marginVertical:17}}/>
     {result.needsReview?<Text style={{color:'#FFD29A',fontSize:16,fontWeight:'900',marginTop:12}}>Calorie and macro targets withheld pending professional review</Text>:<>
      <Text style={{color:C.accent,fontSize:27,fontWeight:'900',marginTop:12}}>{result.targetCalories} kcal/day</Text>
      <Text style={{color:C.muted,fontSize:12}}>Provisional target for discussion and adjustment</Text>
      <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:17}}>
       <Text style={{color:C.text,fontWeight:'800'}}>Protein  {result.macros?.proteinG}g</Text><Text style={{color:C.text,fontWeight:'800'}}>Carbs  {result.macros?.carbsG}g</Text><Text style={{color:C.text,fontWeight:'800'}}>Fat  {result.macros?.fatG}g</Text>
      </View>
     </>}
    </View>
    <View style={{backgroundColor:result.needsReview?C.peach:result.feasible?C.mint:C.butter,padding:16,borderRadius:19,marginBottom:14}}>
     <Text style={{color:result.needsReview?'#8D5B48':result.feasible?'#547A66':'#94733B',fontWeight:'900',letterSpacing:0.3}}>{result.needsReview?'Professional review needed':result.feasible?'Initial goal check: within planning limits':'Timeline needs adjustment'}</Text>
     <Text style={{color:'#5F5663',fontSize:12,lineHeight:20,marginTop:7}}>{result.needsReview?'Fitlog will not prescribe a weight-loss calorie target until this context is reviewed with a qualified health professional.':result.feasible?'Your requested pace is within the app’s initial planning guardrails. Actual results will vary.':'Your requested rate implies a deficit above Fitlog’s conservative planning limit or exceeds 1% of body weight per week. We recommend extending the timeline.'}</Text>
    </View>
    <Text style={{color:C.muted,fontSize:12,lineHeight:19}}>BMI estimate: {result.bmi}. BMI is a screening measure, not a body-fat measurement or diagnosis. Weight-loss energy calculations use an approximate 7,700 kcal/kg model and are not linear predictions.</Text>
    {result.notes.map((n,i)=><Text key={i} style={{color:C.muted,fontSize:11,marginTop:6}}>• {n}</Text>)}
   </>}
   <View style={{flexDirection:'row',gap:11,marginTop:22}}>
    {step>0?<TouchableOpacity onPress={back} style={{padding:16,borderRadius:18,borderWidth:1,borderColor:C.line,backgroundColor:C.panel,flex:1,alignItems:'center'}}><Text style={{color:C.text,fontWeight:'800',letterSpacing:0.5}}>BACK</Text></TouchableOpacity>:null}
    <View style={{flex:2}}>{btn(step===5?'Accept assessment & continue':'Continue',next,!canNext|| (step===5&&!result))}</View>
   </View>
   {step===0&&<Text style={{color:C.muted,fontSize:11,lineHeight:18,marginTop:14,letterSpacing:0.1}}>For adults and teens: under-18 users can complete the profile, but Fitlog will withhold calorie and macro prescriptions and require a clinician-supported pathway.</Text>}
  </ScrollView>
 </View>;
}