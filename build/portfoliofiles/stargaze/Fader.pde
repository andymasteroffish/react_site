class Fader{
  int a;  //alpha
  
  boolean fadeOut;
  boolean fadeIn;
  
  boolean done;
  
  float speed=3;
  
  Fader(){
    a=0;  //start with no alpha
    fadeOut=false;
    fadeIn=false;
    done=true;
  }
  
  void update(){
    
    //is the screen fading out?
    if (fadeOut){
      a+=speed;
      if(a>=500){
        a=255;
        fadeOut=false;
        fadeIn=true;
        done=true;
        pause=false;
      }
    }
    
    //is it fading back in
    if (fadeIn){
      a-=speed;
      if(a<=0){
        a=0;
        fadeIn=false;
     
      }
    }
    
    //draw the damn thing
    draw();
    
   //if it is fading out, keep the constellations on top
   if (fadeOut || fadeIn)
      for (int i=0; i<sky.length; i++)  sky[i].update();
  }
  
  void draw(){
    noStroke();
    fill(0,a);
    rect(0,0,width,height); 
  }
   
  void start(){
    fadeOut=true; 
    done=false;
  }
  
}
