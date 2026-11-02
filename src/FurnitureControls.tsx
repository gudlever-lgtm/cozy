import React from "react";
import { Pressable, Text, View } from "react-native";
import { furnitureLevel, furnitureUpgradeCost, type UpgradeId } from "./engine/world";
import type { Save } from "./engine/save";

/** Reusable native furniture controls. Caller must persist updates through existing app save queue. */
export function FurnitureControls({ save, id, onMove, onUpgrade, language="da" }: {
  save: Save; id: UpgradeId; onMove: (id: UpgradeId, dx: number, dy: number) => void;
  onUpgrade: (id: UpgradeId) => void; language?: "da"|"en";
}) {
  const level=furnitureLevel(save.economy,id);
  if (!level || id==="cards") return null;
  const cost=level < 3 ? furnitureUpgradeCost(id,level+1) : null;
  const affordable=!!cost && save.economy.wallet.glimmers >= -(cost.glimmers??0) && save.economy.wallet.wood >= -(cost.wood??0);
  const move=(sx:number,sy:number)=>onMove(id,sx,sy);
  const action=(label:string, onPress:()=>void,disabled=false)=>(
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
      onPress={onPress} style={{paddingVertical:7,paddingHorizontal:11,borderRadius:14,borderWidth:1,
      borderColor:"#c5ab82",backgroundColor:disabled?"#e5e2d9":"#fff8e9",minHeight:40,justifyContent:"center"}}>
      <Text style={{color:"#315744",fontWeight:"600",fontSize:13}}>{label}</Text>
    </Pressable>
  );
  return <View testID={`furniture-controls-${id}`} style={{gap:8}}>
    <Text style={{color:"#315744"}}>{language==="da"?"Niveau":"Level"} {level}/3</Text>
    <View style={{flexDirection:"row",flexWrap:"wrap",gap:5}}>
      {action("←",()=>move(-5,0))}
      {action("→",()=>move(5,0))}
      {action("↑",()=>move(0,-5))}
      {action("↓",()=>move(0,5))}
    </View>
    {level<3 && action((language==="da"?"Opgrader":"Upgrade")+" · "+String(-(cost?.glimmers??0))+" ✨",()=>{
      onUpgrade(id);
    },!affordable)}
  </View>;
}
