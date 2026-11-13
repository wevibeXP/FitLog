import React,{useState} from 'react';
import {SafeAreaView,StatusBar,Text,View,TouchableOpacity,ScrollView} from 'react-native';
import Onboarding from './Onboarding';
import {AssessmentInput,assess} from './assessment';

const C={
 bg:'#FFF9F4',panel:'#FFFFFF',text:'#393340',muted:'#897F8D',
 accent:'#9A83D4',line:'#EAE1EB',mint:'#E2F1E8',peach:'#FBE8DF'
};

export default function App(){
 const [profile,setProfile]=useState<AssessmentInput|null>(null);
 const [result,setResult]=useState<ReturnType<typeof assess>|null>(null);
 return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
  <StatusBar barStyle="dark-content"/>
  {!profile||!result?<Onboarding onComplete={(p,r)=>{setProfile(p);setResult(r)}}/>:
   <ScrollView contentContainerStyle={{padding:24,paddingBottom:44}}>
    <View style={{alignSelf:'flex-start',backgroundColor:C.mint,paddingHorizontal:13,paddingVertical:8,borderRadius:30}}>
     <Text style={{color:'#547A66',fontWeight:'800',letterSpacing:2,fontSize:10}}>FITLOG  ·  YOUR BASELINE</Text>
    </View>
    <Text style={{color:C.text,fontSize:32,fontWeight:'900',letterSpacing:0.2,marginTop:22}}>Look at you, getting started ✨</Text>
    <Text style={{color:C.muted,lineHeight:23,letterSpacing:0.1,marginTop:9}}>Your first Fitlog assessment is ready. This is a starting point we can refine as you log meals, movement and recovery.</Text>
    <View style={{backgroundColor:C.panel,borderRadius:25,borderWidth:1,borderColor:C.line,padding:21,marginTop:25,shadowColor:'#7D688D',shadowOpacity:0.07,shadowRadius:16,shadowOffset:{width:0,height:7},elevation:2}}>
     <Text style={{color:C.muted,fontSize:11,fontWeight:'800',letterSpacing:1.8}}>YOUR DAILY STARTING POINT</Text>
     {result.targetCalories===null?<View style={{backgroundColor:C.peach,borderRadius:16,padding:15,marginTop:16}}>
       <Text style={{color:'#8D5B48',fontWeight:'800',lineHeight:21}}>Your calorie and macro targets are on pause while you get the right professional guidance.</Text>
      </View>:<>
      <Text style={{color:C.accent,fontSize:42,fontWeight:'900',letterSpacing:-1,marginTop:10}}>{result.targetCalories} <Text style={{fontSize:16,fontWeight:'700',letterSpacing:0}}>kcal / day</Text></Text>
      <View style={{height:1,backgroundColor:C.line,marginVertical:17}}/>
      <View style={{flexDirection:'row',gap:8}}>
       <View style={{flex:1,backgroundColor:'#F0EAFB',borderRadius:16,padding:12}}>
        <Text style={{color:'#7864AC',fontSize:10,fontWeight:'800',letterSpacing:1}}>PROTEIN</Text>
        <Text style={{color:C.text,fontWeight:'900',fontSize:20,marginTop:5}}>{result.macros?.proteinG}g</Text>
       </View>
       <View style={{flex:1,backgroundColor:C.mint,borderRadius:16,padding:12}}>
        <Text style={{color:'#547A66',fontSize:10,fontWeight:'800',letterSpacing:1}}>CARBS</Text>
        <Text style={{color:C.text,fontWeight:'900',fontSize:20,marginTop:5}}>{result.macros?.carbsG}g</Text>
       </View>
       <View style={{flex:1,backgroundColor:C.peach,borderRadius:16,padding:12}}>
        <Text style={{color:'#9C6955',fontSize:10,fontWeight:'800',letterSpacing:1}}>FAT</Text>
        <Text style={{color:C.text,fontWeight:'900',fontSize:20,marginTop:5}}>{result.macros?.fatG}g</Text>
       </View>
      </View>
     </>}
    </View>
    <TouchableOpacity onPress={()=>{setProfile(null);setResult(null)}} style={{padding:17,borderRadius:18,backgroundColor:C.accent,marginTop:19,alignItems:'center',shadowColor:C.accent,shadowOpacity:0.2,shadowRadius:10,shadowOffset:{width:0,height:5},elevation:2}}>
     <Text style={{color:'#FFFFFF',fontWeight:'900',letterSpacing:1}}>EDIT MY ASSESSMENT</Text>
    </TouchableOpacity>
    <Text style={{color:C.muted,fontSize:11,lineHeight:18,marginTop:20,letterSpacing:0.1}}>Little prototype note: this profile is currently held in app memory and resets when the app reloads. Saving, accounts and Apple Health are coming in later milestones.</Text>
   </ScrollView>}
 </SafeAreaView>;
}