import * as inversify from "inversify";
import bindingReducer from "./binding_reducer";
import targetReducer from "./target_reducer";
import interfaces from "../interfaces/interfaces";

function requestReducer(
    request: inversify.interfaces.Request,
    options: interfaces.RequestLoggerSettings
) {

    let reducedRequest: any = {};
    let requestOptions: any = options;

    if (requestOptions.serviceIdentifier === true) {
        reducedRequest.serviceIdentifier = request.serviceIdentifier;
    }

    // bindings
    if (requestOptions.bindings !== undefined) {
        let reducedBindings = request.bindings.map((binding: inversify.interfaces.Binding<any>) => {
            return bindingReducer(binding, options.bindings);
        });
        reducedRequest.bindings = reducedBindings;
    }

    // target
    if (requestOptions.target !== undefined && request.target !== null) {
        reducedRequest.target = targetReducer(request.target, options.target);
    }

    // child requests
    let reducedChieldRequest = request.childRequests.map((childRequest) => {
        return requestReducer(childRequest, options);
    });
    reducedRequest.childRequests = reducedChieldRequest;

    return reducedRequest;

}

export default requestReducer;
