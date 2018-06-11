import React from "react";
import _ from "lodash";
import { AsyncSeriesHook } from "tapable";
import {applyMiddleware, compose, createStore} from "redux";
import { Provider } from "react-redux";
import ReduxTapable from "./tapable";

export default class ReduxClient extends ReduxTapable {
  constructor() {
    super();
    this.hooks = {
      "reduxInitialState": new AsyncSeriesHook(["state", "application"])
    };
  }

  apply(clientHandler) {

    clientHandler.hooks.beforeRender.tapPromise("AddReduxProvider", async (app) => {
      let providerProps = {};
      if (!this.reducers) return;

      let initialState = window.__REDUX_PRELOADED_STATE__;

      // Allow the passed state to be garbage-collected
      delete window.__REDUX_PRELOADED_STATE__;

      const state = {
        setInitialState: (iState) => {
          initialState = _.cloneDeep(iState);
        },
        getInitialState: () => {
          return _.cloneDeep(initialState);
        }
      };
      await new Promise(r => this.hooks.reduxInitialState.callAsync(state, app, r));
      const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

      try {
        providerProps.store = createStore(
          this.reducers,
          initialState,
          composeEnhancers(
            applyMiddleware(...this.middlewares),
            ...this.enhancers
          )
        );
      } catch (ex) {
        // console.log redux error
        // eslint-disable-next-line
        console.error(ex);
      }

      app.children = (
        <Provider {...providerProps}>
          {app.children}
        </Provider>
      );
    });
  }

}