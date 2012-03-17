
///////////////////////////////////////////////////////////////////////////////////////////////////
///// SpaceShip4042 - HTML5 Version (09/2011)
///// Created by Bruno Cicanci <bruno@gamedeveloper.com.br>
///// More information: http://gamedeveloper.com.br
///////////////////////////////////////////////////////////////////////////////////////////////////

//game gobal variables
var canvas, context2D, width, height, debug, speed, framerate, collisioOffset, 
	background, bkgScroll, bkgHeight, bulletDefault, bulletWidth, bulletHeight, bullets,  
	spaceShipDefault, spaceShipX, spaceShipY, ssdWidth, ssdHeight, animationFrame,
	spacebarKey, rightKey, leftKey, upKey, downKey,
	shootSound, shootCooldown, explosionSound, explosionCooldown, hitSound, 
	meteor, meteors, meteorWidth, meteorHeight, meteorCooldown;

function clearCanvas()
{
	context2D.clearRect(0, 0, width, height);
	
	//bullets
	for(var i = 0; i < bullets.length; i += 2) 
	{
		if (bullets[i + 1] <= (-height))
		{
			removeBullet(i);
		}
	}
	
	//meteors
	for(var i = 0; i < meteors.length; i += 5) 
	{
		if (meteors[i + 1] >= (height * 2))
		{
			removeMeteor(i);
		}
	}
}

function getRandom(min, max)
{
	return (Math.floor((max - min) * Math.random()));
}

function removeMeteor(index)
{
	meteors.splice(index, 1);//remove the X
	meteors.splice(index, 1);//remove the Y
	meteors.splice(index, 1);//remove the animation frame
	meteors.splice(index, 1);//remove the speed	
	meteors.splice(index, 1);//remove the life	
}

function createMeteor()
{
	meteors.push(getRandom(meteorWidth, width));//position X
	meteors.push(-height);//position Y
	meteors.push(getRandom(0, 3));//animation frame
	meteors.push((speed / 2) + getRandom(0, 3));//speed
	meteors.push(2);//life
}

function removeBullet(index)
{
	bullets.splice(index, 1);//remove the X
	bullets.splice(index, 1);//remove the Y	
}

function explodeMeteor()
{
	explosionSound.currentTime = 0;
	explosionSound.play();
}

function hitMeteor()
{
	hitSound.currentTime = 0;
	hitSound.play();
}

function fire()
{	
	if (shootCooldown > (framerate / 6))
	{
		shootCooldown = 0;//reset the cooldown
		
		shootSound.currentTime = 0;
	 	shootSound.play();
	 	
	 	bullets.push(spaceShipX);
	 	bullets.push(spaceShipY);
    }
}

function input()
{
	//spaceship animation
	animationFrame++;
	if (explosionCooldown >= (framerate / 3))
	{
		if(leftKey && rightKey)
		{
			if (animationFrame > 5) animationFrame = 3;//normal animation cycle
		}
		else if(leftKey)
		{
			if (animationFrame > 2) animationFrame = 0;//left animation cycle
		}
		else if(rightKey)
		{
			if (animationFrame > 8) animationFrame = 6;//right animation cycle
		}
		else
		{
			if (animationFrame > 5) animationFrame = 3;//normal animation cycle
		}
	}
	else
	{
		if(leftKey && rightKey)
		{
			animationFrame = 10;//normal explosion animation
		}
		else if(leftKey)
		{
			animationFrame = 9;//left explosion animation
		}
		else if(rightKey)
		{
			animationFrame = 11;//right explosion animation
		}
		else
		{
			animationFrame = 10;//normal explosion animation
		}	
	}
	
	//spaceship movement
	if(leftKey) 	spaceShipX -= speed;
	if(upKey) 		spaceShipY -= speed;
	if(rightKey)	spaceShipX += speed;
	if(downKey) 	spaceShipY += speed;
	
	//spaceship movement limits
	if((spaceShipX + ssdWidth) > width) spaceShipX -= speed;
	if(spaceShipX < 0) spaceShipX += speed;
	if((spaceShipY + ssdHeight) > height) spaceShipY -= speed;
	if(spaceShipY < 0) spaceShipY += speed;
	
	//background movement
	bkgScroll += speed / 3;
	if(bkgScroll >= height) bkgScroll = -bkgHeight;
	
	//fire logic
	if(spacebarKey) fire();
	shootCooldown++;
	if(shootCooldown > (framerate * 6)) shootCooldown = framerate; //just to keep the value shorter
	
	//meteor logic
	meteorCooldown++;
	if(meteorCooldown > (framerate / 2)) //meteor creation frequency
	{
		createMeteor();
		meteorCooldown = 0;
	}
	
	//explosion logic
	explosionCooldown++;
	if(explosionCooldown > (framerate * 6)) explosionCooldown = framerate; //just to keep the value shorter
}

