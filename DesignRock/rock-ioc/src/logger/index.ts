import * as inversify from "inversify";
import deatultOptions from "./config/default_settings";
// import consoleRenderer from "./renderers/console_renderer";
import requestReducer from "./reducers/request_reducer";
// import textSerializer from "./serializers/text/text_serializer";
import interfaces from "./interfaces/interfaces";
import { guid, getTime, getTimeDiference } from "./utils/utils";

function makeLoggerMiddleware(
    settings?: interfaces.LoggerSettings,
    renderer?: (out: interfaces.LogEntry) => void
): inversify.interfaces.Middleware {
    let logger = function (next: inversify.interfaces.Next): inversify.interfaces.Next {
        const _setting = settings || deatultOptions;
        const _renderer = renderer || ((out) => {
            if (out.error) {
                console.debug('grow-admin IOC', out, out.exception);
            }
        });
        return (args: inversify.interfaces.NextArgs) => {
            let results: any = null;

            let logEntry: interfaces.LogEntry = {
                error: false,
                exception: null,
                guid: guid(),
                multiInject: args.isMultiInject,
                results: [],
                rootRequest: null,
                serviceIdentifier: args.serviceIdentifier,
                time: null
            };
            let nextContextInterceptor = args.contextInterceptor;
            args.contextInterceptor = (context: inversify.interfaces.Context) => {
                logEntry.rootRequest = requestReducer(context.plan.rootRequest, _setting.request || {});
                return nextContextInterceptor(context);
            };
            try {
                let start =  getTime();
                results = next(args);
                let end = getTime();
                logEntry.results = results;
                logEntry.time = (_setting.time) ? getTimeDiference(start, end) : null;
            } catch (e) {
                logEntry.error = true;
                logEntry.exception = e;
                logEntry.time = null;
            }
            _renderer(logEntry);
            if (results) {
                return results;
            } else {
                throw new Error(logEntry.exception.message);
            }
        };
    };
    return logger;
}
export { makeLoggerMiddleware };