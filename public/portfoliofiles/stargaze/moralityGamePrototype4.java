import processing.core.*; 
import processing.xml.*; 

import java.applet.*; 
import java.awt.Dimension; 
import java.awt.Frame; 
import java.awt.event.MouseEvent; 
import java.awt.event.KeyEvent; 
import java.awt.event.FocusEvent; 
import java.awt.Image; 
import java.io.*; 
import java.net.*; 
import java.text.*; 
import java.util.*; 
import java.util.zip.*; 
import java.util.regex.*; 

public class moralityGamePrototype4 extends PApplet {

//scrolling time game

Player player;

//game states
boolean pause=true;
boolean gameStart=false;  //player must click in the game to actualy start
boolean gameOver=false;

//keys
boolean leftIsDown;
boolean rightIsDown;
boolean upIsDown;
boolean downIsDown;

//background
int groundHeight=450;
Constellation[] sky;
Decoration[] decorations;
StarField starField;
StarField grass;

//scrolling
int mapSize=8000;  //how big the game board is
//min and max scroll are dependant on the size, so they will be set in setup
int minScroll;  //anything left of this point will prompt the game to scroll
int maxScroll;  //anythign right of this point will prompt the game to scroll

//star gazing
int gazeTimer=0;
boolean gazing=false;
int starNum=0;    //which constilation should be shown next
int[] imgNum=new int[8];

//timing
int timeLimit=3300;
int time=0;
int relativeTime;    //time in game minutes
boolean trainArrived=false;
Train train;


//viewing the time
boolean showTime=false;
int watchTimer=0;

//messgaing
boolean showingMessage=false;
int messageTimer=0;
int messageCharLength=1;  //how long to show each char
String message;


//timing info in the game
int gazeReminderTime=200;      //when to display this message

//end game convo
boolean brotherTalk=false;
boolean brotherIsHere=false;
int brotherArriveTime;    //when the brother actually got off the train


//fadign the screen out
Fader fader;


public void setup(){
  frameRate(60);
  size(800,600);
  player=new Player();
  
  fader=new Fader();
  train= new Train();
  
  sky=new Constellation[0];
  starField=new StarField();
  grass=new StarField(true);
  
  decorations=new Decoration[0];
  
  //fill up the order for the constelations randommly
  int[] basicNum=new int[8];
  for (int i=0; i<8; i++)  basicNum[i]=i;
  //pull numbers from basicNum and put them in the order array
  for (int i=0; i<8; i++){
    int pos=(int)random(0,basicNum.length);
    imgNum[i]=basicNum[pos];
    
    //remove that item from basicNum
    int[] left=new int[basicNum.length];    //array to hold the left side
    int[] right=new int[basicNum.length];  //array to hold right side
    
    left=subset(basicNum,0,pos);  //take everything to the left of k
    right=subset(basicNum,pos+1);  //take everything to the right of k
    basicNum= (concat(left, right));  //combine left and right and return it
  }
  
  //scrolling values
  minScroll=width/2-50;
  maxScroll=width/2+50;
  
   //put the brother in, but he won't be shown yet
   //brother will always be the first decoration
   Decoration brother=new Decoration(mapSize-300, "pic/brother.png");
   decorations=(Decoration[])append(decorations,brother);
   
   //add a bench by the train station
   decorations=(Decoration[])append(decorations, new Decoration(mapSize-450, "pic/bench.png"));
   decorations=(Decoration[])append(decorations, new Decoration(mapSize-500, "pic/ground.png"));
   
   startMessage("\n\n              Click here to start.");
  
  
}

public void draw(){
  background(0);
 
  
  if(!pause){
     //check the buttons
     if (upIsDown) {
       player.gazing=true;
       gazeTimer++;
     }
     else{
       player.gazing=false;
       gazeTimer=0;
     }
     if (leftIsDown && !upIsDown && !downIsDown)    player.move(-1);
     if (rightIsDown && !upIsDown && !downIsDown)   player.move(1);
     
     //has the player been gazing long enough to do the daydream action?
     if (gazeTimer==60 && !gameOver)  startGaze();
     
     //if the player was gazing, and the screen faded out, finish it when it fades back in
     if (gazing && fader.done)
       endGaze();
       
     
     //advance the timer
     time++;
     
     //calculate the game time
     relativeTime=(int)map(time,0,timeLimit,0,60);
     println(relativeTime);
     
     //if the player is on the side of the screen, scroll
     checkScroll();

    //present the story on frame 1
    if (time==1)     
       startMessage("\nYour younger brother is arriving fromout of town on a very late train. \n\nHis train gets in at 2:00 am.");
     //is it time to tell the player about gazing?
     if (time==gazeReminderTime)
       startMessage("It's such a clear night.\nIt would be perfect for star gazing.\n\nHold up to gaze at the sky and, the\nconstellations will show themselves, but you will lose track of time.");
     
     
     //have the brother say somehting at the end
     if (player.xPos>mapSize-450 && brotherIsHere && !brotherTalk){
       //if they were on time
       if (relativeTime<63){
         startMessage("\n\nThanks for picking me up!\nLet's go home.");
       }
       else if (relativeTime<70){
         startMessage("\n\n\nI wasn't waiting too long.");
       }
       else{
         startMessage("\nThank god you're here!\n\nIt's cold and I was scared.\nI couldn't feel my toes.");
       }
       brotherTalk=true;
     }
     
     //if the time is up, make the train arrive
     if(time==timeLimit)  train.start();
     
     
     
  }
  
   drawScene();
   
   //draw the timer if the player is looking at the watch
   if (showTime)
     drawTime();
   
   
   //show the message if there is one right now
   if(showingMessage && pause)  drawMessage();
   
   //if the game is over, fade out
   if (gameOver){
     fader.a+=1;
     fader.draw();    //make sure the fader is on top
     if (fader.a==400)
       link("http://andymakes.com/extras/choochoo/gameform2.php", "_this");
   }
   
   //show title
   if (!gameStart){
       textSize(40);
       fill(240,240,240);
       text("star gaze",width/2-95,150);
     }
     
}


public void keyPressed(){
  if (gameStart){
    if (keyCode==37)  leftIsDown=true;
    if (keyCode==39)  rightIsDown=true;
    if (keyCode==38)  upIsDown=true;
    if (keyCode==40)  downIsDown=true;
    
    //down looks at the time
    if (keyCode==40 && !showTime && !pause && !showingMessage){
      showTime=true;
      watchTimer=0;
    }
      
    
    //space ends messages (but let enter work too)
    if((keyCode==32 || keyCode==10)&& showingMessage){
      //if the message is done, clear it
      if(messageTimer>=message.length()*messageCharLength){
        showingMessage=false;
        pause=false;
        //if this was the convo with the brother, the game is over
        if (brotherTalk)  endGame();
      }
      //otherwise, finish the message
      else{
        messageTimer=message.length()*messageCharLength;
      }
    }
    
    //p pauses
    if (keyCode==80){
      if(!pause){
        pause=true;
        startMessage("\n\n                       PAUSE");
        messageTimer=message.length()*messageCharLength;
      }else{
        pause=false;
        showingMessage=false;
      }
    }
  }
}

public void keyReleased(){
  if (keyCode==37)  leftIsDown=false;
  if (keyCode==39)  rightIsDown=false;
  if (keyCode==38)  upIsDown=false;
  if (keyCode==40)  downIsDown=false;
  
}

//user must click in frame to start the game
public void mousePressed(){
  if (!gameStart){
    gameStart=true;
    startMessage("Use arrow keys to\nmove or look up.\n\nHold down to check watch.\n\nAnd P to  pause the game.");
  }
  
  //clicking mouse can also advance text
   else{
    //if the message is done, clear it
    if(messageTimer>=message.length()*messageCharLength){
      showingMessage=false;
      pause=false;
      //if this was the convo with the brother, the game is over
      if (brotherTalk)  endGame();
    }
    //otherwise, finish the message
    else{
      messageTimer=message.length()*messageCharLength;
    }
  }
  
}
 
//if the player is on the edge of the screen, scroll 
public void checkScroll(){
  //scroll the screen to the right if the player is far enough left, and not just starting
  while (player.xDraw<minScroll && player.xPos>minScroll)
    scroll(1); 
  
  //scroll the screen to the left if the player is far enough right, and not near the end
  while (player.xDraw>maxScroll && player.xPos<mapSize-maxScroll)
    scroll(-1); 
  
}

//moves everything over
public void scroll(int dir){
  //move the player 
  player.xDraw+=dir;
  //and the grass
  grass.scroll(dir);
  //move the decorations
  for (int i=0; i<decorations.length; i++)   decorations[i].x+=dir;
  //move the sky
  for (int i=0; i<sky.length; i++)   sky[i].x+=dir*0.5f;
  //move the starfield
  starField.scroll(dir*0.45f);
  //move the train
  train.xDraw+=dir;
}

//starGazing creates a new constellation and advances the time
public void startGaze(){
  gazing=true;
  pause=true;
  fader.start();
  int pic;
  //if there are still new stars, show the next one
  if (starNum<imgNum.length)
    pic=imgNum[starNum];
  //otherwise, just get one at random
  else
    pic=(int)random(0,imgNum.length);
  sky=(Constellation[])append(sky,new Constellation(pic));
  starNum++;    //advance to the next constellation
}

//the actions that should happen once the screen fades back in
public void endGaze(){
  gazing=false;
  if (random(100)>65)
    time+=random(20,200);
  else
    time+=random(600,1200);
  
  //if this pased the time for train to arrive, make it happen
  if(time>=timeLimit)  train.start();
}


public void drawScene(){
  //random start
  starField.draw();
  
  //draw the sky
  for (int i=0; i<sky.length; i++)  sky[i].update();
  
  //ground
  fill(9,72,8);
  noStroke();
  rect(0,groundHeight,width,400);
  grass.draw();
  
  train.update();
  
  //draw the decorations
  for (int i=1; i<decorations.length; i++)  decorations[i].update();
  //and draw the brother if he's there
  if (brotherIsHere)  decorations[0].update();
   
   //update the player
   player.update();
   
   //draw the fader
   fader.update();
}

public void drawTime(){
  //only advance the time if the game isn't paused or showing a message
  if (!pause && !showingMessage && downIsDown)  watchTimer++;
  if (!pause && !showingMessage && !downIsDown) watchTimer--;
  
  int alph=255;        //alpha for the display
  
  int fadeInTime=100;             //when to stop fading in
  int pauseTime=fadeInTime+100;   //how long to show time
  int fadeOutTime=pauseTime+100;  //when to stop fadeing out 
  
  //check how far the animation is and update the alpha
  if (watchTimer<fadeInTime)
    alph=(int)map(watchTimer,0,fadeInTime,0,255);
  else{
    alph=255;
    watchTimer=fadeInTime;
  }
  if (watchTimer<=0){
    showTime=false;
    return;
  }
  
 //convert the time
 int hours=(int)map(relativeTime,0,60,1,2);
 //if (hours==0)  hours=12;
 int mins=relativeTime%60;
 
 //draw the clock
 fill(255,alph);
 textSize(60);
 String clockReading=hours+":"+mins;
 //add the last 0 if mins isn't high enough
 if (mins<10){
   clockReading = new StringBuffer(clockReading).insert(clockReading.length()-1,"0").toString();
 }
 text(clockReading,width/2-70,120);
 
 //draw the reminder
 textSize(15);
 text("The train arrives at 2:00",width/2-90, 160);
}

public void startMessage(String newMessage){
  message=newMessage;
  messageTimer=0;
  showingMessage=true;
  pause=true;
}

public void drawMessage(){
 int padding=200;
 //fade out the rest of the screen
 noStroke();
 fill(0,150);
 rect(0,0,width,height);
 fill(25,191,186);
 rect(padding,padding,width-padding*2,height-padding*2-20);
 
 //draw reminder text if the game has started
 if (gameStart){
   textSize(16);
   text("Press SPACE to continue",width/2-100,height/2+100);
 }
 

 
 //increase the timer
 messageTimer++;
 
 //show the message so far
 int charsUsed=messageTimer/messageCharLength;
 charsUsed=min(charsUsed,message.length());
 
 String thisLine="";
 int lineDepth=0;
 int charNum=0;
 
 while (charNum<charsUsed){
   boolean newLine=false;
   while(thisLine.length()<37 && charNum<charsUsed && !newLine){
     if (message.charAt(charNum)!='\n')
       thisLine+=message.charAt(charNum);
     else
       newLine=true;
     
     charNum++;
   }
   fill(0);
   textSize(20);
   text(thisLine, padding+20,padding+30+lineDepth*25);
   thisLine="";
   lineDepth++;
 }
  
}

