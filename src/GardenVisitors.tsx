import React from "react";
import Animated, {useSharedValue,useAnimatedStyle,withRepeat,withTiming,withSequence,cancelAnimation} from "react-native-reanimated";
import Svg,{Circle,Ellipse,Path} from "react-native-svg";

export function GardenVisitors({kind,active,size}:{kind:"birdhouse"|"teaTable";active:boolean;size:number}) {
 const progress=useSharedValue(0);
 React.useEffect(()=>{
  if(active) progress.value=withRepeat(withSequence(withTiming(1,{duration:4600}),withTiming(0,{duration:4900})),-1,false);
  else {cancelAnimation(progress);progress.value=0;}
  return ()=>cancelAnimation(progress);
 },[active,progress]);
 const motion=useAnimatedStyle(()=>({opacity:active?0.55+progress.value*0.4:0.7,
  transform:[{translateY:-progress.value*7}]}));
 return <Animated.View testID={"garden-visitor-"+kind} pointerEvents="none"
  style={[{position:"absolute",top:kind==="birdhouse"?"14%":"2%",right:kind==="birdhouse"?"5%":"36%",width:size*0.37,height:size*0.35},motion]}>
  <Svg viewBox="0 0 100 100" width="100%" height="100%">
   {kind==="birdhouse"?<>
    <Ellipse cx="43" cy="56" rx="30" ry="20" fill="#93b1a2"/>
    <Ellipse cx="36" cy="58" rx="15" ry="11" fill="#698f81"/>
    <Circle cx="71" cy="44" r="14" fill="#a0bbab"/>
    <Circle cx="75" cy="40" r="3" fill="#354d44"/>
    <Path d="M83 45L99 51 83 56Z" fill="#dcb174"/>
    <Path d="M18 54L4 39 9 70 30 67" fill="#74968a"/>
   </>:<>
    <Path d="M22 96Q8 71 25 52T25 5M54 96Q38 69 56 50T55 7M82 94Q68 71 81 52T83 11" stroke="#fff9ed" strokeWidth="6" strokeLinecap="round" fill="none"/>
   </>}
  </Svg>
 </Animated.View>;
}
