function Chunk(scene, generator, size, position){
  this.scene = scene;
  this._createBlock = generator ? generator : function(){return new Block(true);};

  this.size = size || new THREE.Vector3(10, 10, 10);
  this.visibleChunks = 0;

  this.wrapper = new THREE.Object3D();
  this.wrapper.position = position || new THREE.Vector3(0, 0, 0);
  Chunk.grid.set(this.wrapper.position, this);
  scene.add(this.wrapper);

  this._initializeBlocks();
}

Chunk.grid = new Grid();
Chunk.material = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/minecraft.png')});

Chunk.prototype._initializeBlocks = function(){
  this.blocks = [];
  for(var x = 0; x < this.size.x; x++){
    this.blocks[x] = [];

    for(var y = 0; y < this.size.y; y++){
      this.blocks[x][y] = [];

      for(var z = 0; z < this.size.z; z++){
        this.blocks[x][y][z] = this._createBlock(x, y, z);
      }
    }
  }
}

Chunk.prototype._getVertexPosition = function(index, vertices, geometry){
  var vertex = vertices[index];

  if(!vertex.pos){
    var i = geometry.vertices.length;
    geometry.vertices.push(vertices[index]);
    vertex.pos = i;
  }

  return vertex.pos;
}

Chunk.prototype._createLeftFace = function(x, y, z, vertices, geometry, uvs){
  if(x != 0 && this.blocks[x-1][y][z].isVisible())
    return;

  geometry.faces.push(new THREE.Face4(this._getVertexPosition(0, vertices, geometry), 
                                      this._getVertexPosition(1, vertices, geometry), 
                                      this._getVertexPosition(2, vertices, geometry), 
                                      this._getVertexPosition(3, vertices, geometry), 
                                      new THREE.Vector3(-1, 0, 0)));
  geometry.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2], uvs[3] ] );
}

Chunk.prototype._createFrontFace = function(x, y, z, vertices, geometry, uvs){
  if(z != 0 && this.blocks[x][y][z-1].isVisible())
    return;


  geometry.faces.push(new THREE.Face4(this._getVertexPosition(0, vertices, geometry), 
                                      this._getVertexPosition(5, vertices, geometry), 
                                      this._getVertexPosition(4, vertices, geometry), 
                                      this._getVertexPosition(1, vertices, geometry), 
                                      new THREE.Vector3(0, 0, 1)));
  geometry.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2], uvs[3] ] );
}

Chunk.prototype._createRightFace = function(x, y, z, vertices, geometry, uvs){
  if(x != this.size.x - 1 && this.blocks[x+1][y][z].isVisible())
    return;


  geometry.faces.push(new THREE.Face4(this._getVertexPosition(4, vertices, geometry), 
                                      this._getVertexPosition(5, vertices, geometry), 
                                      this._getVertexPosition(6, vertices, geometry), 
                                      this._getVertexPosition(7, vertices, geometry), 
                                      new THREE.Vector3(1, 0, 0)));
  geometry.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2], uvs[3] ] );
}

Chunk.prototype._createBackFace = function(x, y, z, vertices, geometry, uvs){
  if(z != this.size.z - 1 && this.blocks[x][y][z+1].isVisible())
    return;

  geometry.faces.push(new THREE.Face4(this._getVertexPosition(6, vertices, geometry), 
                                      this._getVertexPosition(3, vertices, geometry), 
                                      this._getVertexPosition(2, vertices, geometry), 
                                      this._getVertexPosition(7, vertices, geometry), 
                                      new THREE.Vector3(0, 0, -1)));
  geometry.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2], uvs[3] ] );
}

Chunk.prototype._createTopFace = function(x, y, z, vertices, geometry, uvs){
  if(y != (this.size.y - 1) && this.blocks[x][y+1][z].isVisible())
    return;

  geometry.faces.push(new THREE.Face4(this._getVertexPosition(1, vertices, geometry), 
                                      this._getVertexPosition(4, vertices, geometry), 
                                      this._getVertexPosition(7, vertices, geometry), 
                                      this._getVertexPosition(2, vertices, geometry), 
                                      new THREE.Vector3(0, 1, 0)));
  geometry.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2], uvs[3] ] );
}

