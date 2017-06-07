class Train{
  PImage pic;
  float x;
  int xDraw;
  float startX=mapSize;
  float endX=mapSize-500;
  
  
  
  float prc=0;        //percentage of the way done with the animation
  float speed=0.005;   //how fast this percentage moves
  
  boolean comingIn=false;
//  boolean leaving=false;
//  boolean waiting=false;
  
  int waitTimer=0;
  int waitTime=100;
  
  Train(){
    pic=loadImage("pic/train.png");

    xDraw=0;
  }
  
  void update(){
    float val=(float)java.lang.Math.pow(prc,0.3);
    
    //set x to be the apropriate amount between the start and end points
    x=(1-val)*startX+val*endX;
    
    //if it is activated, move it
    //arriving
    if (comingIn){
      prc+=speed;
      if (prc>=1){
        prc=1;
        comingIn=false;
        //waiting=true;
        spawnBrother();
      }
    }
    
    draw();
  }
  
  void draw(){
    image(pic,xDraw+x,groundHeight-pic.height);
  }
  
  void start(){
    comingIn=true;
    prc=(time-timeLimit)*speed;
  }
  
  
  
}
