// Andy Wallace
// 2011
// Sound Ball Transmitter
//
// Each ball contains an Arduino running this program
// periodcly sending out information about the sensor in the ball
// if the sensor only requires two pins, the third will be ignored by OF

#include <NewSoftSerial.h>

int id;  //one byte (will never exceed 255)
unsigned char idBottom;

int val0;  //2 bytes
unsigned char val0Top;
unsigned char val0Bottom;

int val2;  //2 bytes
unsigned char val2Top;
unsigned char val2Bottom;

int val3;  //2 bytes
unsigned char val3Top;
unsigned char val3Bottom;


NewSoftSerial mySerial(2, 4);
#define VERSION "1.00a0"

void setup()   { 
  Serial.begin(9600);  
  mySerial.begin(9600);

  id=4;
  val0=100;
  val2=300;
  val3=500;
//  dist=101;
  //hit=1;

  //converting the ID can happen immediatly as it does not change
  idBottom=id & 0xFF;
}


void loop() {
  //set the variables
  val0=analogRead(0);
  val2=analogRead(1);
  val3=analogRead(2);


  //convert the values to individual bytes
  val0Top=(val0>>8 & 0xFF);
  val0Bottom=(val0 & 0xFF);
  val2Top=(val2>>8 & 0xFF);
  val2Bottom=(val2 & 0xFF);
  val3Top=(val3>>8 & 0xFF);
  val3Bottom=(val3 & 0xFF);

  //send out the data at set intervals
  if (millis()%80==0){
      mySerial.print('!');  //let the base station know that we are starting a new data set
      mySerial.print(idBottom);
      mySerial.print(val0Top);
      mySerial.print(val0Bottom);
      mySerial.print(val2Top);
      mySerial.print(val2Bottom);
      mySerial.print(val3Top);
      mySerial.print(val3Bottom);
  }
}

