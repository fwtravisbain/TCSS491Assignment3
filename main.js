var socket = io.connect("http://24.16.255.56:8888");

var foo;
loading = true;
initialized = false;
countloaded = 0;
circle1 = null;

tempit = [];
tempx = [];
tempy = [];
tempvx = [];
tempvy = [];

count = 0;
index = 0;

socket.on("load", function (data) {
	
	count = data.statename.match(/\d+/)[0];
	if(data.statename.search("it") > -1)
	{
		tempit[count] = data.data
	}
	else if(data.statename.search("vx") > -1)
	{
		tempvx[count] = data.data
	}
	else if(data.statename.search("vy") > -1)
	{
		tempvy[count] = data.data
	}
	else if(data.statename.search("x") > -1)
	{
		tempx[count] = data.data
	}
	else if(data.statename.search("y") > -1)
	{
		tempy[count] = data.data
	}
	
	
	
});

//socket.emit("save", { studentname: "Travis", statename: "aState", data: "Test Just Travis" });
//socket.emit("load", { studentname: "TravisBain", statename: "aState" });
//socket.emit("load", { studentname: "Chris Marriott", statename: "aState" });
//socket.emit("load", { studentname: "TravisBain", statename: "circleState" });

//console.log(socket.emit("load", { studentname: "TravisBain", statename: "Circle1x"}));
//console.log("foo is " + foo);
//socket.emit("load", { studentname: "TravisBain", statename: "Circle1x"});

//console.log("foo is " + foo);

circles = [];
var oneCircle;


// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
	this.id = 0;
    this.player = 1;
    this.radius = 20;
    this.maxSpeed = 200;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setIt = function () {
    this.it = true;
    this.maxSpeed = 80;
    this.color = 0;
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.color = 3;
    this.visualRadius = 200;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);
    
    var that = this;
    
    if(this.it)
    {
    	this.setIt();
    }
    
    if(this.game.space)
    {
    	console.log("pressed space");
    	
    	setZombie = false;
    	
    	circles.forEach(function(element)
		{
    		if(!setZombie)
    		{
    			element.setIt();
    			setZombie = true;
    		}
    		else
    		{
    			element.setNotIt();
    		}
    		
    		socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "it", data: element.it});
        	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "x", data: element.x});
        	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "y", data: element.y});
        	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "vx", data: element.velocity.x});
        	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "vy", data: element.velocity.y});
		});
    	    	
    	this.game.space = false;
    }
 
    
    
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            if (this.it) {
                //this.setNotIt();
                ent.setIt();
                //socket.emit("save", { studentname: "TravisBain", statename: "aState", data: oneCircle.x});
                circles.forEach(function(element)
        		{
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "it", data: element.it});
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "x", data: element.x});
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "y", data: element.y});
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "vx", data: element.velocity.x});
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "vy", data: element.velocity.y});
                	
                	//console.log(element.it);
//                	console.log(element.x);
//                	console.log(element.y);
//                	console.log(element.velocity.x);
//                	console.log(element.velocity.y);
        		});
            }
            else if (ent.it) {
                this.setIt();
                //ent.setNotIt();
                //socket.emit("save", { studentname: "TravisBain", statename: "aState", data: "updated circles"});
            
                circles.forEach(function(element)
        		{
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "it", data: element.it});
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "x", data: element.x});
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "y", data: element.y});
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "vx", data: element.velocity.x});
                	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "vy", data: element.velocity.y});
                	
                	//console.log(element.it);
                	//console.log("foo is now" + foo);
        		});
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > this.maxSpeed) {
                    var ratio = this.maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > this.maxSpeed) {
                    var ratio = this.maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
        
        //socket.emit("save", { studentname: "TravisBain", statename: "circleState", data: circles});
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

function reinit(game)
{
	setFirst = false;
	countID = 0;
	
	circles.forEach(function(element)
	{
		element.id = countID;
		countID++;
		element.player = 1;
		element.radius = 20;
		element.maxSpeed = 200;
		element.visualRadius = 500;
		element.colors = ["Red", "Green", "Blue", "White"];
		element.setNotIt();
	    if(!setFirst)
	    {
	    	element.setIt();
	    	setFirst = true;
	    }
	    Entity.call(element, game, element.radius + Math.random() * (800 - element.radius * 2), element.radius + Math.random() * (800 - element.radius * 2));

	    element.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
	    var speed = Math.sqrt(element.velocity.x * element.velocity.x + element.velocity.y * element.velocity.y);
	    if (speed > element.maxSpeed) {
	        var ratio = element.maxSpeed / speed;
	        element.velocity.x *= ratio;
	        element.velocity.y *= ratio;
	        
	    }
	    
//	    socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "it", data: element.it});
//    	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "x", data: element.x});
//    	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "y", data: element.y});
//    	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "vx", data: element.velocity.x});
//    	socket.emit("save", { studentname: "TravisBain", statename: "Circle" + element.id + "vy", data: element.velocity.y});
	});
	
	console.log("reinit done");
	
	
}

// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var count = 0;
    var error = false;

    var gameEngine = new GameEngine();
    var circle = new Circle(gameEngine);
    circle.setIt();
    circles.push(circle);
    count++;
    gameEngine.addEntity(circle);
    for (var i = 0; i < 12; i++) {
        circle = new Circle(gameEngine);
        circle.id = count;
        count++;
        gameEngine.addEntity(circle);
        circles.push(circle);
        circle1 = circle;
    }
    
    console.log("Circles made");
    
    gameEngine.init(ctx);
    

    console.log("INITIAL VALUES");
    
    circles.forEach(function(element)
	{
//    	console.log(element.it);
//    	console.log(element.x);
//    	console.log(element.y);
//    	console.log(element.velocity.x);
//    	console.log(element.velocity.y);
    	
    	
    	
    	socket.emit("load", { studentname: "TravisBain", statename: "Circle" + element.id + "it"});
    	socket.emit("load", { studentname: "TravisBain", statename: "Circle" + element.id + "x"});
    	socket.emit("load", { studentname: "TravisBain", statename: "Circle" + element.id + "y"});
    	socket.emit("load", { studentname: "TravisBain", statename: "Circle" + element.id + "vx"});
    	socket.emit("load", { studentname: "TravisBain", statename: "Circle" + element.id + "vy"});
    	//console.log("x should be: " + foo);
	});
    
    setTimeout(function()
    {
    	 //circle1.it = foo;
    	    
    	 //console.log("circle1 it: " + circle1.it);
    	
    	circles.forEach(function(element)
    	{
    		if(isNaN(tempx[element.id]) || isNaN(tempy[element.id]))
    		{
    			error = true;
    		}
    		
    		element.it = tempit[element.id];
    		element.x = tempx[element.id];
    		element.y = tempy[element.id];
    		element.vx = tempvx[element.id];
    		element.vy = tempvy[element.id];
    		
    		console.log(element);
    	});
    	
    	if(error)
    	{
    		console.log("Fixing errors");
    		reinit(gameEngine);
    		error = false;
    	}
    	
    	gameEngine.start();
    }, 2500);
    
});
