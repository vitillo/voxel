function Terrain(scene, gridSize, chunkSize){
  this.noise = new SimplexNoise();

  for(var i = -gridSize.x/2; i < gridSize.x/2; i++){
    for(var j = -gridSize.y/2; j < gridSize.y/2; j++){
      for(var k = 0; k < gridSize.z; k++){
        var chunk = this._createChunk(i, j, k, scene, chunkSize)

        if(k == 0){
          this._generateWater(chunk);
        }

        chunk.generateMesh();
      }
    }
  }
}

Terrain.prototype._generateWater = function(chunk){
  var size = chunk.getSize();

  for(var i = 0; i < size.x; i++)
    for(var j = 0; j < size.y && j < 8; j++)
      for(var k = 0; k < size.z; k++){
        var block = chunk.getBlock(i, j, k);

        if(!block.isVisible()){
          block.setType("water");
          block.setVisibility(true);
        }
      }
}

Terrain.prototype._createChunk = function(i, j, k, scene, chunkSize){
  var noise = this.noise;
  var d = 1/56;

  var chunk = new Chunk(scene, function(x, y, z){
    var p = this.getPosition();
    var n = noise.noise((p.x + x)*d, (p.z - z)*d);
    n = (n + 1)*0.5; // normalize
    var threshold = n * this.size.z * 3;

    var type = null;
    if(p.y + y <=8)
      type = "sand";
    else
      type = "grass";

    return new Block((y + p.y) <= threshold, type);
  }, chunkSize, new THREE.Vector3(i*chunkSize.x, k*chunkSize.z, j*chunkSize.y));

  return chunk;
}
