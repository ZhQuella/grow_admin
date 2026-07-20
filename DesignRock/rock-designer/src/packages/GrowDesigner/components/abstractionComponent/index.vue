<template>
  <div
    v-if="config.unsupported"
    class="designer-unsupported"
  >
    {{ config.elName || config.elTagName }}（暂未接入）
  </div>
  <template v-else-if="config.elType === 'basic' && !config.isChild">
    <basicComponent :config="config" :propsInfo="resolvedPropsInfo" :styleInfo="styleInfo" />
  </template>

  <template v-else-if="config.elType === 'eleModule' && !config.isChild">
    <eleModuleComponent :config="config" :propsInfo="resolvedPropsInfo" :styleInfo="styleInfo" />
  </template>

  <template v-else-if="config.isChild">
    <template v-if="['div'].includes(config.elTagName)">
      <div
        class="designer-container"
        :class="{ 'is-inline-host': isInlineMappedDisplay }"
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
          chosenClass="chosen-item"
          dragClass="drag-item"
          class="draggable-grop-wrap"
          :class="{ 'is-inline-mapped': isInlineMappedDisplay }"
          :style="styleInfo"
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
      </div>
    </template>

    <template v-if="['GrowForm','GrowFormItem'].includes(config.elTagName)">
      <component :is="config.elTagName" v-bind="propsInfo" :style="styleInfo">
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
            chosenClass="chosen-item"
            dragClass="drag-item"
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
        [
          'GrowCol',
          'GrowTabPane',
          'GrowCollapseItem',
          'GrowTimelineItem',
          'GrowCarouselItem',
        ].includes(config.elTagName)
      "
      :is="config.elTagName"
      v-bind="propsInfo"
      :style="styleInfo"
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
        chosenClass="chosen-item"
        dragClass="drag-item"
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

    <GrowBadge v-if="config.elTagName === 'GrowBadge'" class="is-full" :style="styleInfo">
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
        chosenClass="chosen-item"
        dragClass="drag-item"
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

    <GrowCard
      v-if="config.elTagName === 'GrowCard'"
      v-bind="cardBindProps"
      :style="styleInfo"
    >
      <template v-if="propsInfo.showHeaderExtra" #header>
        <div class="grow-card-header-extra">
          <div class="grow-card-header-extra__title">{{ resolvedPropsInfo.header }}</div>
          <div class="grow-card-header-extra__option">
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
              chosenClass="chosen-item"
              dragClass="drag-item"
              class="draggable-grop-wrap"
              handle=".draggable-content-bar"
              v-model="structure.optionSlot"
              @add="onOptionChildAdd"
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
        chosenClass="chosen-item"
        dragClass="drag-item"
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
      <template v-if="propsInfo.showFooter" #footer>
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
          chosenClass="chosen-item"
          dragClass="drag-item"
          class="draggable-grop-wrap"
          handle=".draggable-content-bar"
          v-model="structure.footerSlot"
          @add="onFooterChildAdd"
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
      </template>
    </GrowCard>

    <GrowScrollbar
      v-if="config.elTagName === 'GrowScrollbar'"
      class="grow-scrollbar-host"
      v-bind="scrollbarBindProps"
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
        chosenClass="chosen-item"
        dragClass="drag-item"
        class="draggable-grop-wrap grow-scrollbar-drop"
        :style="scrollbarDropStyle"
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
    </GrowScrollbar>

    <!-- 文字提示：默认可拖入触发元素；提示文案走 content 等属性 -->
    <GrowTooltip
      v-if="config.elTagName === 'GrowTooltip'"
      v-bind="tooltipBindProps"
    >
      <div class="grow-tooltip-host" :style="styleInfo">
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
          chosenClass="chosen-item"
          dragClass="drag-item"
          class="draggable-grop-wrap grow-tooltip-drop"
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
      </div>
    </GrowTooltip>

    <!-- 弹出框：reference=触发区(children)；default=内容区(contentSlot) -->
    <div
      v-if="config.elTagName === 'GrowPopover'"
      class="grow-popover-designer"
      :style="styleInfo"
    >
      <div class="grow-popover-designer__section">
        <div class="grow-popover-designer__label">触发元素（reference）</div>
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
          chosenClass="chosen-item"
          dragClass="drag-item"
          class="draggable-grop-wrap grow-popover-drop"
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
      </div>
      <div class="grow-popover-designer__section">
        <div class="grow-popover-designer__label">弹出内容（default）</div>
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
          chosenClass="chosen-item"
          dragClass="drag-item"
          class="draggable-grop-wrap grow-popover-drop is-content"
          handle=".draggable-content-bar"
          v-model="structure.contentSlot"
          @add="onContentChildAdd"
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
      </div>
    </div>

    <template v-if="config.elTagName === 'GrowTabs'">
      <GrowTabs
        v-bind="propsInfo"
        v-model="propsInfo.modelValue"
        :style="styleInfo"
      >
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
      </GrowTabs>
    </template>

    <template v-if="config.elTagName === 'GrowCollapse'">
      <GrowCollapse
        v-bind="propsInfo"
        v-model="propsInfo.modelValue"
        :style="styleInfo"
      >
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
      </GrowCollapse>
    </template>

    <template v-if="config.elTagName === 'GrowLayout'">
      <div
        class="grow-page-layout"
        :class="`is-${layoutMode}`"
        :style="styleInfo"
      >
        <div
          v-if="layoutShowHeader"
          class="grow-page-layout__region grow-page-layout__header"
        >
          <div class="grow-page-layout__label">顶栏</div>
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
            chosenClass="chosen-item"
            dragClass="drag-item"
            class="draggable-grop-wrap grow-page-layout__drop"
            handle=".draggable-content-bar"
            v-model="structure.headerSlot"
            @add="onHeaderChildAdd"
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
        </div>

        <div
          v-if="layoutShowAside"
          class="grow-page-layout__region grow-page-layout__aside"
          :style="{ width: layoutAsideWidth }"
        >
          <div class="grow-page-layout__label">侧边栏</div>
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
            chosenClass="chosen-item"
            dragClass="drag-item"
            class="draggable-grop-wrap grow-page-layout__drop"
            handle=".draggable-content-bar"
            v-model="structure.asideSlot"
            @add="onAsideChildAdd"
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
        </div>

        <div class="grow-page-layout__region grow-page-layout__main">
          <div class="grow-page-layout__label">主区域</div>
          <LayoutMainWatch class="grow-page-layout__watch">
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
              chosenClass="chosen-item"
              dragClass="drag-item"
              class="draggable-grop-wrap grow-page-layout__drop"
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
          </LayoutMainWatch>
        </div>

        <div
          v-if="layoutShowFooter"
          class="grow-page-layout__region grow-page-layout__footer"
          :style="{ height: layoutFooterHeight }"
        >
          <div class="grow-page-layout__label">底栏</div>
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
            chosenClass="chosen-item"
            dragClass="drag-item"
            class="draggable-grop-wrap grow-page-layout__drop"
            handle=".draggable-content-bar"
            v-model="structure.footerSlot"
            @add="onFooterChildAdd"
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
        </div>
      </div>
    </template>

    <template v-if="['GrowRow', 'GrowTimeline', 'GrowCarousel'].includes(config.elTagName)">
      <component :is="config.elTagName" v-bind="propsInfo" :style="styleInfo">
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
      <!-- 画布仅占位；内容在工具栏打开的模拟编辑层中拖入 -->
      <div
        class="grow-overlay-placeholder"
        :class="{
          'is-modal': config.elTagName === 'GrowModal',
          'is-drawer': config.elTagName === 'GrowDrawer',
        }"
      >
        <GrowIconify
          class="grow-overlay-placeholder__icon"
          :icon="config.elTagName === 'GrowDrawer' ? 'carbon:open-panel-right' : 'carbon:popup'"
          :size="18"
        />
        <div class="grow-overlay-placeholder__title">
          {{ resolvedPropsInfo.title || (config.elTagName === 'GrowModal' ? '弹窗' : '抽屉') }}
        </div>
      </div>
    </template>
  </template>
