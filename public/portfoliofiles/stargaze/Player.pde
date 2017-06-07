class Player{
  PImage head;
  PImage body;

  float xPos;    //actual lcoaiton on map
  float xDraw;   //where on screen its being drawn
  float speed;
  
  boolean gazing;
 
  Player(){
    head=loadImage("pic/player_head.png");
    body=loadImage("pic/player_body.png");
   xPos=0;
   xDraw=0;
   speed=4;
   gazing=false;
  }
 
  void update(){
    
   
     //draw the damn thing
     draw();
  }
 
  void draw(){
    pushMatrix();
    float headX=xDraw+6;
    if (gazing) headX=xDraw+4;
    translate(headX,groundHeight-body.height-8);
    if (gazing)  rotate(-PI/3.0);
    image(head,-head.width/2,-head.height/2);
    popMatrix();
    
    //and put the body
    image(body,xDraw,groundHeight-body.height);
    
//    if(gazing)  image(picGaze,xDraw,groundHeight-picGaze.height);
//    else        image(pic,xDraw,groundHeight-pic.height);
   
  } 
  
  void move(int dir){
    xPos+=speed*dir;
    xDraw+=speed*dir;
    
    //make sure the player didn't go off the board
    if (xPos>mapSize-200)  move(-1);
    if (xPos<0)        move(1);
  }
  
  
}
