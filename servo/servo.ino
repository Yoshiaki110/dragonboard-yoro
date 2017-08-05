

#include <Arduino.h>
#include <Servo.h> 

#define USE_SERIAL Serial

Servo myservo;
const int LED = 4;     // ID4/D5
const int BUTTON = 0;   // ID5/D6
int g_curpos = 180;
int g_distpos = 180;
int g_emergency = 0;

void servo() {
  if (g_curpos == g_distpos) {
    return;
  } else if (g_curpos > g_distpos) {
    g_curpos -= 1;
  } else if (g_curpos < g_distpos) {
    g_curpos += 1;
  }
  //USE_SERIAL.printf("%d %d\n", g_curpos, g_distpos);
  myservo.write(g_curpos);
  delay(10);
}

void setup() {
    USE_SERIAL.begin(9600);
    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    myservo.attach(2);                  // IO2 D4
    myservo.write(180);
      
    pinMode(LED, OUTPUT);
    pinMode(BUTTON, INPUT);
    digitalWrite(LED, LOW);
    
    USE_SERIAL.println("end setup");
}

void readSerial() {
  String bufferStr = "";
  if (Serial.available() > 0) {
    for (int i = 0; i < 100; i++) {
      int recieveByte = Serial.read();
      if (recieveByte == (int)'\n') {
        int val = bufferStr.toInt();
        Serial.print("I received: "); 
        Serial.println(val);
        g_distpos = val;
        break;
      } else if (recieveByte > 0) {
        bufferStr.concat((char)recieveByte);
      }
      delay(10);
    }
  }
  return;
}

void loop() {
    //USE_SERIAL.println("start");
    readSerial();
    int BUTTONState = digitalRead(BUTTON);
    //USE_SERIAL.println(BUTTONState);
    if (BUTTONState == LOW) {                 // ボタンが押されたら
        digitalWrite(LED, LOW);
        g_emergency = (~g_emergency) & 1;
        USE_SERIAL.println(g_emergency);
        for (;;) {                            // ボタンが離されるまでループ
            BUTTONState = digitalRead(BUTTON);
            if (BUTTONState == HIGH) {
                break;
            }
            delay(5);
        }
    }
    if (g_emergency) {
        myservo.write(180);
        int flag = millis() & 0x40;
        if (flag == 0) {
            digitalWrite(LED, HIGH);
        } else {
            digitalWrite(LED, LOW);
        }
    } else {
        servo();
        digitalWrite(LED, HIGH);
    }
    //USE_SERIAL.println("end");
    delay(5);
}