function draw() 
{
	//background
	context2D.drawImage(background, 0, bkgScroll);
	
	//bullets
	for(var i = 0; i < bullets.length; i += 2) 
	{
		context2D.drawImage(bulletDefault, bullets[i] + (ssdWidth / 2) - (bulletWidth / 2), bullets[i + 1]);
		bullets[i + 1]-= speed;//make the bullet move away
	}
	
	//spaceship
	context2D.drawImage(spaceShipDefault, (ssdWidth * animationFrame), 0, ssdWidth, ssdHeight, spaceShipX, spaceShipY, ssdWidth, ssdHeight);
	var spaceshipImageData = context2D.getImageData(spaceShipX, spaceShipY, ssdWidth - (collisioOffset / 2), ssdHeight - collisioOffset);
	
	//meteors
	var meteorToRemove = -1;//remove the meteor after complete the draw
	for(var i = 0; i < meteors.length; i += 5) 
	{
		meteors[i + 1]+= meteors[i + 3];//make the meteors move away
		context2D.drawImage(meteor, (meteorWidth * meteors[i + 2]), 0, meteorWidth, meteorHeight, meteors[i], meteors[i + 1], meteorWidth, meteorHeight);
		var meteorImageData = context2D.getImageData(meteors[i], meteors[i+1], meteorWidth - collisioOffset, meteorHeight - collisioOffset);
		
		if(isPixelCollision(spaceshipImageData, spaceShipX, spaceShipY, meteorImageData, meteors[i], meteors[i+1], false))
		{
			explodeMeteor();
			explosionCooldown = 0;
	 		meteorToRemove = i;
		}
	}
	if(meteorToRemove >= 0) removeMeteor(meteorToRemove);
	
	//meteors vs bullets
	var meteorToRemove = -1;//remove the meteor after complete the draw
	var bulletToRemove = -1;//remove the bullet after complete the draw
	for(var i = 0; i < meteors.length; i += 5)
	{
		var meteorImageData = context2D.getImageData(meteors[i], meteors[i+1], meteorWidth - collisioOffset, meteorHeight - collisioOffset);
		
		for(var j = 0; j < bullets.length; j += 2)
		{
			var bulletImageData = context2D.getImageData(bullets[j], bullets[j+1], bulletWidth, bulletHeight);
			
			if(isPixelCollision(bulletImageData, bullets[j], bullets[j+1], meteorImageData, meteors[i], meteors[i+1], false))
			{
				if (meteors[i + 4] > 1)
				{
					hitMeteor();
					meteors[i + 4]--;//decrease one point of life
				}
				else
				{
					explodeMeteor();
			 		meteorToRemove = i;
				}
				bulletToRemove = j;
			}	
		}	
	}
	if(meteorToRemove >= 0) removeMeteor(meteorToRemove);
	if(bulletToRemove >= 0) removeBullet(bulletToRemove);
}

function printLog(text, height)
{
	context2D.font = "10pt Verdana";
    context2D.fillStyle = "#FFFFFF";
    context2D.fillText(text, 5, height); 
}

function debugInfo()
{
	if (debug)
	{
		printLog("meteors.length = " + meteors.length, 15);
		printLog("bullets.length = " + bullets.length, 30);
		printLog("spaceship(x, y) = " + spaceShipX + ", " + spaceShipY, 45);
	}
}

function update()
{
	clearCanvas();
	input();
	draw();
	debugInfo();
}

function keyAction(code, value)
{
	if (code == 32) spacebarKey = value;
	else if (code == 37) leftKey = value;
	else if (code == 38) upKey = value;
	else if (code == 39) rightKey = value;
	else if (code == 40) downKey = value;
}

function keyDown(e) 
{
	keyAction(e.keyCode, true);//pressed
}

function keyUp(e) 
{
	keyAction(e.keyCode, false);//released
}

