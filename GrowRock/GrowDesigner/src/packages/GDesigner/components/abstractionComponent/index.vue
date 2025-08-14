<template>
  <template v-if="config.elType === 'basic' && !config.isChild">
    <basicComponent :config="config" :propsInfo="propsInfo" />
  </template>

  <template v-if="config.elType === 'eleModule' && !config.isChild">
    <eleModuleComponent :config="config" :propsInfo="propsInfo"/>
  </template>

  <template v-if="config.isChild">
    <template v-if="['div'].includes(config.elTagName)">
      <draggable
        group="draggable-group"
        :animation="200"
        item-key="uuid"
        :component-data="{
          tag: 'div',
          type: 'transition-group',
          name: 'draggable-group'
        }"
        :disabled="false"
        ghostClass="ghost"
        class="draggable-grop-wrap border-slate-300"
        handle=".draggable-content-bar"
        v-model="structure.children"
        @add="onChildAdd"
      >
        <template #item="{ element }">
          <DraggableItem
            :structure="element"
            @active="onActive"
            @delete="onSpecialDelete"
            @copy="onCopyItem"
            @special="onDraggableAdd"
          >
            <abstractionComponent
              :config="draggableConfig.renderArgument[element.uuid]"
              :propsInfo="draggableConfig.props[element.uuid]"
              :structure="element"
              @add="onAbstractionAdd"
              @delete="onSpecialDelete"
              @copy="onCopyItem"
              @active="onActive"
            />
          </DraggableItem>
        </template>
      </draggable>
    </template>

    <template v-if="['el-form','el-form-item'].includes(config.elTagName)">
      <component :is="config.elTagName" v-bind="propsInfo">
        <draggable
            group="draggable-group"
            :animation="200"
            item-key="uuid"
            :component-data="{
              tag: 'div',
              type: 'transition-group',
              name: 'draggable-group'
            }"
            :disabled="false"
            ghostClass="ghost"
            class="draggable-grop-wrap border-slate-300 w-full"
            handle=".draggable-content-bar"
            v-model="structure.children"
            @add="onChildAdd"
        >
          <template #item="{ element }">
            <DraggableItem
                :structure="element"
                @active="onActive"
                @delete="onSpecialDelete"
                @copy="onCopyItem"
                @special="onDraggableAdd"
                class="w-full"
            >
              <abstractionComponent
                  :config="draggableConfig.renderArgument[element.uuid]"
                  :propsInfo="draggableConfig.props[element.uuid]"
                  :structure="element"
                  :drag="drag"
                  @add="onAbstractionAdd"
                  @special="onDraggableAdd"
                  @delete="onSpecialDelete"
                  @copy="onCopyItem"
                  @active="onActive"
              />
            </DraggableItem>
          </template>
        </draggable>
      </component>
    </template>

    <component
      v-if="
        ['el-col', 'el-tab-pane', 'el-collapse-item', 'el-timeline-item'].includes(config.elTagName)
      "
      :is="config.elTagName"
      label="User"
      title="Consistency"
      :span="12"
      :name="Math.random()"
    >
      <draggable
        group="draggable-group"
        :animation="200"
        item-key="uuid"
        :component-data="{
          tag: 'div',
          type: 'transition-group',
          name: 'draggable-group'
        }"
        :disabled="false"
        ghostClass="ghost"
        class="draggable-grop-wrap border-slate-300"
        handle=".draggable-content-bar"
        v-model="structure.children"
        @add="onChildAdd"
        @special="onDraggableAdd"
      >
        <template #item="{ element }">
          <DraggableItem
            :structure="element"
            @special="onDraggableAdd"
            @delete="onSpecialDelete"
            @copy="onCopyItem"
            @active="onActive"
          >
            <abstractionComponent
              :config="draggableConfig.renderArgument[element.uuid]"
              :propsInfo="draggableConfig.props[element.uuid]"
              :structure="element"
              @add="onAbstractionAdd"
              @special="onDraggableAdd"
              @delete="onSpecialDelete"
              @copy="onCopyItem"
              @active="onActive"
            />
          </DraggableItem>
        </template>
      </draggable>
    </component>

    <el-badge v-if="config.elTagName === 'el-badge'" class="w-full">
      <draggable
        group="draggable-group"
        :animation="200"
        item-key="uuid"
        :component-data="{
          tag: 'div',
          type: 'transition-group',
          name: 'draggable-group'
        }"
        :disabled="false"
        ghostClass="ghost"
        class="draggable-grop-wrap border-slate-300"
        handle=".draggable-content-bar"
        v-model="structure.children"
        @add="onChildAdd"
      >
        <template #item="{ element }">
          <DraggableItem
            :structure="element"
            @active="onActive"
            @delete="onSpecialDelete"
            @copy="onCopyItem"
            @special="onDraggableAdd"
          >
            <abstractionComponent
              :config="draggableConfig.renderArgument[element.uuid]"
              :propsInfo="draggableConfig.props[element.uuid]"
              :structure="element"
              @add="onAbstractionAdd"
              @delete="onSpecialDelete"
              @copy="onCopyItem"
              @active="onActive"
            />
          </DraggableItem>
        </template>
      </draggable>
    </el-badge>

    <el-card v-if="config.elTagName === 'el-card'">
      <template #header>
        <div class="flex justify-between">
          <div>
            <span>{{ structure.uuid }}</span>
          </div>
          <div>
            <el-button class="button" text>Operation button</el-button>
          </div>
        </div>
      </template>
      <draggable
        group="draggable-group"
        :animation="200"
        item-key="uuid"
        :component-data="{
          tag: 'div',
          type: 'transition-group',
          name: 'draggable-group'
        }"
        :disabled="false"
        ghostClass="ghost"
        class="draggable-grop-wrap border-slate-300"
        handle=".draggable-content-bar"
        v-model="structure.children"
        @add="onChildAdd"
      >
        <template #item="{ element }">
          <DraggableItem
            :structure="element"
            @active="onActive"
            @delete="onSpecialDelete"
            @copy="onCopyItem"
            @special="onDraggableAdd"
          >
            <abstractionComponent
              :config="draggableConfig.renderArgument[element.uuid]"
              :propsInfo="draggableConfig.props[element.uuid]"
              :structure="element"
              :drag="drag"
              @add="onAbstractionAdd"
              @special="onDraggableAdd"
              @delete="onSpecialDelete"
              @copy="onCopyItem"
              @active="onActive"
            />
          </DraggableItem>
        </template>
      </draggable>
    </el-card>

    <template v-if="['el-tabs', 'el-row', 'el-collapse','el-timeline'].includes(config.elTagName)">
      <component :is="config.elTagName" v-bind="propsInfo">
        <abstractionComponent
          v-for="ele in structure.children"
          :structure="ele"
          :config="draggableConfig.renderArgument[ele.uuid]"
          :propsInfo="draggableConfig.props[ele.uuid]"
          :key="ele.uuid"
          :drag="drag"
          @add="onAbstractionAdd"
          @special="onDraggableAdd"
          @delete="onSpecialDelete"
          @copy="onCopyItem"
          @active="onActive"
        />
      </component>
    </template>

    <template v-if="['el-drawer', 'el-dialog'].includes(config.elTagName)">
      <!--todo 需要后续增加事件之后才能添加-->
      <component :is="config.elTagName" v-bind="propsInfo">
        <abstractionComponent
          v-for="ele in structure.children"
          :structure="ele"
          :config="draggableConfig.renderArgument[ele.uuid]"
          :propsInfo="draggableConfig.props[ele.uuid]"
          :key="ele.uuid"
          :drag="drag"
          @add="onAbstractionAdd"
          @delete="onSpecialDelete"
          @copy="onCopyItem"
          @special="onDraggableAdd"
          @active="onActive"
        />
      </component>
    </template>
  </template>
