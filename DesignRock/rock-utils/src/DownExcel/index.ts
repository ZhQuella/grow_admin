import type { AnyFunction } from '@grow-admin-rock/types'
import ExcelJS from 'exceljs'

export default class DownExcel {
  private sheets: any[] = []
  private outMarges: any = {}

  constructor(sheets: any[]) {
    this.sheets = sheets
    this.outMarges = {}
  }

  down(fileName: string, callBack?: AnyFunction) {
    const { sheets } = this
    const workbook = new ExcelJS.Workbook()
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i]
      const {
        header = [],
        data = [],
        border = true,
        title = '未命名',
        showGridLines = false,
        tabColor = 'FFFFFFF',
        fixedHead = false,
        verticalCentered = true,
        horizontalCentered = false,
        flexConfig = {},
      } = sheet
      const maxLevel = this.maxLevel(header)
      const flex = fixedHead
        ? {
            state: 'frozen',
            xSplit: 0,
            ySplit: maxLevel + 1,
          }
        : flexConfig
      const worksheet = this.createdSheet(workbook, {
        title,
        showGridLines,
        tabColor,
        verticalCentered,
        horizontalCentered,
        flex,
      })
      this.outMarges[i] = {
        startCell: -1,
        basisRow: 0,
        basisCell: 0,
        maxRow: 0,
      }
      const lastChild = this.getLastChild(header)
      const mergeInfo = this.resetMergeHeaderInfo(header, maxLevel, this.outMarges[i])
      this.createdHead(worksheet, mergeInfo, { border })
      this.setData(worksheet, lastChild, data, { border }, maxLevel, callBack)
    }
    this.openDownloadDialog(workbook, fileName)
  }

  createdSheet(workbook: any, config: any) {
    const { title, showGridLines, tabColor, verticalCentered, horizontalCentered, flex } = config
    return workbook.addWorksheet(title, {
      views: [{ showGridLines, ...flex }],
      properties: {
        tabColor: { argb: tabColor },
        verticalCentered,
        horizontalCentered,
      },
      pageSetup: { verticalCentered, horizontalCentered },
    })
  }

  createdHead(worksheet: any, mergeInfo: any, addition: any) {
    const { border } = addition
    for (let i = 0; i < mergeInfo.length; i++) {
      const merge = mergeInfo[i]
      const { s, e, item } = merge
      const { r: sr, c: sc } = s
      const { r: er, c: ec } = e
      const {
        title = '',
        align = 'left',
        bgColor = 'E8EAEC',
        color = '606266',
        width = '',
        minWidth = '',
      } = item
      const s26BS = this.convertDSTo26BS(sc + 1)
      const e26BS = this.convertDSTo26BS(ec + 1)
      const statr = `${s26BS}${sr + 1}`
      const end = `${e26BS}${er + 1}`
      worksheet.mergeCells(`${statr}:${end}`)
      worksheet.getCell(statr).value = title
      border
        && (worksheet.getCell(statr).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        })
      worksheet.getCell(end).alignment = {
        vertical: 'middle',
        horizontal: align,
      }
      worksheet.getCell(end).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${bgColor}` },
        bgColor: { argb: `FF${bgColor}` },
      }
      worksheet.getCell(end).font = {
        color: { argb: `FF${color}` },
        size: 10,
        bold: true,
      }
      if (width || minWidth) {
        const dobCol = worksheet.getColumn(s26BS)
        dobCol.width = parseInt(width || minWidth) / 10
      }
    }
  }

  setData(worksheet: any, lastChild: any, data: any, addition: any, maxLevel: any, callBack?: AnyFunction) {
    const { border } = addition
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const c = maxLevel + i + 2
      for (let j = 0; j < lastChild.length; j++) {
        const ele = lastChild[j]
        const r = this.convertDSTo26BS(j + 1)
        const coordinate = `${r}${c}`
        worksheet.getCell(coordinate).value = item[ele.field] === undefined ? '-' : item[ele.field]
        border
          && (worksheet.getCell(coordinate).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          })
      }
      callBack && callBack(item, worksheet, c)
    }
  }

  async openDownloadDialog(workbook: any, fileName: any) {
    const buffer = await workbook.xlsx.writeBuffer()
    const blob: any = new Blob([buffer], {
      type: 'application/octet-stream',
    })
    let url = ''
    if (typeof blob == 'object' && blob instanceof Blob) {
      url = URL.createObjectURL(blob)
    }
    const aLink = document.createElement('a')
    aLink.href = url
    aLink.download = `${fileName}.xlsx`
    let event
    if (window.MouseEvent) event = new MouseEvent('click')
    else {
      event = document.createEvent('MouseEvents')
      event.initMouseEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null,
      )
    }
    aLink.dispatchEvent(event)
  }

  resetMergeHeaderInfo(
    tableHeader: any,
    maxLevel: any,
    outMarge: any,
    result: any[] = [],
    onces = true,
  ) {
    onces && this.tagHeadIn(tableHeader)
    this.tagMaxLevel(tableHeader)
    for (let i = 0; i < tableHeader.length; i++) {
      const item = tableHeader[i]
      const { maxLen } = item
      const lastChild = this.getLastChild(item.children || [])
      const s: any = {}
      const e: any = {}
      if (!item.children) {
        if (item.isOut) {
          outMarge.startCell += 1
          outMarge.basisCell += 1
          s.r = 0
          e.r = maxLevel
          s.c = outMarge.startCell
          e.c = outMarge.startCell
          result.push({ s, e, item })
        }
        else {
          let r = maxLevel - (outMarge.basisRow + maxLen)
          r = Math.max(r, 0)
          s.c = outMarge.basisCell
          e.c = outMarge.basisCell
          s.r = outMarge.basisRow
          e.r = r + outMarge.basisRow + maxLen
          result.push({ s, e, item })
          outMarge.basisCell += 1
        }
      }
      if (item.children) {
        if (item.isOut) {
          s.r = 0
          e.r = 0
          outMarge.startCell += 1
          s.c = outMarge.startCell
          outMarge.startCell += lastChild.length - 1
          e.c = outMarge.startCell
          result.push({ s, e, item })
        }
        else {
          s.c = outMarge.basisCell
          e.c = outMarge.basisCell + lastChild.length - 1
          s.r = outMarge.basisRow
          e.r = outMarge.basisRow
          result.push({ s, e, item })
        }
        outMarge.basisRow += 1
        this.resetMergeHeaderInfo(item.children, maxLevel, outMarge, result, false)
      }
    }
    outMarge.basisRow -= 1
    return result
  }

  tagHeadIn(tableHeader: any[]) {
    tableHeader.forEach((el) => {
      el.isOut = true
      return el
    })
  }

  tagMaxLevel(tableHeader: any[]) {
    const maxLevel = this.maxLevel(tableHeader, false)
    tableHeader.forEach((el) => {
      if (!el.children) {
        el.maxLen = maxLevel
      }
      else {
        this.tagMaxLevel(el.children)
        el.maxLen = maxLevel
      }
    })
  }

  maxLevel(arr: any[], isSetFloor = true) {
    let max = -1
    function each(data: any, floor: number) {
      data.forEach((e: any) => {
        max = Math.max(floor, max)
        isSetFloor && (e.floor = floor + 1)
        if (e.children) {
          each(e.children, floor + 1)
        }
      })
    }
    each(arr, 0)
    return max
  }

  getLastChild(arr: any[], result: any[] = []) {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (!item.children) {
        result.push(item)
      }
      else {
        result = this.getLastChild(item.children, result)
      }
    }
    return result
  }

  convertDSTo26BS(num: any) {
    let code = ''
    const reg = /^\d+$/g
    if (!reg.test(num)) {
      return code
    }
    while (num > 0) {
      let m = num % 26
      if (m == 0) {
        m = 26
      }
      code = String.fromCharCode(64 + parseInt(`${m}`)) + code
      num = (num - m) / 26
    }
    return code
  }
}
