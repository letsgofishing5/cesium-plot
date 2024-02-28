<template>
  <div id="cesiumContainer"></div>
  <div class="operater-btn">
    <button @click="drawPoint">点</button>
    <button @click="drawPoints">连续绘制点</button>
    <button @click="drawLine">线</button>
    <button @click="drawFace">面</button>
    <button @click="drawWord">文字</button>
    <button @click="drawClampWord">贴地文字</button>
    <button @click="drawArrow">箭头</button>
    <button @click="drawBrush">画笔</button>
    <button @click="selectMode">选中模式</button>
    <button @click="loadGeoJson">导入</button>
    <button @click="exportGeoJson">导出</button>
    <button @click="cleanAll">清除</button>
  </div>
</template>
<script setup lang="ts">
import { GeoJson } from "@/lib/plot/types";
import { Plot } from "cesium-plot";
import { onMounted } from "vue";
let plot: any;
onMounted(async () => {
  // 修改默认定位为中国
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
    75.0, // 东
    0.0, // 南
    140.0, // 西
    60.0 // 北
  );
  const viewer = new Cesium.Viewer("cesiumContainer", {
    geocoder: false, //控制窗口是否显示搜索框
    homeButton: false, //控制回到主页按钮是否显示
    animation: false, //控制底下的动画控制控件是否显示
    fullscreenButton: false, //控制底下全屏按钮是否显示
    sceneModePicker: false, //控制场景控制器（二维|三维地图）是否显示
    timeline: false, //控制时间轴是否显示
    navigationHelpButton: false, //控制导航帮助提示按钮（带问号的那个方框）是否显示
    baseLayerPicker: false, //控制地图选择器（可以选择多种地图的方框按钮）是否显示
    infoBox: false,
    selectionIndicator: false,
    baseLayer: new Cesium.ImageryLayer( //开启默认底图（天地图）
      new Cesium.UrlTemplateImageryProvider({
        url: `https://t4.tianditu.gov.cn/DataServer?tk=f729bf2a987c252d389f4e89ade8c297&T=img_w&x={x}&y={y}&l={z}`,
        maximumLevel: 18,
      }),
      {
        gamma: 0.6, //指定图像的伽马值，可以调整图像的色彩和对比度。
        saturation: 1.4, //图层饱和度
        brightness: 0.9, //指定图像的亮度，可以调整图像的整体亮度。
        contrast: 1, //指定图像的对比度，可以调整图像的明暗程度。
      }
    ),
    terrainProvider: await Cesium.CesiumTerrainProvider.fromUrl(
      "https://data.mars3d.cn/terrain",
      {
        requestMetadata: false,
      }
    ),
  });
  // 关闭鼠标双击entity时，摄像机移动效果
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  plot = new Plot({ viewer });
  plot.on("created", (params: any) => {
    console.log("params:", params);
  });
});
let exportData: GeoJson[] = [];
function drawPoint() {
  plot.changeMode("Point", false);
}
function drawPoints() {
  // 第二个参数默认为true，即连续绘制，设置为false则不能连绘
  plot.changeMode("Point");
}
function drawLine() {
  plot.changeMode("Polyline", false);
}
function drawFace() {
  plot.changeMode("Polygon");
}
function drawWord() {
  plot.changeMode("Label");
}
function drawClampWord() {
  plot.changeMode("LabelClamp");
}
function drawArrow() {
  plot.changeMode("PolygonArrow");
}
function drawBrush() {
  plot.changeMode("Pencil");
}
function selectMode() {
  plot.changeMode();
}
function loadGeoJson() {
  if (!exportData.length) {
    return alert("请先导出数据");
  }
  plot.load(exportData);
}
function exportGeoJson() {
  exportData = plot.export();
  console.log("导出数据：", exportData);
}
function cleanAll() {
  plot.removeAll();
}
</script>
<style scoped>
.operater-btn {
  position: absolute;
  top: 100px;
  left: 100px;
  z-index: 10;
}
</style>
