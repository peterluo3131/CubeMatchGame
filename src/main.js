import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/addons/controls/DragControls.js";
import { TransformControls } from "../module/TransformControls.js";
import { Vector3 } from "three";

//meshes
let scene, camera, renderer;
let cube1, cube2, cube3, cube4;
let outline_cube;
let target_cube1, target_cube2, target_cube3, target_cube4;
let result_cube1, result_cube2, result_cube3, result_cube4;

//controls
let drag_controls, controls, transform_control;

//html elements
const timeStartBtn = document.getElementById("time_start_btn");
const timeStopBtn = document.getElementById("time_stop_btn");

let durationSpan = document.getElementById("duration");

//const
const FIRST = 0;
const SECOND = 1;
const THIRD = 2;
const FOURTH = 3;

const MOVE_MODE = 0;
const ROTATE_MODE = 1;

const CUBE_1 = "cube1";
const CUBE_2 = "cube2";
const CUBE_3 = "cube3";
const CUBE_4 = "cube4";

const START = "Start";
const PAUSE = "Pause";
const RESUME = "Resume";
const RESET = "Reset";

const POS_MAIN_FIRST = new THREE.Vector3(100, 25, 400);
const POS_MAIN_SECOND = new THREE.Vector3(200, 25, 400);
const POS_MAIN_THIRD = new THREE.Vector3(100, 25, 500);
const POS_MAIN_FOURTH = new THREE.Vector3(200, 25, 500);

const POS_TARGET_FIRST = new THREE.Vector3(300, -1, 400);
const POS_TARGET_SECOND = new THREE.Vector3(350, -1, 400);
const POS_TARGET_THIRD = new THREE.Vector3(300, -1, 450);
const POS_TARGET_FOURTH = new THREE.Vector3(350, -1, 450);

const POS_RES_FIRST = new THREE.Vector3(300, 25, 200);
const POS_RES_SECOND = new THREE.Vector3(350, 25, 200);
const POS_RES_THIRD = new THREE.Vector3(300, 25, 250);
const POS_RES_FOURTH = new THREE.Vector3(350, 25, 250);

//status variables
let selected_cube_number = FIRST;
let isStart = false;
let isTransMode = MOVE_MODE;
let curCubePos = [0, 0, 0, 0];
let timeStatus = START;
let oldClickName = "";

//loader
let loader = new THREE.TextureLoader();

//initstate
let initPositionState = [0, 1, 2, 3];
let initRotateState = [0, 1, 2, 3];

//object array
let targetArray, cubeArray, matsArray, resultArray, positionArray;

//clock
let clock = new THREE.Clock();
let tracktime = 0;

//materials
let matsorder1 = [
  "./images/rectangle.png",
  "./images/empty.png",
  "./images/triangle.png",
  "./images/empty.png",
  "./images/triangle.png",
  "./images/rectangle.png",
];

let matsorder2 = [
  "./images/rectangle.png",
  "./images/triangle.png",
  "./images/empty.png",
  "./images/rectangle.png",
  "./images/triangle.png",
  "./images/empty.png",
];

let matsorder3 = [
  "./images/rectangle.png",
  "./images/empty.png",
  "./images/triangle.png",
  "./images/triangle.png",
  "./images/empty.png",
  "./images/rectangle.png",
];

let matsorder4 = [
  "./images/triangle.png",
  "./images/rectangle.png",
  "./images/empty.png",
  "./images/rectangle.png",
  "./images/triangle.png",
  "./images/empty.png",
];

init();
animate();

