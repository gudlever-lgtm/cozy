import React, {useRef} from 'react';
import {Animated,Image,PanResponder,Pressable,View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';

export function DraggableDecoration({image,name,selected,zoom,onTap,onDrop}:{
  image:ImageSourcePropType;name:string;selected:boolean;zoom:number;
  onTap:()=>void;onDrop:(dx:number,dy:number)=>void;
}){
  const translate=useRef(new Animated.ValueXY()).current;
  const callbacks=useRef({zoom,onDrop});
  callbacks.current={zoom,onDrop};
  const responder=useRef(PanResponder.create({
    onMoveShouldSetPanResponder:(_,gesture)=>Math.abs(gesture.dx)>6||Math.abs(gesture.dy)>6,
    onPanResponderTerminationRequest:()=>false,
    onPanResponderMove:(_,gesture)=>translate.setValue({x:gesture.dx/callbacks.current.zoom,y:gesture.dy/callbacks.current.zoom}),
    onPanResponderRelease:(_,gesture)=>{
      callbacks.current.onDrop(gesture.dx,gesture.dy);
      translate.setValue({x:0,y:0});
    },
    onPanResponderTerminate:()=>translate.setValue({x:0,y:0}),
  })).current;
  return <Animated.View {...responder.panHandlers} style={{transform:translate.getTranslateTransform(),
    borderWidth:selected?3:0,borderColor:'#ffe778',borderRadius:12,zIndex:selected?10:1}}>
    <Pressable onPress={onTap} accessibilityRole="button" accessibilityLabel={`Træk ${name} med fingeren for at flytte`}>
      <Image source={image} resizeMode="contain" style={{width:84,height:84}}/>
    </Pressable>
  </Animated.View>;
}
