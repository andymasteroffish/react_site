// Andy Wallace
// 2011
// Sound Balls Base Station
//
// Arduino base station attached to the computer that listens for incoming data 
// from the balls and sends them along to the OF reciever app

#include <NewSoftSerial.h>

int listenVal;
int listenerPos=0;  //which byte of data we are curently writing

NewSoftSerial mySerial(2, 4);
#define VERSION "1.00a0"

#define BALLNUM 6

//int id[BALLNUM];  //id is one byte
unsigned char idBottom[BALLNUM];

//2 bytes
unsigned char val0Top[BALLNUM];
unsigned char val0Bottom[BALLNUM];

//2 bytes
unsigned char val2Top[BALLNUM];
unsigned char val2Bottom[BALLNUM];

//2 bytes
unsigned char val3Top[BALLNUM];
unsigned char val3Bottom[BALLNUM];

//unsigned char incoming[7];  //holds the new data


int cur=0;  //which ball's data we are collecting

//might not need hit
//int hit;  //1 byte
//unsigned char hitBottom;


int serialVal = 0;       // variable to store the data from the serial port

void setup(){
  Serial.begin(9600);
  mySerial.begin(9600);

  //set some random starting data
  //converting the ID can happen immediatly as it does not change
  int val0=123;
  int val2=456;
  int val3=789;
  
  //give some starting values
  //these will be quickly overwritten
  for (int i=0; i<BALLNUM; i++){
    idBottom[i]=i & 0xFF;
    
    val0Top[i]=(val0>>8 & 0xFF);
    val0Bottom[i]=(val0 & 0xFF);
    
    val2Top[i]=(val2>>8 & 0xFF);
    val2Bottom[i]=(val2 & 0xFF);
    
    val3Top[i]=(val3>>8 & 0xFF);
    val3Bottom[i]=(val3 & 0xFF);
  }
}


void loop(){

  //listen for data coming formt he other arduino
  listenVal=mySerial.read();
  if(listenVal!=-1){    //is there even anything there?
    if (listenVal=='!'){
      listenerPos=0;    //rest the listener position if the reset char was sent
    }else{
      if (listenerPos==0) {
        //figure out the ID number of this ball, so we know where in the arrays to put everything
        cur=listenVal;
        idBottom[cur]=listenVal;  
      }
      if (listenerPos==1)
        val0Top[cur]=listenVal;
      if (listenerPos==2) 
        val0Bottom[cur]=listenVal;
      if (listenerPos==3) 
        val2Top[cur]=listenVal;
      if (listenerPos==4) 
        val2Bottom[cur]=listenVal;
      if (listenerPos==5) 
        val3Top[cur]=listenVal;
      if (listenerPos==6) {
        val3Bottom[cur]=listenVal;
        mySerial.flush();  //clear out the srial port
      }
       
      listenerPos++;
    }
  }


  // read the serial port
  //only send data if we recieve an 'a' from the main program
  //this prevents us from sending way too much info
  serialVal = Serial.read();
  if (serialVal != -1) {
    int sending=-1;  //ID number of the ball who's info we're sending
    if (serialVal == '0')
      sending=0;
    else if (serialVal == '1')
      sending=1;
    else if (serialVal == '2')
      sending=2;
    else if (serialVal == '3')
      sending=3;
    else if (serialVal == '4')
      sending=4;
      
    if (sending!=-1){  //make sure something was actually selected
      Serial.print(idBottom[sending]);
      Serial.print(val0Top[sending]);
      Serial.print(val0Bottom[sending]);
      Serial.print(val2Top[sending]);
      Serial.print(val2Bottom[sending]);
      Serial.print(val3Top[sending]);
      Serial.print(val3Bottom[sending]);
    }
  }

}

