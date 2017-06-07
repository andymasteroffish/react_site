//Andy Wallace
//2011
//For Web Media 2 at Parsons

//sizing
var gameWidth=600;
var gameHeight=600;
var centerX;
var topY;

//score
var score=0;
var danceTime=0;
var danceMax=200;	//if danceTime reaches this point, it's a dance-a-gedon

//walls
var wallsSliding=false;
var wallTimer=0;

//game states
var curScreen="instructions";

//player info
var playerX=300;
var playerY=300;
var playerSpeed=5;
var mouseX;
var mouseY;
var dancing=false;
var playerDead=false;

//enemy info
var enemyNum=0;		//how many are there right now?
var enemyX=new Array();
var enemyY=new Array();
var enemyBaseSpeed=1.8;
var enemySpeed=enemyBaseSpeed;
var enemySpeedIncr=1.02;	//how much faster they get with each new enemy
var enemyReach=35;		//how close they must eb to the player to hit
var enemyBaseChance=0.01;
var enemyChance=enemyBaseChance;	//chance out of 1 that a new enemy will spawn each frame
var enemyChanceIncrease=0.000007;	//how mucht he chance goes up each frame

//dance party
var danceParty=false;
var dancePartyTimer;
var dancePartyTime=120;

//on-load function
$(function() {
	

	//set the topY
	topY=$("#title").css('height');

	//start our animation
	eachFrame();
	
	//check if the gameboard has been clicked
	$("#gameBoard").click(function(){
		if (curScreen=="instructions" || curScreen=="score"){
			wallsSliding=true;
		}
	});
	
	//if the mouse moves in the gameboard, save the location
	$("#gameBoard").mousemove(function(event){
		if (curScreen=="game"){
			mouseX=event.pageX-30;
			mouseY=event.pageY-40;
		}
	});
	
	//during the game, dance whenever the mosue is held down
	$(window).mousedown(function(event){
		if (curScreen=="game")
			dancing=true;
	});
	$(window).mouseup(function(event){
		if (curScreen=="game")
			dancing=false;
	});
	
	//reset the agme locaiton values if the window is resized
	//this is done each frame, but this allows it to be instant when the window is resized
	//theoretically I should be able to do this here, and once at the beginning, but the sizes are a bit off when I do that, so I'm still checking every frame 
	$(window).resize(function(){
		//check if the center of the screen has changed
		centerX=$(window).width()/2
		//make sure the side borders are in place
		$("#sideBorderL").css({'left':centerX-gameWidth/2-100});
		$("#sideBorderR").css({'left':centerX+gameWidth/2, 'top':'100px'});
	});
	
	

	
});


//EACH FRAME - this is where all your animation goes
eachFrame=function(){
	//set the game's location values based on the current window size when the game starts
	centerX=$(window).width()/2
	$("#sideBorderL").css({'left':centerX-gameWidth/2-100});
	$("#sideBorderR").css({'left':centerX+gameWidth/2, 'top':'100px'});
		
	if (wallsSliding)
		slideWalls();
		
	if (curScreen=="game")
		gameEvents();
	
	//wait a bit and then call the frame function again
	setTimeout(eachFrame,30);
}


//What happens heach frame during the gameplay
gameEvents= function(){
	if(!playerDead)
		score++;	//increase the score
	//show the score
	$("#gameScore").html("Score: "+ score);	//set the score
	
	//don't do shit if it's a dance party
	if (!danceParty){
		//move the player if they aren't dancing
		if (!dancing && !playerDead){
			var maxX=centerX+gameWidth/2-88;
			var minX=centerX-gameWidth/2;
			var maxY=$("#gameBoard").height()+$("#title").height()-139;
			var minY=$("#title").height();
			var targetX=Math.min(maxX, Math.max(minX,mouseX));
			var targetY=Math.min(maxY, Math.max(minY,mouseY));
			//have the player aproach the target if it isn't close already
			if (Math.abs(playerX-targetX)+Math.abs(playerY-targetY)>playerSpeed){
				var angle=Math.atan2(targetY-playerY,targetX-playerX);
				playerX+=playerSpeed*Math.cos(angle);
				playerY+=playerSpeed*Math.sin(angle);
				//set his image to the walking one
				if (playerSpeed*Math.cos(angle)>0)
					$("#player").css( {'background-image':'url("cyrax/walkingR.gif")', 'width':'88px', 'height':'139px'});
				else
					$("#player").css( {'background-image':'url("cyrax/walkingL.gif")', 'width':'88px', 'height':'139px'});
			}
			else{
				//show standing animation
				$("#player").css( {'background-image':'url("cyrax/standing.gif")', 'width':'80px', 								'height':'139px'});
			}
			//have cyrax move toward the player
			$("#player").css( {'left':playerX+"px", 'top':playerY+"px", 'z-index':Math.round(playerY)});
		}
		else if (dancing){
			//player is dancing!
			$("#player").css( {'background-image':'url("cyrax/dance.gif")', 'width':'62px', 'height':'138px'});
			danceTime++;
			//update the danceBar
			$("#danceBar").css( {'width':+map(danceTime,0,danceMax,0,gameWidth-90)+"px"} );
			//is the bar full
			if (danceTime==danceMax)
				startDanceParty();
		}
		//time for more enemies?
		enemyChance+=enemyChanceIncrease;	//over time, more enemies spawn
		if (Math.random()<enemyChance)
			addEnemy();
		//move the enimies
		moveEnemies();
	}
	else
		dancePartyManager();
}

