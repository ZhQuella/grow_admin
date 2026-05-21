import * as inversify from "inversify";

namespace interfaces {

    export interface LoggerSettings {
        request?: RequestLoggerSettings;
        time?: boolean;
    }

    export interface RequestLoggerSettings {
        serviceIdentifier?: boolean;
        bindings?: BindingLoggerSettings;
        target?: TargetLoggerSettings;
    }

    export interface BindingLoggerSettings {
        activated?: boolean;
        serviceIdentifier?: boolean;
        implementationType?: boolean;
        factory?: boolean;
        provider?: boolean;
        constraint?: boolean;
        onActivation?: boolean;
        cache?: boolean;
        dynamicValue?: boolean;
        scope?: boolean;
        type?: boolean;
    }

    export interface TargetLoggerSettings {
        serviceIdentifier?: boolean;
        name?: boolean;
        metadata?: boolean;
    }

    export interface LogEntry {
        error: boolean;
        exception: any;
        guid: string;
        multiInject: boolean;
        results: any[];
        rootRequest: inversify.interfaces.Request | null;
        serviceIdentifier: any;
        time: string | null;
    }

}

export default interfaces;
