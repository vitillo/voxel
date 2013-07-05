function Chunk(scene, generator, sizeX, sizeY, sizeZ){
  this._scene = scene;
  this._createBlock = generator ? generator : function(){return new Block(true);};

  this.sizeX = sizeX || 10;
  this.sizeY = sizeY || 10;
  this.sizeZ = sizeZ || 10;

  this.wrapper = new THREE.Object3D();
  scene.add(this.wrapper);

  this._initialize();
  this._generateMesh();

  this.__defineGetter__("position", function(){
    return this.wrapper.position;
  });

  this.__defineGetter__("rotation", function(){
    return this.wrapper.rotation;
  });

  this.__defineGetter__("scale", function(){
    return this.wrapper.scale;
  });
}

Chunk.prototype = Object.create(Object.prototype);

Chunk.prototype.constructor = Object;

Chunk.prototype._initialize = function(){
  this.buffer = [];
  for(var x = 0; x < this.sizeX; x++){
    this.buffer[x] = [];

    for(var y = 0; y < this.sizeY; y++){
      this.buffer[x][y] = [];

      for(var z = 0; z < this.sizeZ; z++){
        this.buffer[x][y][z] = this._createBlock(x, y, z);
      }
    }
  }
}

Chunk.prototype._generateMesh = function(){
  var geometry = this.geometry = new THREE.Geometry();
  var material = new THREE.MeshPhongMaterial({color: 0x008801, ambient: 0x008800, specular: 0xFFFFFF});

  for(var x = 0; x < this.sizeX; x++){
    for(var y = 0; y < this.sizeY; y++){
      for(var z = 0; z < this.sizeZ; z++){
        if(!this.buffer[x][y][z].isVisible())
          continue;
        var vo = geometry.vertices.length;

        //Left Face
        var vertex0 = new THREE.Vector3(x, y, -z);
        var vertex1 = new THREE.Vector3(x, y + 1, -z);
        var vertex2 = new THREE.Vector3(x, y + 1, -z - 1);
        var vertex3 = new THREE.Vector3(x, y, -z - 1);

        geometry.vertices.push(vertex0);
        geometry.vertices.push(vertex1);
        geometry.vertices.push(vertex2);
        geometry.vertices.push(vertex3);

        if(x == 0 || !this.buffer[x-1][y][z].isVisible()){
          geometry.faces.push(new THREE.Face4(vo + 0, vo + 1, vo + 2, vo + 3, new THREE.Vector3(-1, 0, 0)));
        }

        //Front Face
        var vertex4 = new THREE.Vector3(x + 1, y + 1, -z);
        var vertex5 = new THREE.Vector3(x + 1, y, -z);

        geometry.vertices.push(vertex4);
        geometry.vertices.push(vertex5);

        if(z == 0 || !this.buffer[x][y][z-1].isVisible()){
          geometry.faces.push(new THREE.Face4(vo + 0, vo + 5, vo + 4, vo + 1, new THREE.Vector3(0, 0, 1)));
        }

        //Right Face
        var vertex6 = new THREE.Vector3(x + 1, y, -z - 1);
        var vertex7 = new THREE.Vector3(x + 1, y + 1, -z - 1);

        geometry.vertices.push(vertex6);
        geometry.vertices.push(vertex7);

        if(x == this.sizeX - 1 || !this.buffer[x+1][y][z].isVisible()){
          geometry.faces.push(new THREE.Face4(vo + 4, vo + 5, vo + 6, vo + 7, new THREE.Vector3(1, 0, 0)));
        }

        //Back Face
        if(z == this.sizeZ - 1 || !this.buffer[x][y][z+1].isVisible()){
          geometry.faces.push(new THREE.Face4(vo + 6, vo + 3, vo + 2, vo + 7, new THREE.Vector3(0, 0, -1)));
        }

        //Top Face
        if(y == this.sizeY - 1 || !this.buffer[x][y+1][z].isVisible()){
          geometry.faces.push(new THREE.Face4(vo + 1, vo + 4, vo + 7, vo + 2, new THREE.Vector3(0, 1, 0)));
        }
        
        //Bottom Face
        if(y == 0 || !this.buffer[x][y-1][z].isVisible()){
          geometry.faces.push(new THREE.Face4(vo + 0, vo + 3, vo + 6, vo + 5, new THREE.Vector3(0, -1, 0)));
        }
      }
    }
  }

  if(this.mesh){
    this.wrapper.remove(this.mesh);
  }

  this.mesh = new THREE.Mesh(this.geometry, material);
  this.mesh.userData['chunk'] = this;
  this.mesh.position.x = -this.sizeX/2;
  this.mesh.position.y = -this.sizeY/2;
  this.mesh.position.z = this.sizeZ/2;
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
  var chunkPosition = null;
  var generator = null;
  var self = this;

  if(block.x < 0){
    chunkPosition = new THREE.Vector3(this.wrapper.position.x - this.sizeX, this.wrapper.position.y, this.wrapper.position.z);
    generator = function(x, y, z){ return new Block(x == self.sizeX - 1 && y == block.y && z == block.z); }
  }else if(block.x >= this.sizeX){
    chunkPosition = new THREE.Vector3(this.wrapper.position.x + this.sizeX, this.wrapper.position.y, this.wrapper.position.z);
    generator = function(x, y, z){ return new Block(x == 0 && y == block.y && z == block.z); }
  }else if(block.y < 0){
    chunkPosition = new THREE.Vector3(this.wrapper.position.x, this.wrapper.position.y - this.sizeY, this.wrapper.position.z);
    generator = function(x, y, z){ return new Block(x == block.x && y == self.sizeY - 1 && z == block.z); }
  }else if(block.y >= this.sizeY){
    chunkPosition = new THREE.Vector3(this.wrapper.position.x, this.wrapper.position.y + this.sizeY, this.wrapper.position.z);
    generator = function(x, y, z){ return new Block(x == block.x && y == 0 && z == block.z); }
  }else if(block.z < 0){
    chunkPosition = new THREE.Vector3(this.wrapper.position.x, this.wrapper.position.y, this.wrapper.position.z + this.sizeZ);
    generator = function(x, y, z){ return new Block(x == block.x && y == block.y && z == self.sizeZ - 1); }
  }else if(block.z >= this.sizeZ){
    chunkPosition = new THREE.Vector3(this.wrapper.position.x, this.wrapper.position.y, this.wrapper.position.z - this.sizeZ);
    generator = function(x, y, z){ return new Block(x == block.x && y == block.y && z == 0); }
  }

  if(chunkPosition){
    var chunk = new Chunk(this._scene, generator, this.sizeX, this.sizeY, this.sizeZ);
    chunk.position.copy(chunkPosition);
    return;
  }

  // Rebuild updated chunk
  this.buffer[block.x][block.y][block.z].setVisibility(true);
  this._generateMesh();
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

  // Rebuild updated chunk
  this.buffer[block.x][block.y][block.z].setVisibility(false);
  this._generateMesh();
}
