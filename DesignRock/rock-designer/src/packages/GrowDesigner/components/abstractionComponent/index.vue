<template>
  <div
    v-if="config.unsupported"
    class="designer-unsupported"
  >
    {{ config.elName || config.elTagName }}（暂未接入）
  </div>
  <template v-else-if="config.elType === 'basic' && !config.isChild">
    <basicComponent :config="config" :propsInfo="propsInfo" />
  </template>

  <template v-else-if="config.elType === 'eleModule' && !config.isChild">
    <eleModuleComponent :config="config" :propsInfo="propsInfo"/>
  </template>

  <template v-else-if="config.isChild">
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
        class="draggable-grop-wrap"
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

    <template v-if="['GrowForm','GrowFormItem'].includes(config.elTagName)">
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
            class="draggable-grop-wrap is-full"
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
                class="is-full"
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
        ['GrowCol', 'GrowTabPane', 'GrowCollapseItem', 'GrowTimelineItem'].includes(config.elTagName)
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
        class="draggable-grop-wrap"
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

    <GrowBadge v-if="config.elTagName === 'GrowBadge'" class="is-full">
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
        class="draggable-grop-wrap"
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
    </GrowBadge>

    <GrowCard v-if="config.elTagName === 'GrowCard'">
      <template #header>
        <div class="card-header-row">
          <div>
            <span>{{ structure.uuid }}</span>
          </div>
          <div>
            <GrowButton class="button" text>Operation button</GrowButton>
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
        class="draggable-grop-wrap"
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
    </GrowCard>

    <template v-if="['GrowTabs', 'GrowRow', 'GrowCollapse','GrowTimeline'].includes(config.elTagName)">
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

    <template v-if="['GrowDrawer', 'GrowModal'].includes(config.elTagName)">
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
.designer-unsupported {
  padding: 12px 8px;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.draggable-grop-wrap {
  height: 100%;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  background-color: var(--color-primary-a04);

  &.is-full {
    width: 100%;
  }
}

.is-full {
  width: 100%;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
}
</style>