function init() {
  //camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    100000
  );
  camera.position.set(260, 400, 800);
  camera.lookAt(0, 0, 0);

  //scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);

  //renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  //camera control
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(260, 0, 375);
  controls.update();

  //init controller
  transform_control = new TransformControls(camera, renderer.domElement);

  //reSo ize
  window.addEventListener("resize", onWindowResize);

  //sky box
  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load("./images/skybox/1.png");
  let texture_bk = new THREE.TextureLoader().load("./images/skybox/2.png");
  let texture_up = new THREE.TextureLoader().load("./images/skybox/3.png");
  let texture_dn = new THREE.TextureLoader().load("./images/skybox/4.png");
  let texture_rt = new THREE.TextureLoader().load("./images/skybox/5.png");
  let texture_lf = new THREE.TextureLoader().load("./images/skybox/6.png");

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

  for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

  let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  skybox.name = "skybox";
  scene.add(skybox);

  //light
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(300, 500, 300);
  scene.add(hemiLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(80, 300, 80);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.top = 800;
  directionalLight.shadow.camera.bottom = -800;
  directionalLight.shadow.camera.left = -800;
  directionalLight.shadow.camera.right = 800;
  scene.add(directionalLight);

  // ground
  const bg_ground = loader.load("./images/bg_ground.png");

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(500, 500),
    new THREE.MeshStandardMaterial({ map: bg_ground })
  );
  ground.position.set(250, -2, 350);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  //create materials at random
  let order = getRandomArray();

  let matsorderarray = [matsorder1, matsorder2, matsorder3, matsorder4];

  for (let i = 0; i < 4; i++) {
    for (let m = 0; m < order[i]; m++) {
      let st = matsorderarray[i][0];
      for (let j = 0; j < 5; j++) {
        matsorderarray[i][j] = matsorderarray[i][j + 1];
      }
      matsorderarray[i][5] = st;
    }
  }

  //cube materials
  let cubemats1 = matsorder1.map((pic) => {
    return new THREE.MeshLambertMaterial({ map: loader.load(pic) });
  });

  let cubemats2 = matsorder2.map((pic) => {
    return new THREE.MeshLambertMaterial({ map: loader.load(pic) });
  });

  let cubemats3 = matsorder3.map((pic) => {
    return new THREE.MeshLambertMaterial({ map: loader.load(pic) });
  });

  let cubemats4 = matsorder4.map((pic) => {
    return new THREE.MeshLambertMaterial({ map: loader.load(pic) });
  });

  matsArray = [cubemats1, cubemats2, cubemats3, cubemats4];

  // main cube
  const geometry = new THREE.BoxGeometry(50, 50, 50);

  cube1 = new THREE.Mesh(geometry, matsArray[0]);
  cube1.castShadow = true;
  cube1.position.set(POS_MAIN_FIRST);
  cube1.name = CUBE_1;
  scene.add(cube1);
  scene.add(transform_control);

  cube2 = new THREE.Mesh(geometry, matsArray[1]);
  cube2.castShadow = true;
  cube2.position.set(POS_MAIN_SECOND);
  cube2.name = CUBE_2;
  scene.add(cube2);

  cube3 = new THREE.Mesh(geometry, matsArray[2]);
  cube3.castShadow = true;
  cube3.position.set(POS_MAIN_THIRD);
  cube3.name = CUBE_3;
  scene.add(cube3);

  cube4 = new THREE.Mesh(geometry, matsArray[3]);
  cube4.castShadow = true;
  cube4.position.set(POS_MAIN_FOURTH);
  cube4.name = CUBE_4;
  scene.add(cube4);

  cubeArray = [cube1, cube2, cube3, cube4];

  //outline cube
  const outlinematerial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    side: THREE.BackSide,
  });
  outline_cube = new THREE.Mesh(geometry, outlinematerial);
  outline_cube.position.copy(cube1.position);
  outline_cube.scale.multiplyScalar(1.05);
  scene.add(outline_cube);

  // target cubes
  const targetMaterial = new THREE.MeshPhongMaterial({
    color: 0x984c0c,
  });

  const target_geometry = new THREE.PlaneGeometry(50, 50);

  target_cube1 = new THREE.Mesh(target_geometry, targetMaterial);
  target_cube1.castShadow = true;
  target_cube1.position.set(
    POS_TARGET_FIRST.x,
    POS_TARGET_FIRST.y,
    POS_TARGET_FIRST.z
  );
  target_cube1.rotation.x = -Math.PI / 2;
  scene.add(target_cube1);

  target_cube2 = new THREE.Mesh(target_geometry, targetMaterial);
  target_cube2.castShadow = true;
  target_cube2.position.set(
    POS_TARGET_SECOND.x,
    POS_TARGET_SECOND.y,
    POS_TARGET_SECOND.z
  );
  target_cube2.rotation.x = -Math.PI / 2;
  scene.add(target_cube2);

  target_cube3 = new THREE.Mesh(target_geometry, targetMaterial);
  target_cube3.castShadow = true;
  target_cube3.position.set(
    POS_TARGET_THIRD.x,
    POS_TARGET_THIRD.y,
    POS_TARGET_THIRD.z
  );
  target_cube3.rotation.x = -Math.PI / 2;
  scene.add(target_cube3);

  target_cube4 = new THREE.Mesh(target_geometry, targetMaterial);
  target_cube4.castShadow = true;
  target_cube4.position.set(
    POS_TARGET_FOURTH.x,
    POS_TARGET_FOURTH.y,
    POS_TARGET_FOURTH.z
  );
  target_cube4.rotation.x = -Math.PI / 2;
  scene.add(target_cube4);

  targetArray = [target_cube1, target_cube2, target_cube3, target_cube4];

  // result cubes
  result_cube1 = new THREE.Mesh(geometry, matsArray[0]);
  result_cube1.castShadow = true;
  result_cube1.position.set(POS_RES_FIRST.x, POS_RES_FIRST.y, POS_RES_FIRST.z);
  scene.add(result_cube1);

  result_cube2 = new THREE.Mesh(geometry, matsArray[1]);
  result_cube2.castShadow = true;
  result_cube2.position.set(
    POS_RES_SECOND.x,
    POS_RES_SECOND.y,
    POS_RES_SECOND.z
  );
  scene.add(result_cube2);

  result_cube3 = new THREE.Mesh(geometry, matsArray[2]);
  result_cube3.castShadow = true;
  result_cube3.position.set(POS_RES_THIRD.x, POS_RES_THIRD.y, POS_RES_THIRD.z);
  scene.add(result_cube3);

  result_cube4 = new THREE.Mesh(geometry, matsArray[3]);
  result_cube4.castShadow = true;
  result_cube4.position.set(
    POS_RES_FOURTH.x,
    POS_RES_FOURTH.y,
    POS_RES_FOURTH.z
  );
  scene.add(result_cube4);

  resultArray = [result_cube1, result_cube2, result_cube3, result_cube4];

  //generate random result
  generateRandomResult();

  //setting init cube
  selected_cube_number = initPositionState[0];
  outline_cube.position.copy(cubeArray[initPositionState[0]]);
  transform_control.attach(cubeArray[initPositionState[0]]);

  //mousedown
  document.addEventListener("mouseup", onDocumentMouseUp, false);
  document.addEventListener("mousedown", onDocumentMouseDown, false);
  document.addEventListener("dblclick", ondblclick, false);

  //transform control
  transform_control.setSize(0.7);
  setVisibleTransformController(false);
  transform_control.setMode("rotate");
  transform_control.addEventListener("change", function (event) {
    outline_cube.rotation.copy(cubeArray[selected_cube_number].rotation);
  });

  transform_control.addEventListener("dragging-changed", function (event) {
    controls.enabled = !event.value;
    drag_controls.enabled = !event.value;
    rotatingChanged();
  });

  //drag_controller
  drag_controls = new DragControls(cubeArray, camera, renderer.domElement);
  drag_controls.addEventListener("dragstart", function (event) {
    controls.enabled = false;
    outline_cube.position.copy(event.object.position);
  });
  drag_controls.addEventListener("drag", function (event) {
    setVisibleTransformController(false);
    controls.enabled = false;
    event.object.position.y = 25;
    outline_cube.position.copy(event.object.position);
  });
  drag_controls.addEventListener("dragend", function (event) {
    controls.enabled = true;
    outline_cube.position.copy(event.object.position);
    cubeArray = [cube1, cube2, cube3, cube4];

    switch (selected_cube_number) {
      case FIRST:
        isInTarget(cube1, targetArray);
        break;
      case SECOND:
        isInTarget(cube2, targetArray);
        break;
      case THIRD:
        isInTarget(cube3, targetArray);
        break;
      case FOURTH:
        isInTarget(cube4, targetArray);
        break;
    }

    if (isAllInTarget()) {
      if (checkResult(cubeArray, targetArray)) {
        restart();
      }
    }
  });
}