</template>

<script lang="ts" setup>
import { DRAGGABLE_CONGIG } from "../../config/designation";
import { inject, toRefs } from "vue";
import draggable from "vuedraggable";
import basicComponent from "./component/basicComponent/index.vue";
import eleModuleComponent from "./component/eleModuleComponent/index.vue";
import DraggableItem from "../draggableItem/index.vue";

const draggableConfig: any = inject(DRAGGABLE_CONGIG);

defineOptions({ name: "abstractionComponent" });

const emit = defineEmits(["add", "special", "active", "delete", "copy"]);

interface PropsType {
  config: any;
  structure: any;
  propsInfo: any;
  draggableConfig: any;
  drag: boolean;
}

const props = withDefaults(defineProps<PropsType>(), {
  config: () => ({}),
  propsInfo: () => ({}),
  structure: () => ({}),
  draggableConfig: () => ({}),
  drag: false
});

const { structure, drag, propsInfo } = toRefs(props);

const onAbstractionAdd = (event) => {
  emit("add", event);
};

const onChildAdd = (event) => {
  const list = props.structure.children;
  emit("add", { event, list });
};

const onDraggableAdd = (event) => {
  emit("special", event);
};

const onActive = (event) => {
  emit("active", event);
};

const onSpecialDelete = (event) => {
  emit("delete", event);
};

const onCopyItem = (event) => {
  emit("copy", event);
};
</script>
<style lang="scss" scoped>
.draggable-grop-wrap {
  height: 100%;
  background-color: rgb(var(--bg-color2));
  position: relative;
  min-height: 50px;
  border-width: 1px;
  border-style: dashed;
  border-radius: 3px;
  overflow: hidden;
}
</style>