 //creates the brother
 public void spawnBrother(){
   brotherIsHere=true;

   //record the time
   brotherArriveTime=time;
 }
 
 //ends the game and sends the data
 //record the number of constellations, and how far over the time limit they were
 public void endGame(){
   gameOver=true;
   
   //send the data to the database
   int stars=starNum;
   int timeOver=relativeTime-60;
   String[] lines = loadStrings("http://andymakes.com/extras/choochoo/sendData2.php?&stars="+stars+"&time_over="+timeOver);
   println("send it" + stars+"   "+ timeOver);
  
 }
class Constellation{
  
  float x,y;
  float speed;
  PImage pic;
 
  Constellation(int starNum){
   x=random(player.xDraw,player.xDraw+120);
   y=random(0,170);
   speed=player.speed*2;
   
   
   //make sure starNum is in range
   if (starNum>7)  starNum=(int)random(0,8);
   pic=loadImage("pic/star"+starNum+".png");
  }
 
  public void update(){
     //draw the damn thing
     draw();
  }
 
  public void draw(){
    noStroke();
    //fill(255);
    image(pic,x,y);
   
  } 
  
  
  
}
class Decoration{
  float x;
  int h;
  
  PImage pic;
  String file;
 
  Decoration(float _x){
   x=_x;
  }
  
