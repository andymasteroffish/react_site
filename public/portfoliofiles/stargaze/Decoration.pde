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
 
  void update(){
     //draw the damn thing
     draw();
  }
 
  void draw(){
    noStroke();
    fill(255);
    
    fill(167,135,135);
    if (file!="pic/ground.png")
      image(pic,x,groundHeight-pic.height);
    else
      image(pic,x,groundHeight);
   
  }  
  
  
}
