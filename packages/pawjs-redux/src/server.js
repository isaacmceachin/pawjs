import React from "react";
import _ from "lodash";
import { AsyncSeriesHook } from "tapable";
import {applyMiddleware, compose, createStore} from "redux";
import { Provider } from "react-redux";
import ReduxTapable from "./tapable";

export default class ReduxServer extends ReduxTapable {
  constructor() {
    super();
    this.hooks = {
      "reduxInitialState": new AsyncSeriesHook(["state", "application", "req", "res"])
    };
  }

  apply(serverHandler) {
    serverHandler.hooks.beforeAppRender.tapPromise("AddReduxProvider", async (app, req, res) => {
      let providerProps = {};
      if (!this.reducers) return;

      let initialState = undefined;
      const state = {
        setInitialState: (iState) => {
          initialState = _.cloneDeep(iState);
        },
        getInitialState: () => {
          return _.cloneDeep(initialState);
        }
      };
      await new Promise(r => this.hooks.reduxInitialState.callAsync(state, app, req, res, r));

      try {
        res.locals.reduxStore = providerProps.store = createStore(
          this.reducers,
          initialState,
          compose(
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
    serverHandler.hooks.beforeHtmlRender.tapPromise("AddReduxPreloadedState", async (app, req, res) => {
      if (res.locals.reduxStore && res.locals.reduxStore.getState) {
        const reduxState = res.locals.reduxStore.getState();
        app.htmlProps.footer.push(
          <script
            key={"reduxPreloadedState"}
            dangerouslySetInnerHTML={{
              __html: `window.__REDUX_PRELOADED_STATE__ = ${JSON.stringify(reduxState)}`
            }}
          />
        );
      }

    });
  }
}