Chunk.prototype._createBottomFace = function(x, y, z, vertices, geometry, uvs){
  if(y != 0 && this.blocks[x][y-1][z].isVisible())
    return;

  geometry.faces.push(new THREE.Face4(this._getVertexPosition(0, vertices, geometry), 
                                      this._getVertexPosition(3, vertices, geometry), 
                                      this._getVertexPosition(6, vertices, geometry), 
                                      this._getVertexPosition(5, vertices, geometry), 
                                      new THREE.Vector3(0, -1, 0)));
  geometry.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2], uvs[3] ] );
}

Chunk.prototype.generateMesh = function(){
  var geometry = this.geometry = new THREE.Geometry();
  this.visibleChunks = 0;

  for(var x = 0; x < this.size.x; x++){
    for(var y = 0; y < this.size.y; y++){
      for(var z = 0; z < this.size.z; z++){
        var block = this.blocks[x][y][z];

        if(!block.isVisible())
          continue;

        this.visibleChunks++;
        var vo = geometry.vertices.length;
        var vertices = [];

        vertices[0] = new THREE.Vector3(x, y, -z);
        vertices[1] = new THREE.Vector3(x, y + 1, -z);
        vertices[2] = new THREE.Vector3(x, y + 1, -z - 1);
        vertices[3] = new THREE.Vector3(x, y, -z - 1);
        vertices[4] = new THREE.Vector3(x + 1, y + 1, -z);
        vertices[5] = new THREE.Vector3(x + 1, y, -z);
        vertices[6] = new THREE.Vector3(x + 1, y, -z - 1);
        vertices[7] = new THREE.Vector3(x + 1, y + 1, -z - 1);

        this._createLeftFace(x, y, z, vertices, geometry, block.uvs);
        this._createFrontFace(x, y, z, vertices, geometry, block.uvs);
        this._createRightFace(x, y, z, vertices, geometry, block.uvs);
        this._createBackFace(x, y, z, vertices, geometry, block.uvs);
        this._createTopFace(x, y, z, vertices, geometry, block.uvs);
        this._createBottomFace(x, y, z, vertices, geometry, block.uvs);
      }
    }
  }

  if(this.mesh){
    this.wrapper.remove(this.mesh);
  }

  this.mesh = new THREE.Mesh(this.geometry, Chunk.material);
  this.mesh.userData['chunk'] = this;
  this.mesh.position.x = -this.size.x/2;
  this.mesh.position.y = -this.size.y/2;
  this.mesh.position.z = this.size.z/2;
  this.wrapper.add(this.mesh);
}

Chunk.prototype.addBlock = function(point, direction){
  var p = point.clone();
  var d = direction.clone();

  this.mesh.worldToLocal(p);
  this.mesh.worldToLocal(d);

  var epsilon = Math.pow(10, -6);
  var block = new THREE.Vector3();

  if(Math.abs(Math.round(p.x) - p.x) <= epsilon){
    var normal = new THREE.Vector3(1, 0, 0);
  
    if(normal.dot(d) > 0){
      block.set(Math.round(p.x), Math.floor(p.y), - Math.ceil(p.z));
    }else{
      block.set(Math.round(p.x) - 1, Math.floor(p.y), - Math.ceil(p.z));
    }
  }else if(Math.abs(Math.round(p.y) - p.y) <= epsilon){
    var normal = new THREE.Vector3(0, 1, 0);
  
    if(normal.dot(d) > 0)
      block.set(Math.floor(p.x), Math.round(p.y), - Math.ceil(p.z));
    else
      block.set(Math.floor(p.x), Math.round(p.y) - 1, - Math.ceil(p.z));
  }else if(Math.abs(Math.round(p.z) - p.z) <= epsilon){
    var normal = new THREE.Vector4(0, 0, 1, 0);

    if(normal.dot(d) > 0)
      block.set(Math.floor(p.x), Math.floor(p.y), - Math.round(p.z) - 1);
    else{
      block.set(Math.floor(p.x), Math.floor(p.y), - Math.round(p.z));
    }
  }else{
    console.log('error')
    return;
  }

  // Create new chunk if needed
  if(block.x < 0){
    this._updateNeighbor(new THREE.Vector3(this.wrapper.position.x - this.size.x, this.wrapper.position.y, this.wrapper.position.z), 
                         new THREE.Vector3(this.size.x - 1, block.y, block.z));
    return;

  }else if(block.x >= this.size.x){
    this._updateNeighbor(new THREE.Vector3(this.wrapper.position.x + this.size.x, this.wrapper.position.y, this.wrapper.position.z), 
                         new THREE.Vector3(0, block.y, block.z));
    return;
  }else if(block.y < 0){
    this._updateNeighbor(new THREE.Vector3(this.wrapper.position.x, this.wrapper.position.y - this.size.y, this.wrapper.position.z), 
                         new THREE.Vector3(block.x, this.size.y - 1, block.z));
    return;
  }else if(block.y >= this.size.y){
    this._updateNeighbor(new THREE.Vector3(this.wrapper.position.x, this.wrapper.position.y + this.size.y, this.wrapper.position.z), 
                         new THREE.Vector3(block.x, 0, block.z));
    return;
  }else if(block.z < 0){
    this._updateNeighbor(new THREE.Vector3(this.wrapper.position.x, this.wrapper.position.y, this.wrapper.position.z + this.size.z), 
                         new THREE.Vector3(block.x, block.y, this.size.z - 1));
    return;
  }else if(block.z >= this.size.z){
    this._updateNeighbor(new THREE.Vector3(this.wrapper.position.x, this.wrapper.position.y, this.wrapper.position.z - this.size.z), 
                         new THREE.Vector3(block.x, block.y, 0));
    return;
  }

  // Rebuild updated chunk
  this.blocks[block.x][block.y][block.z].setVisibility(true);
  this.generateMesh();
}