//freezes the game for dancing
startDanceParty=function(){
	console.log("DANCE OFF BEGIN");
	danceParty=true;
	dancePartyTimer=0;	//reset the timer
	danceTime=0;		//reset dance time for next round
	//start all enemies dancing
	$(".enemy").css( {'background-image':'url("liukang/dance.gif")','width':'105px', 'height':'136px'});
	//set background
	$("#gameBoard").css({ 'background-image':'url("pic/gameBackgroundDisco.gif")'});
}

//does the frame to frame acitons of a dance party
dancePartyManager=function(){
	dancePartyTimer++;
	//strobe the danceBar
	if (dancePartyTimer%2==0)
		$("#danceBar").css( {'background-color':"#0f0"} );
	else
		$("#danceBar").css( {'background-color':"#00f"} );
	
	//right before the end, show enemie's death animation
	if (dancePartyTimer==dancePartyTime-30)
		$(".enemy").css( {'background-image':'url("liukang/falling.gif")', 'width':'138px', 'height':'142px'});
	
	if (dancePartyTimer==dancePartyTime)
		endDanceParty();
}

//it is always sad, but every dance party must end
endDanceParty=function(){
	console.log("END PARTY");
	danceParty=false;
	
	//clear out the enemies
	$(".enemy").remove();
	enemyNum=0;
	//reset the enemy arrays
	while(enemyX.length>0){
		enemyX.pop();
		enemyY.pop();
	}
	//update the danceBar and put it back to its normal color
	$("#danceBar").css( {'width':+map(danceTime,0,danceMax,0,gameWidth-80)+"px", 'background-color': '#CC0099'} );
	//put the normal background back
	$("#gameBoard").css({ 'background-image':'url("pic/gameBackground.jpg")'});
	
	//reset enemy speed
	enemySpeed=enemyBaseSpeed;

	
	//spawn a new enemy
	addEnemy();
}

//moves the enimies towards the player
moveEnemies=function(){
	for (var i=0; i<enemyNum; i++){
		var enemyID="#enemy"+i;		//the the id of this enemy
		//target the player
		var targetX=playerX;
		var targetY=playerY;
		//have the enemy aproach the target if it isn't close already
		if (Math.abs(enemyX[i]-targetX)+Math.abs(enemyY[i]-targetY)>playerSpeed){
			var angle=Math.atan2(targetY-enemyY[i],targetX-enemyX[i]);
			enemyX[i]+=enemySpeed*Math.cos(angle);
			enemyY[i]+=enemySpeed*Math.sin(angle);
			
			//set the walking image to face the right way
			if (Math.cos(angle)>0 && !danceParty)
				$(enemyID).css( {'background-image':'url("liukang/walkingR.gif")', 'width':'78px', 'height':'134px'});
			else if(!danceParty)
				$(enemyID).css( {'background-image':'url("liukang/walkingL.gif")', 'width':'78px', 'height':'134px'});
				
					
		}
		//if they are touching the player, end the game
		if (Math.abs(enemyX[i]-targetX)+Math.abs(enemyY[i]-targetY)<enemyReach)
			endGame();
		
		//have the enemy move toward the player
		
		$(enemyID).css( {'left':enemyX[i]+"px", 'top':enemyY[i]+"px", 'z-index':Math.round(enemyY[i])});
	}

}


endGame=function(){
	//NOT disabled for now
	wallsSliding=true;
	playerDead=true;
	//kill animation
	$("#player").css( {'background-image':'url("cyrax/falling.gif")', 'width':'149px', 'height':'136px'});
	
}


//sldies the walls in and out
slideWalls=function(){
	wallTimer++;	//advance the timer
	
	//timing
	var inTime=100;	
	var pauseTime=15;
	var outTime=30;
	
	var wallWidth;
	//are the walls coming in	
	if(wallTimer<inTime+pauseTime){	
		wallWidth=bounce(wallTimer,0,gameWidth/2,inTime);
		wallWidth=Math.min(wallWidth,gameWidth/2);	//make sure they never get too large
	}
	//or going out?
	else{
		//get the percentage so far
		var prc= (wallTimer-inTime-pauseTime)/outTime;
		//apply a curve to it
		prc=Math.pow(prc,2);
		//move thw walls acordingly
		wallWidth=(1-prc)*gameWidth/2+prc*0;
	}
	
	$(".wall").css( {'width':wallWidth} );
	
	
	//If the walls cover the screen, it's time to switch up the page content
	if (wallTimer==inTime)
		changeContent();
	
	
	//are we done?
	if (wallTimer==inTime+pauseTime+outTime){
		wallTimer=0;	//get it ready for next time
		wallsSliding=false;
	}
}

