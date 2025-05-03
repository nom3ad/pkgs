"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useContainerState = exports.useContainerSelector = exports.createStateContainerReactHelpers = void 0;
var _react = _interopRequireDefault(require("react"));
var _useObservable = _interopRequireDefault(require("react-use/lib/useObservable"));
var _fastDeepEqual = _interopRequireDefault(require("fast-deep-equal"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const {
  useContext,
  useLayoutEffect,
  useRef,
  createElement: h
} = _react.default;

/**
 * React hooks that returns the latest state of a {@link StateContainer}.
 *
 * @param container - {@link StateContainer} which state to track.
 * @returns - latest {@link StateContainer} state
 * @public
 */
const useContainerState = container => (0, _useObservable.default)(container.state$, container.get());

/**
 * React hook to apply selector to state container to extract only needed information. Will
 * re-render your component only when the section changes.
 *
 * @param container - {@link StateContainer} which state to track.
 * @param selector - Function used to pick parts of state.
 * @param comparator - {@link Comparator} function used to memoize previous result, to not
 *    re-render React component if state did not change. By default uses
 *    `fast-deep-equal` package.
 * @returns - result of a selector(state)
 * @public
 */
exports.useContainerState = useContainerState;
const useContainerSelector = (container, selector, comparator = _fastDeepEqual.default) => {
  const {
    state$,
    get
  } = container;
  const lastValueRef = useRef(get());
  const [value, setValue] = _react.default.useState(() => {
    const newValue = selector(get());
    lastValueRef.current = newValue;
    return newValue;
  });
  useLayoutEffect(() => {
    const subscription = state$.subscribe(currentState => {
      const newValue = selector(currentState);
      if (!comparator(lastValueRef.current, newValue)) {
        lastValueRef.current = newValue;
        setValue(newValue);
      }
    });
    return () => subscription.unsubscribe();
  }, [state$, comparator]);
  return value;
};

/**
 * Creates helpers for using {@link StateContainer | State Containers} with react
 *
 * TODO Update link
 * Refer to {@link https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/src/plugins/opensearch_dashboards_utils/docs/state_containers/react.md | guide} for details
 * @public
 */
exports.useContainerSelector = useContainerSelector;
const createStateContainerReactHelpers = () => {
  const context = /*#__PURE__*/_react.default.createContext(null);
  const useContainer = () => useContext(context);
  const useState = () => {
    const container = useContainer();
    return useContainerState(container);
  };
  const useTransitions = () => useContainer().transitions;
  const useSelector = (selector, comparator = _fastDeepEqual.default) => {
    const container = useContainer();
    return useContainerSelector(container, selector, comparator);
  };
  const connect = mapStateToProp => component => props => h(component, {
    ...useSelector(mapStateToProp),
    ...props
  });
  return {
    Provider: context.Provider,
    Consumer: context.Consumer,
    context,
    useContainer,
    useState,
    useTransitions,
    useSelector,
    connect
  };
};
exports.createStateContainerReactHelpers = createStateContainerReactHelpers;