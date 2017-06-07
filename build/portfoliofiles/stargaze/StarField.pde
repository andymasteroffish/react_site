class StarField{
 float[] x;
 float[] y;
 
 boolean grass;
 
 //fill up the arrays with stars
 StarField(){
   grass=false;
   x=new float[350];
   y=new float[350];
   for (int i=0; i<x.length; i++){
     x[i]=random(0,mapSize*0.7);
     y[i]=random(0,height);
   }
 }
 
 //alternate to have it be grass
 StarField(boolean turnGrassOn){
   grass=true;
   x=new float[350];
   y=new float[350];
   for (int i=0; i<x.length; i++){
     x[i]=random(0,mapSize*1.2);
     y[i]=random(groundHeight,height);
   }
 }
 
 void draw(){
   stroke(255);
   if (grass)  stroke(0);
   for (int i=0; i<x.length; i++)
     point(x[i],y[i]);
 }
 
 void scroll(float num){
   for (int i=0; i<x.length; i++)
     x[i]+=num;
 }
   
  
  
}
