function Block(visible, type){
  this.visible = visible || false;
  this.type = type;
  this.uvCache = [];
  this.setType(type);
}

Block.uvCache = [];

for(var i = 0; i < 16; i++)
  Block.uvCache[i] = [];

Block.prototype = Object.create(Object.prototype);

Block.prototype._generateUVs = function(x, y){
  var uvs = Block.uvCache[x][y];
  var s = 0.0625; //1/16
  var c = 3/256; //margin

  if(!uvs){
    uvs = [];

    uvs.push( new THREE.Vector2(x * s + c, y * s + c) );
    uvs.push( new THREE.Vector2(x * s + s - c, y * s + c ) );
    uvs.push( new THREE.Vector2(x * s + s - c, y * s + s - c) );
    uvs.push( new THREE.Vector2(x * s + c, y * s + s - c) );

    Block.uvCache[x][y] = uvs;
  }

  this.uvs = uvs;
  return uvs;
}

Block.prototype.isVisible = function(){
  return this.visible;
},

Block.prototype.setVisibility = function(visible){
  this.visible = visible;
}

Block.prototype.getUVs = function(){
  return this.uvs;
}

Block.prototype.setType = function(type){
  this.type = type;

  switch(type){
    case "grass":
      this._generateUVs(1, 6);
      break;
    case "stone":
      this._generateUVs(1, 15);
      break;
    case "dirt":
      this._generateUVs(2, 15);
      break;
    case "water":
      this._generateUVs(0, 6);
      break;
    case "sand":
      this._generateUVs(2, 14);
      break;
    default:
      this._generateUVs(2, 15);
      break;
  }
}