</template>

<script lang="ts" setup>
import { DRAGGABLE_CONGIG, GROW_RUNTIME_STATE } from "../../config/designation";
import { computed, inject, toRefs, type ComputedRef } from "vue";
import draggable from "vuedraggable";
import basicComponent from "./component/basicComponent/index.vue";
import eleModuleComponent from "./component/eleModuleComponent/index.vue";
import DraggableItem from "../draggableItem/index.vue";
import LayoutMainWatch from "../layoutMainWatch/index.vue";
import {
  DEFAULT_PAGE_LAYOUT,
  layoutHasAside,
  layoutHasFooter,
  layoutHasHeader,
} from "../../static/layoutPresets";
import {
  buildRuntimeState,
  resolveBoundProps,
} from "../../../GrowRenderer/utils/resolveBoundProps";

const draggableConfig: any = inject(DRAGGABLE_CONGIG);
const injectedRuntimeState = inject<ComputedRef<Record<string, unknown>> | null>(
  GROW_RUNTIME_STATE,
  null,
);

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

/** 叶子节点展示：绑定字段随 runtimeState（dataSource）变更重算 */
const resolvedPropsInfo = computed(() => {
  const uuid = structure.value?.uuid
  const raw = propsInfo.value || {}
  if (!uuid || !draggableConfig) return raw
  const state =
    injectedRuntimeState?.value ??
    buildRuntimeState(draggableConfig.dataSource)
  return resolveBoundProps(
    raw,
    draggableConfig.propBindModes?.[uuid],
    state,
  )
})

