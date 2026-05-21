// @ts-ignore
let _global: any = this || {};

function getTimeFactory(_window: any, _process: any, _date: any) {
    return () => {
        if (_window !== undefined && _window !== null) {

            // modern browsers
            return _window.performance.now();

        } else if (_process !== undefined && _process !== null) {

            // node
            let nanoseconds = _process.hrtime()[1];
            let milliseconds = nanoseconds / 1000000;
            return milliseconds;

        } else {

            // old browsers
            return new _date().getTime();

        }
    };
}

let getTime = getTimeFactory(_global.window, _global.process , Date);

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
    s4() + "-" + s4() + s4() + s4();
}

function getTimeDiference( start: number, end: number) {
    let diff = end - start;
    let formatted = diff.toFixed(2);
    return formatted;
}

export { getTimeFactory, getTime, getTimeDiference, guid };
