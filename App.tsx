import React,{useState} from 'react';
import {SafeAreaView,StatusBar,Text,View,TouchableOpacity,ScrollView} from 'react-native';
import Onboarding from './Onboarding';
import {AssessmentInput,assess} from './assessment';
const C={bg:'#0B0D10',panel:'#15191F',text:'#F4F6F8',muted:'#98A2AE',accent:'#B8F36B',line:'#2A333D'};
export default function App(){
 const [profile,setProfile]=useState<AssessmentInput|null>(null);
 const [result,setResult]=useState<ReturnType<typeof assess>|null>(null);
 return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
  <StatusBar barStyle="light-content"/>
  {!profile||!result?<Onboarding onComplete={(p,r)=>{setProfile(p);setResult(r)}}/>:
   <ScrollView contentContainerStyle={{padding:22,paddingBottom:40}}>
    <Text style={{color:C.accent,fontWeight:'900',letterSpacing:2,fontSize:12}}>FITLOG · YOUR BASELINE</Text>
    <Text style={{color:C.text,fontSize:30,fontWeight:'900',marginTop:12}}>Assessment saved.</Text>
    <Text style={{color:C.muted,lineHeight:21,marginTop:8}}>Your initial profile is ready. Next we'll connect food logging, workouts, Apple Health and your Coach Mode.</Text>
    <View style={{backgroundColor:C.panel,borderRadius:18,borderWidth:1,borderColor:C.line,padding:17,marginTop:24}}>
     <Text style={{color:C.muted,fontSize:12,fontWeight:'800'}}>PROVISIONAL DAILY TARGET</Text>
     {result.targetCalories===null?<Text style={{color:'#FFD29A',fontWeight:'800',marginTop:12}}>Targets withheld pending professional review.</Text>:<>
      <Text style={{color:C.accent,fontSize:36,fontWeight:'900',marginTop:8}}>{result.targetCalories} kcal</Text>
      <Text style={{color:C.text,marginTop:14}}>Protein · {result.macros?.proteinG}g</Text>
      <Text style={{color:C.text,marginTop:7}}>Carbohydrates · {result.macros?.carbsG}g</Text>
      <Text style={{color:C.text,marginTop:7}}>Fat · {result.macros?.fatG}g</Text>
     </>}
    </View>
    <TouchableOpacity onPress={()=>{setProfile(null);setResult(null)}} style={{padding:15,borderRadius:12,borderWidth:1,borderColor:C.line,marginTop:18,alignItems:'center'}}><Text style={{color:C.text,fontWeight:'800'}}>Edit assessment</Text></TouchableOpacity>
    <Text style={{color:C.muted,fontSize:11,lineHeight:18,marginTop:18}}>Prototype note: this profile is held in app memory only and resets on reload. Persistent storage, authentication and HealthKit permissions are not yet connected.</Text>
   </ScrollView>}
 </SafeAreaView>;
}