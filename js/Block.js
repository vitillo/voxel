function Block(visible){
  this.visible = visible || false;
}

Block.prototype = Object.create(Object.prototype);

Block.prototype.isVisible = function(){
  return this.visible;
},

Block.prototype.setVisibility = function(visible){
  this.visible = visible;
}