/** GrowCard：设计器开关不透传；启用操作区时 header 由 #header 插槽渲染 */
const cardBindProps = computed(() => {
  const info = { ...(resolvedPropsInfo.value || {}) }
  Reflect.deleteProperty(info, 'showFooter')
  Reflect.deleteProperty(info, 'showHeaderExtra')
  if (propsInfo.value?.showHeaderExtra) {
    Reflect.deleteProperty(info, 'header')
  }
  return info
})

/** 滚动条：高度直接传给组件；% 相对舞台实测高度 */
const toStageRelativeSize = (value: unknown) => {
  if (value == null || value === '') return undefined
  const str = String(value).trim()
  if (!str) return undefined
  const matched = str.match(/^(-?\d+(?:\.\d+)?)%$/)
  if (!matched) return str
  return `calc(var(--designer-stage-height, 100%) * ${matched[1]} / 100)`
}

const scrollbarBindProps = computed(() => {
  const info = { ...(propsInfo.value || {}) }
  const height = toStageRelativeSize(info.height)
  const maxHeight = toStageRelativeSize(info['max-height'])
  if (height) info.height = height
  else Reflect.deleteProperty(info, 'height')
  if (maxHeight) info['max-height'] = maxHeight
  else Reflect.deleteProperty(info, 'max-height')
  return info
})

/** 投放区用配置高度做 min-height，避免依赖 % 父级导致高度塌成 0 */
const scrollbarDropStyle = computed(() => {
  const height = toStageRelativeSize(propsInfo.value?.height)
  const maxHeight = toStageRelativeSize(propsInfo.value?.['max-height'])
  return {
    minHeight: height || maxHeight || '200px',
  }
})

/** 设计器内禁用浮层，避免干扰拖拽；属性仍可配置，预览生效 */
const tooltipBindProps = computed(() => {
  const info = { ...(propsInfo.value || {}) }
  info.disabled = true
  return info
})

/** 兼容历史 schema：确保 Card 插槽数组可被 v-model */
if (props.config?.elTagName === 'GrowCard') {
  if (!Array.isArray(props.structure.footerSlot)) props.structure.footerSlot = []
  if (!Array.isArray(props.structure.optionSlot)) props.structure.optionSlot = []
}

/** 兼容历史 schema：确保 Popover contentSlot 可被 v-model */
if (props.config?.elTagName === 'GrowPopover') {
  if (!Array.isArray(props.structure.children)) props.structure.children = []
  if (!Array.isArray(props.structure.contentSlot)) props.structure.contentSlot = []
}

/** 兼容历史 schema：确保 Layout 区域插槽可被 v-model */
if (props.config?.elTagName === 'GrowLayout') {
  if (!Array.isArray(props.structure.children)) props.structure.children = []
  if (!Array.isArray(props.structure.headerSlot)) props.structure.headerSlot = []
  if (!Array.isArray(props.structure.asideSlot)) props.structure.asideSlot = []
  if (!Array.isArray(props.structure.footerSlot)) props.structure.footerSlot = []
}

