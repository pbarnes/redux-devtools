(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ReduxDevTools"] = factory();
	else
		root["ReduxDevTools"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

	var _devTools = __webpack_require__(1);

	exports.devTools = _interopRequire(_devTools);

	var _persistState = __webpack_require__(2);

	exports.persistState = _interopRequire(_persistState);

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports['default'] = devTools;
	var ActionTypes = {
	  PERFORM_ACTION: 'PERFORM_ACTION',
	  RESET: 'RESET',
	  ROLLBACK: 'ROLLBACK',
	  COMMIT: 'COMMIT',
	  SWEEP: 'SWEEP',
	  TOGGLE_ACTION: 'TOGGLE_ACTION',
	  JUMP_TO_STATE: 'JUMP_TO_STATE',
	  SET_MONITOR_STATE: 'SET_MONITOR_STATE',
	  RECOMPUTE_STATES: 'RECOMPUTE_STATES'
	};

	var INIT_ACTION = {
	  type: '@@INIT'
	};

	function toggle(obj, key) {
	  var clone = _extends({}, obj);
	  if (clone[key]) {
	    delete clone[key];
	  } else {
	    clone[key] = true;
	  }
	  return clone;
	}

	/**
	 * Computes the next entry in the log by applying an action.
	 */
	function computeNextEntry(reducer, action, state, error) {
	  if (error) {
	    return {
	      state: state,
	      error: 'Interrupted by an error up the chain'
	    };
	  }

	  var nextState = state;
	  var nextError = undefined;
	  try {
	    nextState = reducer(state, action);
	  } catch (err) {
	    nextError = err.toString();
	    console.error(err.stack || err);
	  }

	  return {
	    state: nextState,
	    error: nextError
	  };
	}

	/**
	 * Runs the reducer on all actions to get a fresh computation log.
	 * It's probably a good idea to do this only if the code has changed,
	 * but until we have some tests we'll just do it every time an action fires.
	 */
	function recomputeStates(reducer, committedState, stagedActions, skippedActions) {
	  var computedStates = [];

	  for (var i = 0; i < stagedActions.length; i++) {
	    var action = stagedActions[i];

	    var previousEntry = computedStates[i - 1];
	    var previousState = previousEntry ? previousEntry.state : committedState;
	    var previousError = previousEntry ? previousEntry.error : undefined;

	    var shouldSkip = Boolean(skippedActions[i]);
	    var entry = shouldSkip ? previousEntry : computeNextEntry(reducer, action, previousState, previousError);

	    computedStates.push(entry);
	  }

	  return computedStates;
	}

	/**
	 * Lifts the app state reducer into a DevTools state reducer.
	 */
	function liftReducer(reducer, initialState) {
	  var initialLiftedState = {
	    committedState: initialState,
	    stagedActions: [INIT_ACTION],
	    skippedActions: {},
	    currentStateIndex: 0,
	    monitorState: {
	      isVisible: true
	    },
	    timestamps: [Date.now()]
	  };

	  /**
	   * Manages how the DevTools actions modify the DevTools state.
	   */
	  return function liftedReducer(liftedState, liftedAction) {
	    if (liftedState === undefined) liftedState = initialLiftedState;

	    var shouldRecomputeStates = true;
	    var committedState = liftedState.committedState;
	    var stagedActions = liftedState.stagedActions;
	    var skippedActions = liftedState.skippedActions;
	    var computedStates = liftedState.computedStates;
	    var currentStateIndex = liftedState.currentStateIndex;
	    var monitorState = liftedState.monitorState;
	    var timestamps = liftedState.timestamps;

	    switch (liftedAction.type) {
	      case ActionTypes.RESET:
	        committedState = initialState;
	        stagedActions = [INIT_ACTION];
	        skippedActions = {};
	        currentStateIndex = 0;
	        timestamps = [liftedAction.timestamp];
	        break;
	      case ActionTypes.COMMIT:
	        committedState = computedStates[currentStateIndex].state;
	        stagedActions = [INIT_ACTION];
	        skippedActions = {};
	        currentStateIndex = 0;
	        timestamps = [liftedAction.timestamp];
	        break;
	      case ActionTypes.ROLLBACK:
	        stagedActions = [INIT_ACTION];
	        skippedActions = {};
	        currentStateIndex = 0;
	        timestamps = [liftedAction.timestamp];
	        break;
	      case ActionTypes.TOGGLE_ACTION:
	        skippedActions = toggle(skippedActions, liftedAction.index);
	        break;
	      case ActionTypes.JUMP_TO_STATE:
	        currentStateIndex = liftedAction.index;
	        // Optimization: we know the history has not changed.
	        shouldRecomputeStates = false;
	        break;
	      case ActionTypes.SWEEP:
	        stagedActions = stagedActions.filter(function (_, i) {
	          return !skippedActions[i];
	        });
	        timestamps = timestamps.filter(function (_, i) {
	          return !skippedActions[i];
	        });
	        skippedActions = {};
	        currentStateIndex = Math.min(currentStateIndex, stagedActions.length - 1);
	        break;
	      case ActionTypes.PERFORM_ACTION:
	        if (currentStateIndex === stagedActions.length - 1) {
	          currentStateIndex++;
	        }

	        stagedActions = [].concat(stagedActions, [liftedAction.action]);
	        timestamps = [].concat(timestamps, [liftedAction.timestamp]);

	        // Optimization: we know that the past has not changed.
	        shouldRecomputeStates = false;
	        // Instead of recomputing the states, append the next one.
	        var previousEntry = computedStates[computedStates.length - 1];
	        var nextEntry = computeNextEntry(reducer, liftedAction.action, previousEntry.state, previousEntry.error);
	        computedStates = [].concat(computedStates, [nextEntry]);
	        break;
	      case ActionTypes.SET_MONITOR_STATE:
	        monitorState = liftedAction.monitorState;
	        break;
	      case ActionTypes.RECOMPUTE_STATES:
	        stagedActions = liftedAction.stagedActions;
	        timestamps = liftedAction.timestamps;
	        committedState = liftedAction.committedState;
	        currentStateIndex = stagedActions.length - 1;
	        skippedActions = {};
	        break;
	      default:
	        break;
	    }

	    if (shouldRecomputeStates) {
	      computedStates = recomputeStates(reducer, committedState, stagedActions, skippedActions);
	    }

	    return {
	      committedState: committedState,
	      stagedActions: stagedActions,
	      skippedActions: skippedActions,
	      computedStates: computedStates,
	      currentStateIndex: currentStateIndex,
	      monitorState: monitorState,
	      timestamps: timestamps
	    };
	  };
	}

	/**
	 * Lifts an app action to a DevTools action.
	 */
	function liftAction(action) {
	  var liftedAction = {
	    type: ActionTypes.PERFORM_ACTION,
	    action: action,
	    timestamp: Date.now()
	  };
	  return liftedAction;
	}

	/**
	 * Unlifts the DevTools state to the app state.
	 */
	function unliftState(liftedState) {
	  var computedStates = liftedState.computedStates;
	  var currentStateIndex = liftedState.currentStateIndex;
	  var state = computedStates[currentStateIndex].state;

	  return state;
	}

	/**
	 * Unlifts the DevTools store to act like the app's store.
	 */
	function unliftStore(liftedStore, reducer) {
	  var lastDefinedState = undefined;
	  return _extends({}, liftedStore, {
	    devToolsStore: liftedStore,
	    dispatch: function dispatch(action) {
	      liftedStore.dispatch(liftAction(action));
	      return action;
	    },
	    getState: function getState() {
	      var state = unliftState(liftedStore.getState());
	      if (state !== undefined) {
	        lastDefinedState = state;
	      }
	      return lastDefinedState;
	    },
	    getReducer: function getReducer() {
	      return reducer;
	    },
	    replaceReducer: function replaceReducer(nextReducer) {
	      liftedStore.replaceReducer(liftReducer(nextReducer));
	    }
	  });
	}

	/**
	 * Action creators to change the DevTools state.
	 */
	var ActionCreators = {
	  reset: function reset() {
	    return { type: ActionTypes.RESET, timestamp: Date.now() };
	  },
	  rollback: function rollback() {
	    return { type: ActionTypes.ROLLBACK, timestamp: Date.now() };
	  },
	  commit: function commit() {
	    return { type: ActionTypes.COMMIT, timestamp: Date.now() };
	  },
	  sweep: function sweep() {
	    return { type: ActionTypes.SWEEP };
	  },
	  toggleAction: function toggleAction(index) {
	    return { type: ActionTypes.TOGGLE_ACTION, index: index };
	  },
	  jumpToState: function jumpToState(index) {
	    return { type: ActionTypes.JUMP_TO_STATE, index: index };
	  },
	  setMonitorState: function setMonitorState(monitorState) {
	    return { type: ActionTypes.SET_MONITOR_STATE, monitorState: monitorState };
	  },
	  recomputeStates: function recomputeStates(committedState, stagedActions) {
	    return {
	      type: ActionTypes.RECOMPUTE_STATES,
	      committedState: committedState,
	      stagedActions: stagedActions
	    };
	  }
	};

	exports.ActionCreators = ActionCreators;
	/**
	 * Redux DevTools middleware.
	 */

	function devTools() {
	  return function (next) {
	    return function (reducer, initialState) {
	      var liftedReducer = liftReducer(reducer, initialState);
	      var liftedStore = next(liftedReducer);
	      var store = unliftStore(liftedStore, reducer);
	      return store;
	    };
	  };
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports['default'] = persistState;

	function persistState(sessionId) {
	  var stateDeserializer = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	  var actionDeserializer = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	  if (!sessionId) {
	    return function (next) {
	      return function () {
	        return next.apply(undefined, arguments);
	      };
	    };
	  }

	  function deserializeState(fullState) {
	    return _extends({}, fullState, {
	      committedState: stateDeserializer(fullState.committedState),
	      computedStates: fullState.computedStates.map(function (computedState) {
	        return _extends({}, computedState, {
	          state: stateDeserializer(computedState.state)
	        });
	      })
	    });
	  }

	  function deserializeActions(fullState) {
	    return _extends({}, fullState, {
	      stagedActions: fullState.stagedActions.map(function (action) {
	        return actionDeserializer(action);
	      })
	    });
	  }

	  function deserialize(fullState) {
	    if (!fullState) {
	      return fullState;
	    }
	    var deserializedState = fullState;
	    if (typeof stateDeserializer === 'function') {
	      deserializedState = deserializeState(deserializedState);
	    }
	    if (typeof actionDeserializer === 'function') {
	      deserializedState = deserializeActions(deserializedState);
	    }
	    return deserializedState;
	  }

	  return function (next) {
	    return function (reducer, initialState) {
	      var key = 'redux-dev-session-' + sessionId;

	      var finalInitialState = undefined;
	      try {
	        finalInitialState = deserialize(JSON.parse(localStorage.getItem(key))) || initialState;
	        next(reducer, initialState);
	      } catch (e) {
	        console.warn('Could not read debug session from localStorage:', e);
	        try {
	          localStorage.removeItem(key);
	        } finally {
	          finalInitialState = undefined;
	        }
	      }

	      var store = next(reducer, finalInitialState);

	      return _extends({}, store, {
	        dispatch: function dispatch(action) {
	          store.dispatch(action);

	          try {
	            localStorage.setItem(key, JSON.stringify(store.getState()));
	          } catch (e) {
	            console.warn('Could not write debug session to localStorage:', e);
	          }

	          return action;
	        }
	      });
	    };
	  };
	}

	module.exports = exports['default'];

/***/ }
/******/ ])
});
;