//checks what the current game state is and chagges the content to the next one
changeContent=function(){

	if (curScreen=="instructions" || curScreen=="score"){
		console.log("switching to game");
		
		curScreen="game";
		
		//reset game values
		score=0;
		danceTime=0;
		enemySpeed=enemyBaseSpeed;
		enemyChance=enemyBaseChance;
		playerDead=false;
		
		//clear any enemies that may be left over
		while(enemyX.length>0){
			enemyX.pop();
			enemyY.pop();
		}
		enemyNum=0;
		
		//remove the instructions or score report
		$("#instructions").remove();
		$(".scorePage").remove();
		
		//add the game elements with a class identifier so we can remove them later player
		$("<div id='player' class='gameElement'></div>").appendTo("#gameBoard");
		$("<div id='gameTopText' class='gameElement'>Dance Power</div>").appendTo("#gameBoard");
		$("<div id='gameScore' class='gameElement'></div>").appendTo("#gameBoard");
		$("<div id='danceBarHolder' class='gameElement'><div id='danceBar'></div></div>").appendTo("#gameBoard");
		
		//switch the background
		$("#gameBoard").css( {'background-image':'url("pic/gameBackground.jpg")'} );
		
		
	}
	
	else if (curScreen=="game"){
		curScreen="score";
		
		//clear out all of the game stuff
		$(".gameElement").remove();
		$(".enemy").remove();
		
		//add the score report
		$("<div id='score' class='scorePage'></div>").appendTo("#gameBoard");
		$("<div id='scoreMessage' class='scorePage'></div>").appendTo("#gameBoard");
		$("<div id='endGamePic' class='scorePage'></div>").appendTo("#gameBoard");
		$("#score").html(score);	//set the score
		//set the message based on the score
		if (score<500){
			$("#gameBoard").css( {'background-image':'url("pic/endGame1.jpg")'} );
			$("#endGamePic").css( {'background-image':'url("cyrax/dizzy.gif")', 'width':'83px','height':'135px', 'top':100+gameHeight-150, 'left':centerX-40} );
			
		}
		else if (score<1000){
			$("#gameBoard").css( {'background-image':'url("pic/endGame2.jpg")'} );
			$("#endGamePic").css( {'background-image':'url("cyrax/dizzy.gif")', 'width':'83px','height':'135px', 'top':100+gameHeight-150, 'left':centerX-40} );	
		}
		else if (score<2000){
			$("#gameBoard").css( {'background-image':'url("pic/endGame3.jpg")'} );
			$("#endGamePic").css( {'background-image':'url("cyrax/standing.gif")', 'width':'80px','height':'138px', 'top':100+gameHeight-150, 'left':centerX-40} );	
		}
		else {
			$("#gameBoard").css( {'background-image':'url("pic/endGame5.jpg")'} );
			$("#endGamePic").css( {'background-image':'url("cyrax/victory.png")', 'width':'59px','height':'158px', 'top':100+gameHeight-158, 'left':centerX-30} );	
		}
		
		
		//switch the background
/* 		$("#gameBoard").css( {'background-image':'url("pic/blank.png")'} ); */
		
		
	}
}

//adds an enemy to the screen
addEnemy=function(){
//set the position
	var xPos;
	if (Math.random()>.5) 	xPos=centerX-gameWidth/2-65;
	else 					xPos=centerX+gameWidth/2;
	var yPos=Math.random()*(gameHeight-140)+105;
	enemyX.push(xPos);
	enemyY.push(yPos);
	//actualy add the div
	var enemyID="enemy"+enemyNum;
	$("<div id='newbie' class='enemy'></div>").appendTo("#gameBoard");
	$("#newbie").attr("id",enemyID);
	
	//increase the speed
	enemySpeed*=enemySpeedIncr;
	
	enemyNum++;
}



//Penner Easing equation for bounce-ease out (http://robertpenner.com/easing/)
bounce=function(t, b, c, d){
	t/=d;
	if ((t) < (1/2.75)) {
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)) {
		t-=(1.5/2.75);
		var postFix = t;
		return c*(7.5625*(postFix)*t + .75) + b;
		//return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)) {
		t-=(2.25/2.75);
		var postFix = t;
		return c*(7.5625*(postFix)*t + .9375) + b;
	} else {
		t-=(2.625/2.75)
		var postFix = t;
		return c*(7.5625*(postFix)*t + .984375) + b;
	}
}

//maps a number from one range to another
map=function(x,xh,xl,ah,al){
	return (  ((x-xl)/(xh-xl)) * (ah-al) + al );
}