const layoutMode = computed(() => propsInfo.value?.layout || DEFAULT_PAGE_LAYOUT)
const layoutShowHeader = computed(() => layoutHasHeader(layoutMode.value))
const layoutShowAside = computed(() => layoutHasAside(layoutMode.value))
const layoutShowFooter = computed(() => layoutHasFooter(layoutMode.value))
const layoutAsideWidth = computed(() => propsInfo.value?.asideWidth || '200px')
const layoutFooterHeight = computed(() => propsInfo.value?.footerHeight || '60px')

/** 样式作用在映射组件上；尺寸由外框承接时组件铺满外框 */
const styleInfo = computed(() => {
  const uuid = structure.value?.uuid
  if (!uuid) return undefined
  const styles = { ...(draggableConfig?.styles?.[uuid] || {}) }
  if (!Object.keys(styles).length) return undefined

  const display = styles.display
  const isInlineDisplay =
    display === 'inline' || display === 'inline-block' || display === 'inline-flex'

  const hasWidth = styles.width != null && styles.width !== ''
  const hasHeight = styles.height != null && styles.height !== ''
  const tag = props.config?.elTagName

  // 滚动条高度由 props.height 控制，不走 styles 外框逻辑
  if (tag === 'GrowScrollbar') {
    Reflect.deleteProperty(styles, 'height')
    Reflect.deleteProperty(styles, 'max-height')
  }

  if (hasWidth || hasHeight) {
    styles['box-sizing'] = styles['box-sizing'] || 'border-box'
    // 行内级保持真实 display，且不要把 100% 宽度灌进映射组件（与 GrowLink 一致）
    if (hasWidth && !isInlineDisplay) styles.width = '100%'
    if (hasWidth && isInlineDisplay && styles.width === '100%') {
      Reflect.deleteProperty(styles, 'width')
    }
    if (hasHeight && !isInlineDisplay && tag !== 'GrowScrollbar') {
      styles.height = '100%'
    }
  }
  return styles
})

/** 映射组件自身为 inline*（外框由 draggable-item 转为 inline-block） */
const isInlineMappedDisplay = computed(() => {
  const display = styleInfo.value?.display
  return display === 'inline' || display === 'inline-block' || display === 'inline-flex'
})

const onAbstractionAdd = (event) => {
  emit("add", event);
};

const onChildAdd = (event) => {
  const list = props.structure.children;
  emit("add", { event, list });
};

const onFooterChildAdd = (event) => {
  if (!Array.isArray(props.structure.footerSlot)) {
    props.structure.footerSlot = [];
  }
  emit("add", { event, list: props.structure.footerSlot });
};

const onHeaderChildAdd = (event) => {
  if (!Array.isArray(props.structure.headerSlot)) {
    props.structure.headerSlot = [];
  }
  emit("add", { event, list: props.structure.headerSlot });
};

const onAsideChildAdd = (event) => {
  if (!Array.isArray(props.structure.asideSlot)) {
    props.structure.asideSlot = [];
  }
  emit("add", { event, list: props.structure.asideSlot });
};

const onOptionChildAdd = (event) => {
  if (!Array.isArray(props.structure.optionSlot)) {
    props.structure.optionSlot = [];
  }
  emit("add", { event, list: props.structure.optionSlot });
};

const onContentChildAdd = (event) => {
  if (!Array.isArray(props.structure.contentSlot)) {
    props.structure.contentSlot = [];
  }
  emit("add", { event, list: props.structure.contentSlot });
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
  width: 100%;
  height: 100%;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  background-color: var(--color-primary-a04);
  box-sizing: border-box;

  &.is-full {
    width: 100%;
    height: 100%;
  }
}

