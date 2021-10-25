<template>
  <div class="container">
    <div id="mainCanvas" class="main-canvas"></div>
    <div class="control">
      <div id="last" class="icon last"></div>
      <div
        id="play"
        :class="{
          icon: true,
          play: true,
          playing: !playerStatus.playing,
          pause: playerStatus.playing,
        }"
        @click="handlePlayBtnClick"
      ></div>
      <div id="next" class="icon next"></div>
    </div>
  </div>
</template>

<script>
import Logic from './index';
export default Logic;
</script>

<style scoped lang="less">
@import './index.less';
</style>