function rotatingChanged() {
  let x =
    Math.round(cubeArray[selected_cube_number].rotation.x / (Math.PI / 2)) *
    (Math.PI / 2);
  let y =
    Math.round(cubeArray[selected_cube_number].rotation.y / (Math.PI / 2)) *
    (Math.PI / 2);
  let z =
    Math.round(cubeArray[selected_cube_number].rotation.z / (Math.PI / 2)) *
    (Math.PI / 2);
  cubeArray[selected_cube_number].rotation.set(x, y, z);

  if (isAllInTarget()) {
    if (checkResult(cubeArray, targetArray)) {
      restart();
    }
  }
}

function ondblclick(event) {
  transform_control.detach(cube1);
  transform_control.detach(cube2);
  transform_control.detach(cube3);
  transform_control.detach(cube4);
  var raycaster = new THREE.Raycaster(); // create once
  var mouse = new THREE.Vector2(); // create once

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);

  for (let i = intersects.length - 1; i >= 0; i--) {
    if (
      !(
        intersects[i].hasOwnProperty("object") &&
        intersects[i].object.hasOwnProperty("name")
      )
    )
      continue;
    let target_name = intersects[i].object.name;
    if (target_name.includes("cube")) {
      outline_cube.position.copy(intersects[i].object.position);
      switch (target_name) {
        case CUBE_1:
          selected_cube_number = FIRST;
          transform_control.attach(cube1);
          break;
        case CUBE_2:
          selected_cube_number = SECOND;
          transform_control.attach(cube2);
          break;
        case CUBE_3:
          selected_cube_number = THIRD;
          transform_control.attach(cube3);
          break;
        case CUBE_4:
          selected_cube_number = FOURTH;
          transform_control.attach(cube4);
          break;
      }
      if (isTransMode == MOVE_MODE) {
        switchTransMode();
      }
    }
  }
}

