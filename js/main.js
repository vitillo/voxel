function display(){
  var scene = new THREE.Scene(); 
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); 
  var renderer = new THREE.WebGLRenderer(); 

  renderer.setSize(window.innerWidth, window.innerHeight); 
  document.body.appendChild(renderer.domElement);

  var light = new THREE.PointLight(0xBBBBBB, 1, 1000);
  var ambient = new THREE.AmbientLight(0x444444);
  light.position.set(10.0, 0.0, 10.0);
  scene.add(light);
  scene.add(ambient);

  var chunk = new Chunk(scene, function(x, y, z){
    var center = new THREE.Vector3(this.sizeX/2, this.sizeY/2, this.sizeZ/2);
    var distance = center.sub(new THREE.Vector3(x + 0.5, y + 0.5, z - 0.5)).length();
    return new Block(distance <= 4.8);
  }, 10, 10, 10);

  camera.position.z = 10; 
  camera.position.y = 5;
  camera.position.x = 10;
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  var render = function () { 
    requestAnimationFrame(render); 
    renderer.render(scene, camera); 
  }; 
  render(); 

  var projector = new THREE.Projector();
  var raycaster = new THREE.Raycaster();

  $(document).mousedown(function(e){
    x = 2*(e.clientX/window.innerWidth) - 1;
    y = -2*(e.clientY/window.innerHeight) + 1;

    var vector = new THREE.Vector3(x, y, 1);
    projector.unprojectVector(vector, camera);
    raycaster.set(camera.position, vector.sub(camera.position).normalize(), 1, 100000);

    var intersects = raycaster.intersectObjects(scene.children, true);
    var direction = new THREE.Vector4(-vector.x, -vector.y, -vector.z, 0);

    if(intersects.length){

      if(e.which == 1)
        intersects[0].object.userData['chunk'].addBlock(intersects[0].point, direction);
      else if(e.which == 3)
        intersects[0].object.userData['chunk'].removeBlock(intersects[0].point, direction);
    }
  })
}
