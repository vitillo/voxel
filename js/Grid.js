function Grid(){
  this.chunks = [];
}

Grid.prototype.get = function(p){
  if(!this.chunks[p.x])
    return null;

  if(!this.chunks[p.x][p.y])
    return null;

  if(!this.chunks[p.x][p.y][p.z])
    return null;

  return this.chunks[p.x][p.y][p.z];
}

Grid.prototype.set = function(p, chunk){
  if(!this.chunks[p.x])
    this.chunks[p.x] = [];

  if(!this.chunks[p.x][p.y])
    this.chunks[p.x][p.y] = [];

  this.chunks[p.x][p.y][p.z] = chunk;
}