.grow-page-layout {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  border: 1px dashed var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--component-background-color);

  &.is-header-main {
    grid-template:
      "header" auto
      "main" 1fr / 1fr;
  }

  &.is-header-main-footer {
    grid-template:
      "header" auto
      "main" 1fr
      "footer" auto / 1fr;
  }

  &.is-aside-main {
    grid-template: "aside main" 1fr / auto 1fr;
  }

  &.is-header-aside-main {
    grid-template:
      "header header" auto
      "aside main" 1fr / auto 1fr;
  }

  &.is-header-aside-main-footer {
    grid-template:
      "header header" auto
      "aside main" 1fr
      "aside footer" auto / auto 1fr;
  }

  &.is-aside-header-main {
    grid-template:
      "aside header" auto
      "aside main" 1fr / auto 1fr;
  }

  &.is-aside-header-main-footer {
    grid-template:
      "aside header" auto
      "aside main" 1fr
      "aside footer" auto / auto 1fr;
  }
}

.grow-page-layout__region {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
}

.grow-page-layout__header {
  grid-area: header;
  border-bottom: 1px solid var(--layout-border-color);
}

.grow-page-layout__aside {
  grid-area: aside;
  border-right: 1px solid var(--layout-border-color);
}

.grow-page-layout__main {
  grid-area: main;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .grow-page-layout__watch {
    flex: 1 1 auto;
    min-height: 120px;
    height: auto;
  }

  .grow-page-layout__drop {
    flex: 1 1 auto;
    min-height: 48px;
    height: auto;
    padding: 10px;
  }
}

.grow-page-layout__footer {
  grid-area: footer;
  border-top: 1px solid var(--layout-border-color);
}

.grow-page-layout__label {
  flex: none;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 18px;
  color: var(--text-color-secondary);
  background: var(--color-primary-a04);
}

.grow-page-layout__drop.draggable-grop-wrap {
  flex: 1 1 auto;
  width: 100%;
  min-height: 48px;
  height: auto;
  border: none;
  border-radius: 0;
  background-color: transparent;
  overflow: visible;
}

.is-full {
  width: 100%;
  height: 100%;
}

.grow-scrollbar-host {
  width: 100%;
  box-sizing: border-box;
}

/* 投放区高度由 inline minHeight（配置值）控制，勿再用 height/min-height:100% */
.grow-scrollbar-drop.draggable-grop-wrap {
  width: 100%;
  height: auto;
  overflow: visible;
  box-sizing: border-box;
}

.grow-tooltip-host {
  display: inline-block;
  vertical-align: top;
  max-width: 100%;
  box-sizing: border-box;
}

.grow-tooltip-drop.draggable-grop-wrap {
  width: auto;
  min-width: 96px;
  min-height: 36px;
  height: auto;
  overflow: visible;
  box-sizing: border-box;
}

.grow-popover-designer {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  vertical-align: top;
  max-width: 100%;
  box-sizing: border-box;
}

.grow-popover-designer__section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;
}

.grow-popover-designer__label {
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-color-secondary);
}

.grow-popover-drop.draggable-grop-wrap {
  width: auto;
  min-width: 120px;
  min-height: 40px;
  height: auto;
  overflow: visible;
  box-sizing: border-box;

  &.is-content {
    min-width: 180px;
    min-height: 64px;
  }
}

/* 弹窗 / 抽屉：画布占位壳 */
.grow-overlay-placeholder {
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  width: 100%;
  min-height: 56px;
  padding: 10px 12px;
  border: 1px dashed var(--layout-border-color);
  border-radius: 8px;
  background: var(--color-primary-a04, rgba(64, 158, 255, 0.04));
}

.grow-overlay-placeholder__icon {
  flex: 0 0 auto;
  color: var(--primary-color, #409eff);
}

.grow-overlay-placeholder__title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-color, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.designer-container {
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;

  /* 避免 width:100% 把行内外框撑满整行 */
  &.is-inline-host {
    display: contents;
  }
}

.draggable-grop-wrap.is-inline-mapped {
  width: fit-content;
  max-width: 100%;
  height: auto;
  min-height: 0;
  vertical-align: top;
}

.grow-card-header-extra {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  box-sizing: border-box;
}

.grow-card-header-extra__title {
  flex: 0 0 50%;
  width: 50%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grow-card-header-extra__option {
  flex: 0 0 50%;
  width: 50%;
  min-width: 0;
  box-sizing: border-box;
}
</style>