  Decoration(float _x, String imgFile){
    x=_x;
    pic=loadImage(imgFile);
    file=imgFile;
  }
 
  public void update(){
     //draw the damn thing
     draw();
  }
 
  public void draw(){
    noStroke();
    fill(255);
    
    fill(167,135,135);
    if (file!="pic/ground.png")
      image(pic,x,groundHeight-pic.height);
    else
      image(pic,x,groundHeight);
   
  }  
  
  
}
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
  
  public void update(){
    
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
  
  public void draw(){
    noStroke();
    fill(0,a);
    rect(0,0,width,height); 
  }
   
  public void start(){
    fadeOut=true; 
    done=false;
  }
  
}
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
 
  public void update(){
    
   
     //draw the damn thing
     draw();
  }
 
  public void draw(){
    pushMatrix();
    float headX=xDraw+6;
    if (gazing) headX=xDraw+4;
    translate(headX,groundHeight-body.height-8);
    if (gazing)  rotate(-PI/3.0f);
    image(head,-head.width/2,-head.height/2);
    popMatrix();
    
    //and put the body
    image(body,xDraw,groundHeight-body.height);
    
//    if(gazing)  image(picGaze,xDraw,groundHeight-picGaze.height);
//    else        image(pic,xDraw,groundHeight-pic.height);
   
  } 
  
