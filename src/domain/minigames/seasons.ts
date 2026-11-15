/** Danish seasonal knowledge questions. Correct answers intentionally vary in position. */
export const seasonQuestions=[
  {question:'Hvilken årstid begynder mange pindsvin at gå i hi?',answers:['Sommer','Efterår','Forår','Vinter'],correct:1},
  {question:'Hvornår er dagene normalt længst i Danmark?',answers:['Vinter','Efterår','Forår','Sommer'],correct:3},
  {question:'Hvornår ses de første anemoner typisk i skovbunden?',answers:['Forår','Efterår','Vinter','Sommer'],correct:0},
  {question:'Hvilken årstid ligger vintersolhverv i?',answers:['Efterår','Sommer','Vinter','Forår'],correct:2},
  {question:'Hvornår modner mange danske æbler?',answers:['Vinter','Efterår','Forår','Sommer'],correct:1},
  {question:'Hvilken årstid er den traditionelle højsæson for danske jordbær?',answers:['Forår','Vinter','Efterår','Sommer'],correct:3},
  {question:'Hvornår skifter mange løvtræer farve og taber deres blade?',answers:['Efterår','Sommer','Forår','Vinter'],correct:0},
  {question:'Hvornår ses oftest frost og is på danske søer?',answers:['Forår','Efterår','Vinter','Sommer'],correct:2},
  {question:'Hvornår vender mange trækfugle tilbage til Danmark?',answers:['Vinter','Forår','Efterår','Sommer'],correct:1},
  {question:'Hvornår er solen højest på himlen ved middagstid?',answers:['Efterår','Vinter','Forår','Sommer'],correct:3},
  {question:'Hvilken årstid indledes omkring martsjævndøgn?',answers:['Forår','Sommer','Efterår','Vinter'],correct:0},
  {question:'Hvornår er nætterne længst i Danmark?',answers:['Sommer','Forår','Vinter','Efterår'],correct:2},
] as const;
export function seasonQuestion(round:number){return seasonQuestions[Math.abs(Math.trunc(round))%seasonQuestions.length];}
