<template>
  <el-row>
    <el-col v-for="(item, index) of groupItems" :key="index" :span="8">
      <el-card shadow="hover" class="h-full">
        <div class="p-[10px]">
          <div>
            <div class="flex pb-[5px]">
              <component
                :is="item.icon"
                class="w-[26px]"
                :style="{
                  color: item.color
                }"
              />
              <div class="text-[16px] pl-[10px] text-MAIN_TEXT">
                {{ item.title }}
              </div>
            </div>
            <div class="text-[12px] text-TEXT_LIGHT2">
              {{ item.desc }}
            </div>
          </div>
          <div class="flex justify-between text-[12px] text-TEXT_LIGHT2">
            <div>{{ item.group }}</div>
            <div>{{ item.date }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
const groupItems: any[] = [
  {
    title: "Github",
    icon: "GithubOutlined",
    desc: "不要等待机会，而要创造机会。",
    group: "开源组",
    date: "2021-04-01"
  },
  {
    title: "Vue",
    icon: "CalculatorOutlined",
    color: "#409eff",
    desc: "现在的你决定将来的你。",
    group: "算法组",
    date: "2021-04-01"
  },
  {
    title: "HTML5",
    icon: "Html5Outlined",
    color: "#e18525",
    desc: "没有什么才能比努力更重要。",
    group: "上班摸鱼",
    date: "2021-04-01"
  },
  {
    title: "Angular",
    icon: "AliwangwangOutlined",
    color: "#bf0c2c",
    desc: "热情和欲望可以突破一切难关。",
    group: "UI",
    date: "2021-04-01"
  },
  {
    title: "React",
    icon: "ShareAltOutlined",
    color: "#00d8ff",
    desc: "健康的身体是实现目标的基石。",
    group: "技术牛",
    date: "2021-04-01"
  },
  {
    title: "Js",
    icon: "BugOutlined",
    color: "#EBD94E",
    desc: "路是走出来的，而不是空想出来的。",
    group: "架构组",
    date: "2021-04-01"
  }
];
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ProjectComponent"
});
</script>
