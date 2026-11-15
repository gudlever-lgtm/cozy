import React, {useMemo, useRef, useState} from 'react';
import {Animated, Easing, Image, PanResponder, StyleSheet, Text, View} from 'react-native';
import type {Card} from '../../src/domain/solitaire/klondike';
import type {CardBackStyle,CardStyle} from './nativeSettings';

const ranks:Record<number,string>={1:'A',11:'J',12:'Q',13:'K'};
const suit:Record<string,string>={C:'♣',D:'♦',H:'♥',S:'♠'};
const premiumBack=require('../assets/illustrations/card-back-premium.webp');
const premiumFace=require('../assets/illustrations/card-face-premium.webp');
const backs={floral:premiumBack,autumn:require('../assets/illustrations/garden-autumn.webp'),winter:require('../assets/illustrations/garden-winter.webp')};
export function CardBack({width,height,cardStyle='illustrated',back='floral'}:{width:number;height:number;cardStyle?:CardStyle;back?:CardBackStyle}){
  return cardStyle==='classic'?<View style={[styles.classicBack,{width,height}]}/>:
    <View style={[styles.backFrame,{width,height}]}><Image source={backs[back]} resizeMode={back==='floral'?'stretch':'cover'} style={{width:'100%',height:'100%'}}/></View>;
}

export function CardFace({card,width,height,cardStyle='illustrated'}:{card:Card;width:number;height:number;cardStyle?:CardStyle}){
  const red=card.suit==='D'||card.suit==='H';
  const color=red?'#c6384b':'#194557';
  const cornerSize=Math.min(13,Math.max(10,width*0.19));
  const centerSize=Math.min(23,Math.max(15,width*0.34));
  return <View style={[styles.face,{width,height},cardStyle==='classic'&&styles.classicFace]}>
    {cardStyle==='illustrated'&&<Image source={premiumFace} resizeMode="stretch" style={{width,height}}/>}
    <Text style={[styles.corner,{color,fontSize:cornerSize,lineHeight:cornerSize+2}]}>{ranks[card.rank]??card.rank}{suit[card.suit]}</Text>
    <Text style={[styles.centerSuit,{color,fontSize:centerSize,lineHeight:centerSize+3}]}>{suit[card.suit]}</Text>
    <Text style={[styles.bottomCorner,{color,fontSize:cornerSize,lineHeight:cornerSize+2}]}>{ranks[card.rank]??card.rank}</Text>
  </View>;
}

type Props={card:Card;width:number;height:number;cardStyle?:CardStyle;back?:CardBackStyle;onTap:()=>void;onDoubleTap?:()=>void;onLongHold?:()=>void;onDrop?:(x:number,y:number)=>void;onDragChange?:(active:boolean)=>void;onDragMove?:(dx:number,dy:number)=>void;floating?:boolean;run?:Card[]};

