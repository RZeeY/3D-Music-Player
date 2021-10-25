import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ThreeMeshUI from 'three-mesh-ui';
import audio1 from '../../assets/audio/1.mp3';
import audio2 from '../../assets/audio/2.mp3';
import audio3 from '../../assets/audio/3.mp3';
import a from '../../assets/font/Roboto-msdf.json';
import b from '../../assets/font/Roboto-msdf.png';
import { ref, reactive, onMounted } from 'vue';

export default {
  data() {
    return {};
  },
  setup() {
    const audioList = [
      {
        title: 'Take On Me',
        url: audio1,
      },
      {
        title: 'Viva La Vida',
        url: audio2,
      },
      {
        title: 'Killer Queen',
        url: audio3,
      },
    ];
    const playerStatus = ref({
      activeIndex: 0,
      playing: false,
    });
    onMounted(() => {
      const mainContainer = document.querySelector('#mainCanvas');

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xefefdf);

      const light = new THREE.DirectionalLight(0xffffff, 1); // soft white light
      light.position.z = 1000;
      scene.add(light);

      const camera = new THREE.PerspectiveCamera(50, mainContainer.clientWidth / mainContainer.clientHeight, 1, 1000);
      camera.position.set(0, 0, 800);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // const helper = new THREE.GridHelper(160, 10);
      // helper.rotation.x = Math.PI / 2;
      // scene.add(helper);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
      mainContainer.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.minDistance = 100;
      controls.maxDistance = 1200;

      // 计算刻度坐标
      // x1 = x0 + r * cos(ao * PI / 180)
      // y1 = y0 + r * sin(ao * PI /180)
      const cubeCount = 60;
      const angleToRadian = function (angle) {
        return (Math.PI * angle) / 180;
      };
      let geometryColor = 0x6db011;
      const group = new THREE.Group();
      for (let i = 0; i < cubeCount; i++) {
        const geometry = new THREE.CylinderGeometry(8, 8, 1, 32);
        const material = new THREE.MeshToonMaterial({
          color: geometryColor,
        });
        const cube = new THREE.Mesh(geometry, material);
        const subGroup = new THREE.Group();
        subGroup.position.x = 180 * Math.cos((Math.PI * i * 360) / cubeCount / 180);
        subGroup.position.y = 180 * Math.sin((Math.PI * i * 360) / cubeCount / 180);
        subGroup.rotateZ(angleToRadian((i * 360) / cubeCount + 90));
        cube.position.y = -cube.geometry.parameters.height / 2;
        subGroup.add(cube);
        // const axesHelper = new THREE.AxesHelper(10);
        // subGroup.add(axesHelper);
        group.add(subGroup);
        if (i < cubeCount / 2) {
          geometryColor = geometryColor + 5;
        } else {
          geometryColor = geometryColor - 5;
        }
      }

      const textContainer = new ThreeMeshUI.Block({
        width: 250,
        height: 250,
        padding: 0,
        fontFamily: a,
        fontTexture: b,
        justifyContent: 'center',
        alignContent: 'center',
        backgroundOpacity: 0,
      });
      const text = new ThreeMeshUI.Text({
        fontColor: new THREE.Color(0x333333),
        fontSize: 32,
      });

      textContainer.add(text);

      scene.add(group);
      scene.add(textContainer);

      const stats = new Stats();
      mainContainer.appendChild(stats.dom);
      // audio.play();

      window.addEventListener('resize', onWindowResize);

      function onWindowResize() {
        camera.aspect = mainContainer.clientWidth / mainContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
      }

      let audio = null;
      let audioOutput = null;
      let audioAnalyser = null;

      function createAudio() {
        audio = new Audio(audioList[playerStatus.value.activeIndex].url);
        let audioContext = new AudioContext(audio);
        let audioSource = audioContext.createMediaElementSource(audio);
        audioAnalyser = audioContext.createAnalyser();
        audioSource.connect(audioAnalyser);
        audioAnalyser.connect(audioContext.destination);
        audioOutput = new Uint8Array(cubeCount);
        text.set({
          content: audioList[playerStatus.value.activeIndex].title,
        });
      }
      text.set({
        content: audioList[playerStatus.value.activeIndex].title,
      });
      // createAudio();

      document.querySelector('#play').addEventListener('click', function () {
        playerStatus.value.playing = !playerStatus.value.playing;
        if (playerStatus.value.playing) {
          if (!audio) {
            createAudio();
          }
          audio.play();
        } else {
          audio.pause();
        }
      });

      document.querySelector('#last').addEventListener('click', function () {
        if (playerStatus.value.activeIndex <= 0) {
          playerStatus.value.activeIndex = audioList.length - 1;
        } else {
          playerStatus.value.activeIndex--;
        }
        createAudio();
        audio.play();
      });

      document.querySelector('#next').addEventListener('click', function () {
        if (playerStatus.value.activeIndex >= audioList.length - 1) {
          playerStatus.value.activeIndex = 0;
        } else {
          playerStatus.value.activeIndex++;
        }
        createAudio();
        audio.play();
      });

      function render() {
        renderer.render(scene, camera);
      }

      let getAudioDataStep = 0;
      function animate() {
        requestAnimationFrame(animate);
        if (audioAnalyser) {
          audioAnalyser.getByteFrequencyData(audioOutput);
          if (getAudioDataStep % 1 === 0) {
            audioOutput.forEach((item, index) => {
              new TWEEN.Tween({
                y: group.children[index].scale.y,
              })
                .to(
                  {
                    y: item / 2.2,
                  },
                  50
                )
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(data => {
                  group.children[index].scale.y = data.y;
                })
                .start();
            });
            getAudioDataStep = 0;
          }
          getAudioDataStep++;
        }
        stats.update();
        ThreeMeshUI.update();
        TWEEN.update();
        render();
      }
      animate();
    });
    return {
      playerStatus,
    };
  },
};