function switchTransMode() {
  if (isTransMode == MOVE_MODE) {
    isTransMode = ROTATE_MODE;
    setVisibleTransformController(true);
  } else {
    isTransMode = MOVE_MODE;
    setVisibleTransformController(false);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (isStart) {
    tracktime += clock.getDelta();
    displayDuration();
  }

  renderer.render(scene, camera);
}

function onDocumentMouseUp(event) {
  var raycaster = new THREE.Raycaster(); // create once
  var mouse = new THREE.Vector2(); // create once

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);

  for (let i = intersects.length - 1; i >= 0; i--) {
    if (
      !(
        intersects[i].hasOwnProperty("object") &&
        intersects[i].object.hasOwnProperty("name")
      )
    )
      continue;
    if (oldClickName == "skybox") {
      if (isTransMode == ROTATE_MODE) {
        isTransMode = MOVE_MODE;
      }
      setVisibleTransformController(false);
    }
  }
}

function onDocumentMouseDown(event) {
  var raycaster = new THREE.Raycaster(); // create once
  var mouse = new THREE.Vector2(); // create once

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    if (
      !(
        intersects[i].hasOwnProperty("object") &&
        intersects[i].object.hasOwnProperty("name")
      )
    )
      continue;
    let target_name = intersects[i].object.name;
    let flag = 0;
    for (let j = intersects.length - 1; j >= 0; j--) {
      if (
        intersects[j].object.name.length > 0 &&
        intersects[j].object.name != "skybox"
      ) {
        flag = 1;
      }
    }
    if (flag == 0) {
      setVisibleTransformController(false);
      if (isTransMode == ROTATE_MODE) {
        isTransMode = MOVE_MODE;
      }
    } else {
      oldClickName = "none";
    }
    if (target_name.includes("cube")) {
      outline_cube.position.copy(intersects[i].object.position);
      switch (target_name) {
        case CUBE_1:
          if (isTransMode == ROTATE_MODE && selected_cube_number != FIRST)
            switchTransMode();
          selected_cube_number = FIRST;
          transform_control.attach(cube1);
          break;
        case CUBE_2:
          if (isTransMode == ROTATE_MODE && selected_cube_number != SECOND)
            switchTransMode();
          selected_cube_number = SECOND;
          transform_control.attach(cube2);
          break;
        case CUBE_3:
          if (isTransMode == ROTATE_MODE && selected_cube_number != THIRD)
            switchTransMode();
          selected_cube_number = THIRD;
          transform_control.attach(cube3);
          break;
        case CUBE_4:
          if (isTransMode == ROTATE_MODE && selected_cube_number != FOURTH)
            switchTransMode();
          selected_cube_number = FOURTH;
          transform_control.attach(cube4);
          break;
      }
      if (isTransMode == ROTATE_MODE) setVisibleTransformController(true);
      else setVisibleTransformController(false);
      return;
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomArray() {
  let random_array_flag = [0, 0, 0, 0];
  let result = [];
  while (true) {
    let ranId = getRandomInt(4);
    if (!random_array_flag[ranId]) {
      random_array_flag[ranId] = 1;
      result.push(ranId);
      if (result.length == 4) {
        return result;
      }
    }
  }
}

function generateRandomResult() {
  initPositionState = getRandomArray();
  positionArray = [
    POS_MAIN_FIRST,
    POS_MAIN_SECOND,
    POS_MAIN_THIRD,
    POS_MAIN_FOURTH,
  ];

  initRotateState = [];
  for (let r = 0; r < 4; r++) {
    let rot = {
      x: getRandomInt(4),
      y: getRandomInt(4),
      z: getRandomInt(4),
    };
    initRotateState.push(rot);
  }

  cubeArray = [cube1, cube2, cube3, cube4];
  for (let j = 0; j < 4; j++) {
    cubeArray[j].rotateX((initRotateState[j].x * Math.PI) / 2 - Math.PI);
    cubeArray[j].rotateY((initRotateState[j].y * Math.PI) / 2 - Math.PI);
    cubeArray[j].rotateZ((initRotateState[j].z * Math.PI) / 2 - Math.PI);
  }

  for (let i = 0; i < 4; i++) {
    let pos = positionArray[initPositionState[i]];
    cubeArray[i].position.set(pos.x, pos.y, pos.z);
  }
}

function isContain(x, z, pos) {
  if (x > pos.x - 25 && z > pos.z - 25 && x < pos.x + 25 && z < pos.z + 25)
    return true;
  return false;
}

function isInTarget(MovingCube, targetArray) {
  let x = MovingCube.position.x;
  let z = MovingCube.position.z;
  if (x == POS_TARGET_FIRST.x && z == POS_TARGET_FIRST.z) return;
  else if (x == POS_TARGET_SECOND.x && z == POS_TARGET_SECOND.z) return;
  else if (x == POS_TARGET_THIRD.x && z == POS_TARGET_THIRD.z) return;
  else if (x == POS_TARGET_FOURTH.x && z == POS_TARGET_FOURTH.z) return;
  if (isContain(x, z, POS_TARGET_FIRST)) {
    MovingCube.position.copy(targetArray[0].position);
    outline_cube.position.copy(targetArray[0].position);

    MovingCube.position.y = 25;
    outline_cube.position.y = 25;
  } else if (isContain(x, z, POS_TARGET_SECOND)) {
    MovingCube.position.copy(targetArray[1].position);
    outline_cube.position.copy(targetArray[1].position);

    MovingCube.position.y = 25;
    outline_cube.position.y = 25;
  } else if (isContain(x, z, POS_TARGET_THIRD)) {
    MovingCube.position.copy(targetArray[2].position);
    outline_cube.position.copy(targetArray[2].position);

    MovingCube.position.y = 25;
    outline_cube.position.y = 25;
  } else if (isContain(x, z, POS_TARGET_FOURTH)) {
    MovingCube.position.copy(targetArray[3].position);
    outline_cube.position.copy(targetArray[3].position);

    MovingCube.position.y = 25;
    outline_cube.position.y = 25;
  }
}

function checkResult(cubeArray, targetArray) {
  cubeArray = [cube1, cube2, cube3, cube4];
  for (let i = 0; i < 4; i++) {
    if (curCubePos[i] != i) {
      return false;
    }

    if (
      Math.abs(cubeArray[i].rotation.x) +
        Math.abs(cubeArray[i].rotation.y) +
        Math.abs(cubeArray[i].rotation.z) >
      0
    ) {
      return false;
    }
  }

  return true;
}

function initGameStatus() {
  document.getElementById("success").style.visibility = "hidden";
  isStart = false;
  selected_cube_number = FIRST;
  outline_cube.position.copy(cubeArray[selected_cube_number]);
  randomMat();
  generateRandomResult();
  transform_control.attach(cube1);
}

function restart() {
  document.getElementById("success").style.visibility = "visible";
  isStart = false;
  clock.stop();
  timeStartBtn.innerText = RESET;
  timeStatus = RESET;
}

function displayDuration() {
  let totaltime = Math.floor(tracktime * 100);
  let mini_sec = totaltime % 100;
  totaltime = Math.floor(totaltime / 100);
  let sec = totaltime % 60;
  totaltime = Math.floor(totaltime / 60);
  let min = totaltime % 60;
  totaltime = Math.floor(totaltime / 60);
  let hour = totaltime;
  let strDuration =
    (hour < 10 ? "0" + hour : hour) +
    ":" +
    (min < 10 ? "0" + min : min) +
    ":" +
    (sec < 10 ? "0" + sec : sec);
  durationSpan.innerHTML = strDuration;
}

function setVisibleTransformController(status) {
  transform_control.showX = status;
  transform_control.showY = status;
  transform_control.showZ = status;
}

function isAllInTarget() {
  cubeArray = [cube1, cube2, cube3, cube4];
  for (let i = 0; i < 4; i++) {
    let x = cubeArray[i].position.x;
    let z = cubeArray[i].position.z;
    if (isContain(x, z, POS_TARGET_FIRST)) {
      curCubePos[0] = i;
    } else if (isContain(x, z, POS_TARGET_SECOND)) {
      curCubePos[1] = i;
    } else if (isContain(x, z, POS_TARGET_THIRD)) {
      curCubePos[2] = i;
    } else if (isContain(x, z, POS_TARGET_FOURTH)) {
      curCubePos[3] = i;
    } else {
      return false;
    }
  }
  return true;
}

function randomMat() {
  let order = getRandomArray();
  let matsorderarray = [matsorder1, matsorder2, matsorder3, matsorder4];

  for (let i = 0; i < 4; i++) {
    for (let m = 0; m < order[i]; m++) {
      let st = matsorderarray[i][0];
      for (let j = 0; j < 5; j++) {
        matsorderarray[i][j] = matsorderarray[i][j + 1];
      }
      matsorderarray[i][5] = st;
    }
  }

  let cubemats1 = matsorder1.map((pic) => {
    return new THREE.MeshLambertMaterial({ map: loader.load(pic) });
  });

  let cubemats2 = matsorder2.map((pic) => {
    return new THREE.MeshLambertMaterial({ map: loader.load(pic) });
  });

  let cubemats3 = matsorder3.map((pic) => {
    return new THREE.MeshLambertMaterial({ map: loader.load(pic) });
  });

  let cubemats4 = matsorder4.map((pic) => {
    return new THREE.MeshLambertMaterial({ map: loader.load(pic) });
  });

  matsArray = [cubemats1, cubemats2, cubemats3, cubemats4];
  for (let i = 0; i < 4; i++) {
    cubeArray[i].material = matsArray[i];
    resultArray[i].material = matsArray[i];
  }
}

timeStartBtn.onclick = function () {
  switch (timeStatus) {
    case START:
      timeStopBtn.style.display = "block";
      isStart = true;
      clock.start();
      tracktime = 0;
      timeStartBtn.innerText = PAUSE;
      timeStatus = PAUSE;
      break;
    case PAUSE:
      clock.stop();
      timeStartBtn.innerText = RESUME;
      timeStatus = RESUME;
      break;
    case RESUME:
      clock.start();
      timeStartBtn.innerText = PAUSE;
      timeStatus = PAUSE;
      break;
    case RESET:
      durationSpan.innerHTML = "00:00:00";
      timeStartBtn.innerText = START;
      timeStopBtn.style.display = "none";
      timeStatus = START;
      tracktime = 0;
      initGameStatus();
      break;
  }
};

timeStopBtn.onclick = function () {
  timeStopBtn.style.display = "none";
  timeStatus = START;
  timeStartBtn.innerText = START;
  tracktime = 0;
  clock.stop();
};
