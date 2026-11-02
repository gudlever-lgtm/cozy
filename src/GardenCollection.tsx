import React from "react";
import { ScrollView, Text, View } from "react-native";
import { upgrades, furnitureLevel } from "./engine/world";
import type { Save } from "./engine/save";
import { DecorationArtwork } from "./GardenDecorations";
import type { DecorationId } from "./assets/decorations";

export function GardenCollection({save, language}: {save: Save; language: "da"|"en"}) {
  const da=language==="da";
  const items=upgrades.filter(item=>item.id!=="cards");
  const count=items.filter(item=>save.economy.inventory.includes(item.id)).length;
  const names: Record<string,[string,string]>={
    flowers:["Blomsterbed","Flower bed"],bench:["Havebænk","Garden bench"],
    bridge:["Havebro","Garden bridge"],lantern:["Lanterne","Lantern"],
    forest:["Træer","Trees"],birdhouse:["Fuglehus","Birdhouse"],teaTable:["Tebord","Tea table"]
  };
  return <View style={{flex:1,minHeight:0,padding:12,gap:8}} testID="garden-collection">
    <Text accessibilityRole="header" style={{fontSize:22,fontWeight:"700",color:"#315744"}}>
      {da?"Havens samlealbum":"Garden collection"}
    </Text>
    <Text style={{fontSize:14,color:"#536c57"}}>{count}/{items.length} {da?"dekorationer samlet":"decorations collected"}</Text>
    <ScrollView contentContainerStyle={{flexDirection:"row",flexWrap:"wrap",gap:10,paddingBottom:25}}>
      {items.map(item=>{
        const owned=save.economy.inventory.includes(item.id);
        const level=furnitureLevel(save.economy,item.id);
        const source=item.id==="birdhouse"
          ? da?"Vind efter 3 Hidden Treasures":"Earn after 3 Hidden Treasures"
          :item.id==="teaTable"
          ? da?"Vind efter 3 Tea Time":"Earn after 3 Tea Time"
          :da?"Køb med optjente ressourcer":"Buy with earned resources";
        return <View key={item.id} testID={"collection-"+item.id}
          style={{width:"47%",minWidth:150,minHeight:138,borderRadius:18,padding:11,
            borderWidth:1,borderColor:owned?"#d4ba8c":"#d7d9d1",
            backgroundColor:owned?"#fff8e9":"#edece7",gap:5}}>
          <View style={{alignItems:"center",opacity:owned?1:.45}}>
            <DecorationArtwork id={item.id as DecorationId} size={52}/>
          </View>
          <Text style={{textAlign:"center",fontWeight:"700",color:"#315744"}}>
            {names[item.id]?.[da?0:1]??item.id}
          </Text>
          <Text style={{textAlign:"center",color:"#566b59",fontSize:12}}>
            {owned
              ? (da?"Samlet · Niveau ":"Collected · Level ")+level+"/3"
              : source}
          </Text>
          {!owned && <Text style={{textAlign:"center",fontSize:11,color:"#63735e"}}>
            {item.cost} ✨ · {item.wood} {da?"træ":"wood"}
          </Text>}
        </View>;
      })}
    </ScrollView>
  </View>;
}
