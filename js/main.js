function main(){
  var scene = new THREE.Scene(); 
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); 
  var renderer = new THREE.WebGLRenderer(); 

  renderer.setSize(window.innerWidth, window.innerHeight); 
  document.body.appendChild(renderer.domElement);

  var clock = new THREE.Clock();
  var light = new THREE.DirectionalLight(0xFFFFFF);
  var ambient = new THREE.AmbientLight(0x333333);
  light.position.set(0, 550.0, 1);
  scene.add(light);
  scene.add(ambient);

  var cameraWrapper = new THREE.Object3D();
  cameraWrapper.add(camera);
  scene.add(cameraWrapper);

  camera.position.z = 120; 
  camera.position.y = 100;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var terrain = new Terrain(scene, new THREE.Vector3(15, 15, 3), new THREE.Vector3(10, 10, 10));

  var render = function () {
    cameraWrapper.rotation.y += 0.1 * clock.getDelta();
    requestAnimationFrame(render); 
    renderer.render(scene, camera); 
  }; 

  render(); 
}
