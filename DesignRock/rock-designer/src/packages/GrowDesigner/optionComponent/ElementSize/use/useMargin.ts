import { ref } from "vue";

export const useMargin = ({ styleOption, emits }) => {
  const unitYMap = ["margin-top", "margin-bottom", "padding-top", "padding-bottom"];
  const unitXMap = ["margin-right", "margin-left", "padding-right", "padding-left"];

  const marginUnit = ref("px");

  const onMarginUnitChange = (data: string) => {
    const result = { ...styleOption.value };
    for (let i = 0, item: string; (item = unitYMap[i++]); ) {
      const value = result[item];
      const unit = data === "vw/vh" ? "vh" : data;
      value && (result[item] = `${parseFloat(value)}${unit}`);
    }
    for (let i = 0, item: string; (item = unitXMap[i++]); ) {
      const value = result[item];
      const unit = data === "vw/vh" ? "vw" : data;
      value && (result[item] = `${parseFloat(value)}${unit}`);
    }
    emits("update:styleOption", result);
  };

  const onMarginChange = (type: string, event: any) => {
    const result = { ...styleOption.value };
    if (event.target.value) {
      result[type] = `${event.target.value}${marginUnit.value}`;
    } else {
      Reflect.deleteProperty(result, type);
    }
    emits("update:styleOption", result);
  };

  return {
    marginUnit,
    onMarginUnitChange,
    onMarginChange
  };
};