(function init() 
{
	//init game stuff
	canvas = document.getElementById('canvas');
	context2D = canvas.getContext('2d');
	width = 480;
	height = 320;
	debug = true;//debug mode
	speed = 10;
	framerate = 30;
	spacebarKey = rightKey = leftKey = upKey = downKey = false;
	shootCooldown = framerate;//non-zero to allow the player shoot at game start
	explosionCooldown = framerate;//non-zero to avoid start as exploded
	meteorCooldown = 0;
	collisioOffset = 25;
	
	//load images
	background = new Image();
	background.src = "res/img/background.png";
	bkgHeight = 1250;//image info
	bkgScroll = height - bkgHeight;
	
	spaceShipDefault = new Image();
	spaceShipDefault.src = "res/img/spaceship01.png";
	ssdWidth = 45;//image info
	ssdHeight = 60;//image info
	spaceShipX = (width / 2) - (ssdWidth / 2); 
	spaceShipY = (height) - (ssdHeight / 2);
	animationFrame = 3;//3, 4 and 5 are normal animation; 0, 1 and 2 are left animation; 6, 7 and 8 are right animation

	bullets = new Array();//keep the x,y of all bullets stored
	bulletDefault = new Image();
	bulletDefault.src = "res/img/shoot01.png";
	bulletWidth = 4;//image info
	bulletHeight = 12;//image info
	
	meteors = new Array();//keep the x,y of all meteors stored
	meteor = new Image();
	meteor.src = "res/img/meteor01.png";
	meteorWidth = 80;//image info
	meteorHeight = 80;//image info
	
	//load sounds
	shootSound = new Audio("res/snd/cork_pop.wav");
	explosionSound = new Audio("res/snd/explosion.wav");
	hitSound = new Audio("res/snd/scratch.wav");

	//game events handle
	setInterval(update, framerate);
	document.addEventListener('keyup', keyUp, false);
	document.addEventListener('keydown', keyDown, false);
})();
//init();

/**
 * @author Joseph Lenton - PlayMyCode.com
 *
 * @param first An ImageData object from the first image we are colliding with.
 * @param x The x location of 'first'.
 * @param y The y location of 'first'.
 * @param other An ImageData object from the second image involved in the collision check.
 * @param x2 The x location of 'other'.
 * @param y2 The y location of 'other'.
 * @param isCentred True if the locations refer to the centre of 'first' and 'other', false to specify the top left corner.
 */
function isPixelCollision( first, x, y, other, x2, y2, isCentred )
{
    // we need to avoid using floats, as were doing array lookups
    x  = Math.round( x );
    y  = Math.round( y );
    x2 = Math.round( x2 );
    y2 = Math.round( y2 );

    var w  = first.width,
        h  = first.height,
        w2 = other.width,
        h2 = other.height ;

    // deal with the image being centred
    if ( isCentred ) {
        // fast rounding, but positive only
        x  -= ( w/2 + 0.5) << 0
        y  -= ( h/2 + 0.5) << 0
        x2 -= (w2/2 + 0.5) << 0
        y2 -= (h2/2 + 0.5) << 0
    }

    // find the top left and bottom right corners of overlapping area
    var xMin = Math.max( x, x2 ),
        yMin = Math.max( y, y2 ),
        xMax = Math.min( x+w, x2+w2 ),
        yMax = Math.min( y+h, y2+h2 );

    // Sanity collision check, we ensure that the top-left corner is both
    // above and to the left of the bottom-right corner.
    if ( xMin >= xMax || yMin >= yMax ) {
        return false;
    }

    var xDiff = xMax - xMin,
        yDiff = yMax - yMin;

    // get the pixels out from the images
    var pixels  = first.data,
        pixels2 = other.data;

    // if the area is really small,
    // then just perform a normal image collision check
    if ( xDiff < 4 && yDiff < 4 ) {
        for ( var pixelX = xMin; pixelX < xMax; pixelX++ ) {
            for ( var pixelY = yMin; pixelY < yMax; pixelY++ ) {
                if (
                        ( pixels [ ((pixelX-x ) + (pixelY-y )*w )*4 + 3 ] !== 0 ) &&
                        ( pixels2[ ((pixelX-x2) + (pixelY-y2)*w2)*4 + 3 ] !== 0 )
                ) {
                    return true;
                }
            }
        }
    } else {
        /* What is this doing?
         * It is iterating over the overlapping area,
         * across the x then y the,
         * checking if the pixels are on top of this.
         *
         * What is special is that it increments by incX or incY,
         * allowing it to quickly jump across the image in large increments
         * rather then slowly going pixel by pixel.
         *
         * This makes it more likely to find a colliding pixel early.
         */

        // Work out the increments,
        // it's a third, but ensure we don't get a tiny
        // slither of an area for the last iteration (using fast ceil).
        var incX = xDiff / 3.0,
            incY = yDiff / 3.0;
        incX = (~~incX === incX) ? incX : (incX+1 | 0);
        incY = (~~incY === incY) ? incY : (incY+1 | 0);

        for ( var offsetY = 0; offsetY < incY; offsetY++ ) {
            for ( var offsetX = 0; offsetX < incX; offsetX++ ) {
                for ( var pixelY = yMin+offsetY; pixelY < yMax; pixelY += incY ) {
                    for ( var pixelX = xMin+offsetX; pixelX < xMax; pixelX += incX ) {
                        if (
                                ( pixels [ ((pixelX-x ) + (pixelY-y )*w )*4 + 3 ] !== 0 ) &&
                                ( pixels2[ ((pixelX-x2) + (pixelY-y2)*w2)*4 + 3 ] !== 0 )
                        ) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    return false;
}