export function DraggableCard({card,width,height,cardStyle='illustrated',back='floral',onTap,onDoubleTap,onLongHold,onDrop,onDragChange,onDragMove,floating=false,run=[]}:Props){
  const [shift,setShift]=useState({x:0,y:0});
  const callbacks=useRef({onTap,onDoubleTap,onLongHold,onDrop,onDragChange,onDragMove});
  callbacks.current={onTap,onDoubleTap,onLongHold,onDrop,onDragChange,onDragMove};
  const lastTap=useRef(0);
  const tapTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const dragging=useRef(false);
  const longHoldTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const longHeld=useRef(false);
  function clearLongHold(){if(longHoldTimer.current){clearTimeout(longHoldTimer.current);longHoldTimer.current=null;}}
  const enabled=card.up;
  const previousUp=useRef(card.up);
  const revealScale=useRef(new Animated.Value(1)).current;
  const revealGlow=useRef(new Animated.Value(0)).current;
  React.useEffect(()=>{
    const newlyRevealed=!previousUp.current&&card.up;
    previousUp.current=card.up;
    if(!newlyRevealed)return;
    revealScale.setValue(0.2);revealGlow.setValue(1);
    const animation=Animated.parallel([
      Animated.timing(revealScale,{toValue:1,duration:360,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
      Animated.timing(revealGlow,{toValue:0,duration:650,easing:Easing.out(Easing.quad),useNativeDriver:true}),
    ]);
    animation.start();
    return ()=>animation.stop();
  },[card.up,revealScale,revealGlow]);
  React.useEffect(()=>()=>{if(tapTimer.current)clearTimeout(tapTimer.current);clearLongHold();},[]);
  const gesture=useMemo(()=>PanResponder.create({
    onStartShouldSetPanResponder:()=>true,
    onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>5||Math.abs(g.dy)>5,
    onPanResponderGrant:()=>{
      longHeld.current=false;
      clearLongHold();
      if(callbacks.current.onLongHold)longHoldTimer.current=setTimeout(()=>{
        longHoldTimer.current=null;
        longHeld.current=true;
        callbacks.current.onLongHold?.();
      },1100);
    },
    onPanResponderMove:(_,g)=>{
      if(Math.abs(g.dx)>5||Math.abs(g.dy)>5)clearLongHold();
      if(enabled&&callbacks.current.onDrop){
      if(longHeld.current)return;
      if(!dragging.current){dragging.current=true;callbacks.current.onDragChange?.(true);}
      callbacks.current.onDragMove?.(g.dx,g.dy);
      setShift({x:g.dx,y:g.dy});
      }
    },
    onPanResponderRelease:(_,g)=>{
      clearLongHold();
      setShift({x:0,y:0});
      const wasDragging=dragging.current;
      if(wasDragging){dragging.current=false;callbacks.current.onDragChange?.(false);}
      if(longHeld.current){longHeld.current=false;return;}
      if(!wasDragging&&Math.abs(g.dx)<9&&Math.abs(g.dy)<9){
        const now=Date.now();
        if(now-lastTap.current<320&&callbacks.current.onDoubleTap){
          if(tapTimer.current)clearTimeout(tapTimer.current);
          tapTimer.current=null;lastTap.current=0;callbacks.current.onDoubleTap();
        }else{
          lastTap.current=now;
          if(tapTimer.current)clearTimeout(tapTimer.current);
          tapTimer.current=setTimeout(()=>{callbacks.current.onTap();tapTimer.current=null;},260);
        }
      }else if(enabled)callbacks.current.onDrop?.(g.moveX,g.moveY);
    },
    onPanResponderTerminate:()=>{clearLongHold();longHeld.current=false;setShift({x:0,y:0});dragging.current=false;callbacks.current.onDragChange?.(false);},
  }),[enabled]);
  return <View {...gesture.panHandlers} accessible accessibilityRole="button"
    accessibilityLabel={enabled?`${ranks[card.rank]??card.rank} ${suit[card.suit]}`:'Skjult kort'}
    style={{width,height,opacity:floating?0:1,transform:[{translateX:floating?0:shift.x},{translateY:floating?0:shift.y}],zIndex:shift.x||shift.y?100:0,elevation:shift.x||shift.y?14:0}}>
    <Animated.View style={{width,height,transform:[{scaleX:revealScale}]}}>
      {card.up?<CardFace card={card} width={width} height={height} cardStyle={cardStyle}/>:<CardBack width={width} height={height} cardStyle={cardStyle} back={back}/>}
      {card.up&&<Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill,{borderWidth:3,borderRadius:8,borderColor:'#ffe8a0',opacity:revealGlow}]}/>}
    </Animated.View>
    {(shift.x!==0||shift.y!==0)&&run.slice(1).map((next,i)=><View key={next.id} pointerEvents="none" style={{position:'absolute',top:(i+1)*27,left:0,width,height}}>
      <CardFace card={next} width={width} height={height} cardStyle={cardStyle}/>
    </View>)}
  </View>;
}

const styles=StyleSheet.create({
  face:{borderRadius:7,backgroundColor:'#fff9ed',overflow:'hidden',shadowColor:'#182d30',shadowOpacity:0.22,shadowRadius:2,elevation:2},
  classicFace:{backgroundColor:'#fffdf5',borderWidth:1.5,borderColor:'#d6c3a5'},
  classicBack:{backgroundColor:'#31688b',borderRadius:7,borderWidth:4,borderColor:'#fffaf0'},
  backFrame:{borderRadius:7,overflow:'hidden',borderWidth:2,borderColor:'#e5ba71',backgroundColor:'#285666'},
  corner:{position:'absolute',left:5,top:4,fontWeight:'900',includeFontPadding:false},
  centerSuit:{position:'absolute',alignSelf:'center',top:'40%',fontWeight:'800',includeFontPadding:false,textShadowColor:'#f3d29b',textShadowOffset:{width:0,height:1},textShadowRadius:1},
  bottomCorner:{position:'absolute',right:5,bottom:4,fontWeight:'900',includeFontPadding:false,transform:[{rotate:'180deg'}]},
});
