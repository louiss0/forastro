

const allTailwindColors = [
  "slate", 
  "zinc", 
  "fuschia" , 
  "red", 
  "black" , 
  "blue" , 
  "sky" , 
  "orange" , 
  "green" , 
  "teal", 
  "indigo", 
  "purple" , 
  "amber" , 
  "gray" , 
  "yellow" , 
  "neutral", 
  "pink", 
  "rose"
] as const  

const allowedTailwindScreenWidths = ["sm", "md","lg", "xl", "2xl"] as const

export {allTailwindColors, allowedTailwindScreenWidths}