Chunk.prototype.getPosition = function(){
  return this.wrapper.position.clone();
}

Chunk.prototype._updateNeighbor = function(position, block){
  var chunk = Chunk.grid.get(position);

  if(!chunk){
    var generator = function(x, y, z){
      return new Block(x == block.x && y == block.y && z == block.z);
    }

    new Chunk(this.scene, generator, this.size, position);
  }else{
    chunk.getBlock(block).setVisibility(true);
    chunk.generateMesh();
  }
}

Chunk.prototype.removeBlock = function(point, direction){
  var p = point.clone();
  var d = direction.clone();

  this.mesh.worldToLocal(p);
  this.mesh.worldToLocal(d);

  var epsilon = Math.pow(10, -6);
  var block = new THREE.Vector3();

  if(Math.abs(Math.round(p.x) - p.x) <= epsilon){
    var normal = new THREE.Vector3(1, 0, 0);
  
    if(normal.dot(d) > 0){
      block.set(Math.round(p.x) - 1, Math.floor(p.y), - Math.ceil(p.z));
    }else{
      block.set(Math.round(p.x), Math.floor(p.y), - Math.ceil(p.z));
    }
  }else if(Math.abs(Math.round(p.y) - p.y) <= epsilon){
    var normal = new THREE.Vector3(0, 1, 0);
  
    if(normal.dot(d) > 0)
      block.set(Math.floor(p.x), Math.round(p.y) - 1, - Math.ceil(p.z));
    else
      block.set(Math.floor(p.x), Math.round(p.y), - Math.ceil(p.z));
  }else if(Math.abs(Math.round(p.z) - p.z) <= epsilon){
    var normal = new THREE.Vector4(0, 0, 1, 0);

    if(normal.dot(d) > 0)
      block.set(Math.floor(p.x), Math.floor(p.y), - Math.round(p.z));
    else{
      block.set(Math.floor(p.x), Math.floor(p.y), - Math.round(p.z) + 1);
    }
  }else{
    console.log('error')
    return;
  }

  // Delete chunk if needed
  if(this.visibleChunks == 1){
    Chunk.grid.set(this.getPosition(), null);
    this.scene.remove(this.wrapper);
    return;
  }

  // Rebuild updated chunk
  this.blocks[block.x][block.y][block.z].setVisibility(false);
  this.generateMesh();
}

Chunk.prototype.getBlock = function(block, y, z){
  if(y == undefined)
    return this.blocks[block.x][block.y][block.z];
  else
    return this.blocks[block][y][z];
}

Chunk.prototype.getSize = function(){
  return this.size;
}
