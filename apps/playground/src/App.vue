<template>
  <div id="cesiumContainer"></div>

  <aside class="panel">
    <header class="panel__head">
      <div class="panel__title">cesium-plot</div>
      <span class="badge">{{ modeLabel }}</span>
    </header>

    <div class="group">
      <div class="group__label">绘制</div>
      <div class="group__grid">
        <button type="button" :class="{ active: mode === 'Point' }" @click="drawPoint">点</button>
        <button type="button" :class="{ active: mode === 'Points' }" @click="drawPoints">
          连续点
        </button>
        <button type="button" :class="{ active: mode === 'Polyline' }" @click="drawLine">线</button>
        <button type="button" :class="{ active: mode === 'Polygon' }" @click="drawFace">面</button>
        <button type="button" :class="{ active: mode === 'Label' }" @click="drawWord">文字</button>
        <button type="button" :class="{ active: mode === 'LabelClamp' }" @click="drawClampWord">
          贴地文字
        </button>
        <button type="button" :class="{ active: mode === 'PolygonArrow' }" @click="drawArrow">
          箭头
        </button>
        <button type="button" :class="{ active: mode === 'Pencil' }" @click="drawBrush">画笔</button>
      </div>
    </div>

    <div class="group">
      <div class="group__label">操作</div>
      <div class="group__grid group__grid--actions">
        <button type="button" :class="{ active: mode === 'Select' }" @click="selectMode">
          选中模式
        </button>
        <button type="button" @click="loadGeoJson">导入</button>
        <button type="button" @click="exportGeoJson">导出</button>
        <button type="button" class="danger" @click="cleanAll">清除</button>
      </div>
    </div>

    <footer class="panel__foot">{{ hint }}</footer>
  </aside>

  <transition name="toast">
    <div v-if="toast" class="toast">{{ toast }}</div>
  </transition>
</template>

<script setup lang="ts">
import * as Cesium from "cesium";
import { Plot, type GeoJson } from "cesium-plot";
import { computed, onMounted, ref } from "vue";

let plot: Plot;

const mode = ref("Select");
const toast = ref("");
const hint = ref("单击「点」开始绘制");

const modeLabel = computed(() => (mode.value === "Points" ? "Point（连续）" : mode.value));

let toastTimer: ReturnType<typeof setTimeout> | undefined;
function showToast(text: string) {
  toast.value = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 1800);
}

/**
 * 默认底图（天地图）
 */
function createBaseLayer() {
  return new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: `https://t4.tianditu.gov.cn/DataServer?tk=f729bf2a987c252d389f4e89ade8c297&T=img_w&x={x}&y={y}&l={z}`,
      maximumLevel: 18,
    }),
    {
      gamma: 0.6, //指定图像的伽马值
      saturation: 1.4, //图层饱和度
      brightness: 0.9, //指定图像的亮度
      contrast: 1, //指定图像的对比度
    }
  );
}

/**
 * 地形服务加载失败时降级为椭球体，避免整个演示白屏
 */
async function createTerrain() {
  try {
    return await Cesium.CesiumTerrainProvider.fromUrl("https://data.mars3d.cn/terrain", {
      requestMetadata: false,
    });
  } catch (error) {
    console.warn("[playground] 地形服务不可用，已降级为椭球体", error);
    return undefined;
  }
}

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
    baseLayer: createBaseLayer(),
    terrainProvider: await createTerrain(),
  });
  // 关闭鼠标双击entity时，摄像机移动效果
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  plot = new Plot({ viewer });
  plot.on("created", ({ geojson }) => {
    console.log("created:", geojson.featureConstructorName, geojson.properties.style);
  });
});

let exportData: GeoJson = { type: "FeatureCollection", features: [] };

function drawPoint() {
  plot.changeMode("Point", false);
  mode.value = "Point";
  hint.value = "单击确定点位置，仅绘制一次";
}

function drawPoints() {
  // 第二个参数默认为true，即连续绘制，设置为false则不能连绘
  plot.changeMode("Point");
  mode.value = "Points";
  hint.value = "连续绘制，右键回撤，切换模式结束";
}
function drawLine() {
  plot.changeMode("Polyline", false);
  mode.value = "Polyline";
  hint.value = "单击确定起点，双击完成绘制";
}
function drawFace() {
  plot.changeMode("Polygon");
  mode.value = "Polygon";
  hint.value = "单击确定起点，双击完成绘制";
}
function drawWord() {
  plot.changeMode("Label");
  mode.value = "Label";
  hint.value = "单击确定文字位置";
}
function drawClampWord() {
  plot.changeMode("LabelClamp");
  mode.value = "LabelClamp";
  hint.value = "单击起点，移动鼠标确定范围";
}
function drawArrow() {
  plot.changeMode("PolygonArrow");
  mode.value = "PolygonArrow";
  hint.value = "单击起点，再次单击确定箭头";
}
function drawBrush() {
  plot.changeMode("Pencil");
  mode.value = "Pencil";
  hint.value = "按住左键移动绘制，松开结束";
}
function selectMode() {
  plot.changeMode();
  mode.value = "Select";
  hint.value = "可选中图元并拖拽编辑，右键删除";
}
function loadGeoJson() {
  console.log("导入：", exportData);
  if (!exportData?.features?.length) {
    showToast("请先导出数据");
    return;
  }
  plot.load(exportData);
  showToast(`已导入 ${exportData.features.length} 个图元`);
}
function exportGeoJson() {
  exportData = plot.export();
  console.log("导出数据：", exportData);
  showToast(`已导出 ${exportData.features.length} 个图元`);
}
function cleanAll() {
  plot.removeAll();
  showToast("已清除全部图元");
}
</script>

<style scoped>
#cesiumContainer {
  position: absolute;
  inset: 0;
  background: #0b1220;
}

.panel {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  width: 232px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  font-size: 13px;
  user-select: none;
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel__title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.4px;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  color: #7dd3fc;
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.group + .group {
  margin-top: 12px;
}

.group__label {
  margin-bottom: 6px;
  font-size: 11px;
  color: #94a3b8;
  letter-spacing: 1px;
}

.group__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.group__grid--actions {
  grid-template-columns: repeat(2, 1fr);
}

.panel button {
  padding: 7px 8px;
  border-radius: 8px;
  font-size: 12px;
  color: #cbd5e1;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.18);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.panel button:hover {
  background: rgba(148, 163, 184, 0.22);
  color: #f8fafc;
}

.panel button.active {
  color: #f0f9ff;
  background: rgba(56, 189, 248, 0.22);
  border-color: rgba(56, 189, 248, 0.6);
}

.panel button.danger:hover {
  color: #fecaca;
  background: rgba(248, 113, 113, 0.18);
  border-color: rgba(248, 113, 113, 0.5);
}

.panel__foot {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  font-size: 11px;
  line-height: 1.5;
  color: #94a3b8;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 40px;
  z-index: 20;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 12px;
  color: #0f172a;
  background: rgba(226, 232, 240, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