  public void move(int dir){
    xPos+=speed*dir;
    xDraw+=speed*dir;
    
    //make sure the player didn't go off the board
    if (xPos>mapSize-200)  move(-1);
    if (xPos<0)        move(1);
  }
  
  
}
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
     x[i]=random(0,mapSize*0.7f);
     y[i]=random(0,height);
   }
 }
 
 //alternate to have it be grass
 StarField(boolean turnGrassOn){
   grass=true;
   x=new float[350];
   y=new float[350];
   for (int i=0; i<x.length; i++){
     x[i]=random(0,mapSize*1.2f);
     y[i]=random(groundHeight,height);
   }
 }
 
 public void draw(){
   stroke(255);
   if (grass)  stroke(0);
   for (int i=0; i<x.length; i++)
     point(x[i],y[i]);
 }
 
 public void scroll(float num){
   for (int i=0; i<x.length; i++)
     x[i]+=num;
 }
   
  
  
}
class Train{
  PImage pic;
  float x;
  int xDraw;
  float startX=mapSize;
  float endX=mapSize-500;
  
  
  
  float prc=0;        //percentage of the way done with the animation
  float speed=0.005f;   //how fast this percentage moves
  
  boolean comingIn=false;
//  boolean leaving=false;
//  boolean waiting=false;
  
  int waitTimer=0;
  int waitTime=100;
  
  Train(){
    pic=loadImage("pic/train.png");

    xDraw=0;
  }
  
  public void update(){
    float val=(float)java.lang.Math.pow(prc,0.3f);
    
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
  
  public void draw(){
    image(pic,xDraw+x,groundHeight-pic.height);
  }
  
  public void start(){
    comingIn=true;
    prc=(time-timeLimit)*speed;
  }
  
  
  
}
  static public void main(String args[]) {
    PApplet.main(new String[] { "--bgcolor=#FFFFFF", "moralityGamePrototype4" });
  }
}
