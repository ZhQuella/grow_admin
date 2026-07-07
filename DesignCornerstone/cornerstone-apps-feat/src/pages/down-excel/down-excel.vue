<template>
  <div>
    <div class="mb-2.5 bg-layout px-5 py-[50px] text-[17px] text-text">
      导出 Excel
    </div>
    <div class="mx-2.5 mb-2.5 last:mb-0">
      <el-card>
        <template #header>
          <div class="font-semibold">
            <span>本地导出 Excel</span>
          </div>
        </template>
        <div>
          <el-button @click="onLocalDownExcel">
            Down Excel
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DownExcel } from '@grow-admin-rock/utils'

defineOptions({
  name: 'DownExcelPage',
})

function onLocalDownExcel() {
  const downLoadExcel = new DownExcel([
    {
      title: '嘿嘿',
      header: [
        {
          field: 'c1',
          title: 'c111',
          bgColor: 'A9BCD1',
          children: [
            {
              field: 'c2',
              title: 'c222',
              bgColor: 'A9BCD1',
            },
            {
              field: 'c3',
              title: 'c333',
              bgColor: 'A9BCD1',
            },
            {
              field: 'c4',
              title: 'c444',
              bgColor: 'A9BCD1',
            },
          ],
        },
        {
          field: 'd1',
          title: 'd111',
          bgColor: 'E9AF80',
          children: [
            {
              field: 'd2',
              title: 'd222',
              bgColor: 'E9AF80',
            },
            {
              field: 'd3',
              title: 'd333',
              bgColor: 'E9AF80',
            },
            {
              field: 'd4',
              title: 'd444',
              bgColor: 'E9AF80',
            },
          ],
        },
      ],
      data: [
        {
          c2: 1,
          c3: 2,
          c4: 3,
          d2: 1,
          d3: 2,
          d4: 3,
        },
      ],
    },
  ])
  downLoadExcel.down('测试')
}
</script>
