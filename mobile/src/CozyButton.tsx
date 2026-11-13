import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

const premiumButton=require('../assets/illustrations/button-premium.webp');

export function CozyButton({label,onPress,wide=false,secondary=false}:{
  label:string;onPress:()=>void;wide?:boolean;secondary?:boolean;
}){
  const w=wide?212:104;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({pressed})=>[styles.button,{width:w,transform:[{scale:pressed?0.96:1}]}]}>
    {secondary?<View style={styles.secondary}><View style={styles.secondaryInset}/></View>
      :<Image source={premiumButton} resizeMode="stretch" style={styles.background}/>}
    <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.label,secondary?styles.secondaryLabel:styles.primaryLabel]}>{label}</Text>
  </Pressable>;
}

const styles=StyleSheet.create({
  button:{height:48,justifyContent:'center',alignItems:'center'},
  background:{width:'100%',height:'100%'},
  secondary:{position:'absolute',top:3,bottom:3,left:2,right:2,borderRadius:18,borderWidth:3,borderColor:'#d3a24b',backgroundColor:'#fff3d5',shadowColor:'#423119',shadowOpacity:0.3,shadowRadius:3,elevation:3},
  secondaryInset:{position:'absolute',top:2,bottom:2,left:2,right:2,borderRadius:13,borderWidth:1,borderColor:'#fffef2',backgroundColor:'#ffe4b2'},
  label:{position:'absolute',left:6,right:6,textAlign:'center',fontSize:13,fontWeight:'900',textShadowOffset:{width:0,height:1},textShadowRadius:1},
  primaryLabel:{color:'#fff9e7',textShadowColor:'#17354b'},
  secondaryLabel:{color:'#654326',textShadowColor:'#fffaf0'},
});
