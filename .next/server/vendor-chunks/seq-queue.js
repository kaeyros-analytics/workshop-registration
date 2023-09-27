"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/seq-queue";
exports.ids = ["vendor-chunks/seq-queue"];
exports.modules = {

/***/ "(rsc)/./node_modules/seq-queue/index.js":
/*!*****************************************!*\
  !*** ./node_modules/seq-queue/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nmodule.exports = __webpack_require__(/*! ./lib/seq-queue */ \"(rsc)/./node_modules/seq-queue/lib/seq-queue.js\");\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvc2VxLXF1ZXVlL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7QUFBQUEsOEdBQXlCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXR0ZW5kYW5jZS8uL25vZGVfbW9kdWxlcy9zZXEtcXVldWUvaW5kZXguanM/Y2RjOSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3NlcS1xdWV1ZScpOyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwicmVxdWlyZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/seq-queue/index.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/seq-queue/lib/seq-queue.js":
/*!*************************************************!*\
  !*** ./node_modules/seq-queue/lib/seq-queue.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nvar EventEmitter = (__webpack_require__(/*! events */ \"events\").EventEmitter);\nvar util = __webpack_require__(/*! util */ \"util\");\nvar DEFAULT_TIMEOUT = 3000;\nvar INIT_ID = 0;\nvar EVENT_CLOSED = \"closed\";\nvar EVENT_DRAINED = \"drained\";\n/**\n * Instance a new queue\n *\n * @param {Number} timeout a global timeout for new queue\n * @class\n * @constructor\n */ var SeqQueue = function(timeout) {\n    EventEmitter.call(this);\n    if (timeout && timeout > 0) {\n        this.timeout = timeout;\n    } else {\n        this.timeout = DEFAULT_TIMEOUT;\n    }\n    this.status = SeqQueueManager.STATUS_IDLE;\n    this.curId = INIT_ID;\n    this.queue = [];\n};\nutil.inherits(SeqQueue, EventEmitter);\n/**\n * Add a task into queue.\n * \n * @param fn new request\n * @param ontimeout callback when task timeout\n * @param timeout timeout for current request. take the global timeout if this is invalid\n * @returns true or false\n */ SeqQueue.prototype.push = function(fn, ontimeout, timeout) {\n    if (this.status !== SeqQueueManager.STATUS_IDLE && this.status !== SeqQueueManager.STATUS_BUSY) {\n        //ignore invalid status\n        return false;\n    }\n    if (typeof fn !== \"function\") {\n        throw new Error(\"fn should be a function.\");\n    }\n    this.queue.push({\n        fn: fn,\n        ontimeout: ontimeout,\n        timeout: timeout\n    });\n    if (this.status === SeqQueueManager.STATUS_IDLE) {\n        this.status = SeqQueueManager.STATUS_BUSY;\n        var self = this;\n        process.nextTick(function() {\n            self._next(self.curId);\n        });\n    }\n    return true;\n};\n/**\n * Close queue\n * \n * @param {Boolean} force if true will close the queue immediately else will execute the rest task in queue\n */ SeqQueue.prototype.close = function(force) {\n    if (this.status !== SeqQueueManager.STATUS_IDLE && this.status !== SeqQueueManager.STATUS_BUSY) {\n        //ignore invalid status\n        return;\n    }\n    if (force) {\n        this.status = SeqQueueManager.STATUS_DRAINED;\n        if (this.timerId) {\n            clearTimeout(this.timerId);\n            this.timerId = undefined;\n        }\n        this.emit(EVENT_DRAINED);\n    } else {\n        this.status = SeqQueueManager.STATUS_CLOSED;\n        this.emit(EVENT_CLOSED);\n    }\n};\n/**\n * Invoke next task\n * \n * @param {String|Number} tid last executed task id\n * @api private\n */ SeqQueue.prototype._next = function(tid) {\n    if (tid !== this.curId || this.status !== SeqQueueManager.STATUS_BUSY && this.status !== SeqQueueManager.STATUS_CLOSED) {\n        //ignore invalid next call\n        return;\n    }\n    if (this.timerId) {\n        clearTimeout(this.timerId);\n        this.timerId = undefined;\n    }\n    var task = this.queue.shift();\n    if (!task) {\n        if (this.status === SeqQueueManager.STATUS_BUSY) {\n            this.status = SeqQueueManager.STATUS_IDLE;\n            this.curId++; //modify curId to invalidate timeout task\n        } else {\n            this.status = SeqQueueManager.STATUS_DRAINED;\n            this.emit(EVENT_DRAINED);\n        }\n        return;\n    }\n    var self = this;\n    task.id = ++this.curId;\n    var timeout = task.timeout > 0 ? task.timeout : this.timeout;\n    timeout = timeout > 0 ? timeout : DEFAULT_TIMEOUT;\n    this.timerId = setTimeout(function() {\n        process.nextTick(function() {\n            self._next(task.id);\n        });\n        self.emit(\"timeout\", task);\n        if (task.ontimeout) {\n            task.ontimeout();\n        }\n    }, timeout);\n    try {\n        task.fn({\n            done: function() {\n                var res = task.id === self.curId;\n                process.nextTick(function() {\n                    self._next(task.id);\n                });\n                return res;\n            }\n        });\n    } catch (err) {\n        self.emit(\"error\", err, task);\n        process.nextTick(function() {\n            self._next(task.id);\n        });\n    }\n};\n/**\n * Queue manager.\n * \n * @module\n */ var SeqQueueManager = module.exports;\n/**\n * Queue status: idle, welcome new tasks\n *\n * @const\n * @type {Number}\n * @memberOf SeqQueueManager\n */ SeqQueueManager.STATUS_IDLE = 0;\n/**\n * Queue status: busy, queue is working for some tasks now\n *\n * @const\n * @type {Number}\n * @memberOf SeqQueueManager\n */ SeqQueueManager.STATUS_BUSY = 1;\n/**\n * Queue status: closed, queue has closed and would not receive task any more \n * \t\t\t\t\tand is processing the remaining tasks now.\n *\n * @const\n * @type {Number}\n * @memberOf SeqQueueManager\n */ SeqQueueManager.STATUS_CLOSED = 2;\n/**\n * Queue status: drained, queue is ready to be destroy\n *\n * @const\n * @type {Number}\n * @memberOf SeqQueueManager\n */ SeqQueueManager.STATUS_DRAINED = 3;\n/**\n * Create Sequence queue\n * \n * @param  {Number} timeout a global timeout for the new queue instance\n * @return {Object}         new queue instance\n * @memberOf SeqQueueManager\n */ SeqQueueManager.createQueue = function(timeout) {\n    return new SeqQueue(timeout);\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvc2VxLXF1ZXVlL2xpYi9zZXEtcXVldWUuanMiLCJtYXBwaW5ncyI6IjtBQUFBLElBQUlBLGVBQWVDLDBEQUE4QjtBQUNqRCxJQUFJQyxPQUFPRCxtQkFBT0EsQ0FBQztBQUVuQixJQUFJRSxrQkFBa0I7QUFDdEIsSUFBSUMsVUFBVTtBQUNkLElBQUlDLGVBQWU7QUFDbkIsSUFBSUMsZ0JBQWdCO0FBRXBCOzs7Ozs7Q0FNQyxHQUNELElBQUlDLFdBQVcsU0FBU0MsT0FBTztJQUM5QlIsYUFBYVMsSUFBSSxDQUFDLElBQUk7SUFFdEIsSUFBR0QsV0FBV0EsVUFBVSxHQUFHO1FBQzFCLElBQUksQ0FBQ0EsT0FBTyxHQUFHQTtJQUNoQixPQUFPO1FBQ04sSUFBSSxDQUFDQSxPQUFPLEdBQUdMO0lBQ2hCO0lBRUEsSUFBSSxDQUFDTyxNQUFNLEdBQUdDLGdCQUFnQkMsV0FBVztJQUN6QyxJQUFJLENBQUNDLEtBQUssR0FBR1Q7SUFDYixJQUFJLENBQUNVLEtBQUssR0FBRyxFQUFFO0FBQ2hCO0FBQ0FaLEtBQUthLFFBQVEsQ0FBQ1IsVUFBVVA7QUFFeEI7Ozs7Ozs7Q0FPQyxHQUNETyxTQUFTUyxTQUFTLENBQUNDLElBQUksR0FBRyxTQUFTQyxFQUFFLEVBQUVDLFNBQVMsRUFBRVgsT0FBTztJQUN4RCxJQUFHLElBQUksQ0FBQ0UsTUFBTSxLQUFLQyxnQkFBZ0JDLFdBQVcsSUFBSSxJQUFJLENBQUNGLE1BQU0sS0FBS0MsZ0JBQWdCUyxXQUFXLEVBQUU7UUFDOUYsdUJBQXVCO1FBQ3ZCLE9BQU87SUFDUjtJQUVBLElBQUcsT0FBT0YsT0FBTyxZQUFZO1FBQzVCLE1BQU0sSUFBSUcsTUFBTTtJQUNqQjtJQUNBLElBQUksQ0FBQ1AsS0FBSyxDQUFDRyxJQUFJLENBQUM7UUFBQ0MsSUFBSUE7UUFBSUMsV0FBV0E7UUFBV1gsU0FBU0E7SUFBTztJQUUvRCxJQUFHLElBQUksQ0FBQ0UsTUFBTSxLQUFLQyxnQkFBZ0JDLFdBQVcsRUFBRTtR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RixLQUFLRyxLQUFLLENBQUNVLEtBQUtFLEVBQUU7UUFDbkI7SUFDRDtBQUNEO0FBRUE7Ozs7Q0FJQyxHQUNELElBQUkxQixrQkFBa0IrQixPQUFPQyxPQUFPO0FBRXBDOzs7Ozs7Q0FNQyxHQUNEaEMsZ0JBQWdCQyxXQUFXLEdBQUc7QUFFOUI7Ozs7OztDQU1DLEdBQ0RELGdCQUFnQlMsV0FBVyxHQUFHO0FBRTlCOzs7Ozs7O0NBT0MsR0FDRFQsZ0JBQWdCc0IsYUFBYSxHQUFHO0FBRWhDOzs7Ozs7Q0FNQyxHQUNEdEIsZ0JBQWdCaUIsY0FBYyxHQUFHO0FBRWpDOzs7Ozs7Q0FNQyxHQUNEakIsZ0JBQWdCaUMsV0FBVyxHQUFHLFNBQVNwQyxPQUFPO0lBQzdDLE9BQU8sSUFBSUQsU0FBU0M7QUFDckIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hdHRlbmRhbmNlLy4vbm9kZV9tb2R1bGVzL3NlcS1xdWV1ZS9saWIvc2VxLXF1ZXVlLmpzPzc0NDYiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG52YXIgREVGQVVMVF9USU1FT1VUID0gMzAwMDtcbnZhciBJTklUX0lEID0gMDtcbnZhciBFVkVOVF9DTE9TRUQgPSAnY2xvc2VkJztcbnZhciBFVkVOVF9EUkFJTkVEID0gJ2RyYWluZWQnO1xuXG4vKipcbiAqIEluc3RhbmNlIGEgbmV3IHF1ZXVlXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXQgYSBnbG9iYWwgdGltZW91dCBmb3IgbmV3IHF1ZXVlXG4gKiBAY2xhc3NcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgU2VxUXVldWUgPSBmdW5jdGlvbih0aW1lb3V0KSB7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXHRcblx0aWYodGltZW91dCAmJiB0aW1lb3V0ID4gMCkge1xuXHRcdHRoaXMudGltZW91dCA9IHRpbWVvdXQ7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy50aW1lb3V0ID0gREVGQVVMVF9USU1FT1VUO1xuXHR9XG5cdFxuXHR0aGlzLnN0YXR1cyA9IFNlcVF1ZXVlTWFuYWdlci5TVEFUVVNfSURMRTtcblx0dGhpcy5jdXJJZCA9IElOSVRfSUQ7XG5cdHRoaXMucXVldWUgPSBbXTtcbn07XG51dGlsLmluaGVyaXRzKFNlcVF1ZXVlLCBFdmVudEVtaXR0ZXIpO1xuXG4vKipcbiAqIEFkZCBhIHRhc2sgaW50byBxdWV1ZS5cbiAqIFxuICogQHBhcmFtIGZuIG5ldyByZXF1ZXN0XG4gKiBAcGFyYW0gb250aW1lb3V0IGNhbGxiYWNrIHdoZW4gdGFzayB0aW1lb3V0XG4gKiBAcGFyYW0gdGltZW91dCB0aW1lb3V0IGZvciBjdXJyZW50IHJlcXVlc3QuIHRha2UgdGhlIGdsb2JhbCB0aW1lb3V0IGlmIHRoaXMgaXMgaW52YWxpZFxuICogQHJldHVybnMgdHJ1ZSBvciBmYWxzZVxuICovXG5TZXFRdWV1ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKGZuLCBvbnRpbWVvdXQsIHRpbWVvdXQpIHtcblx0aWYodGhpcy5zdGF0dXMgIT09IFNlcVF1ZXVlTWFuYWdlci5TVEFUVVNfSURMRSAmJiB0aGlzLnN0YXR1cyAhPT0gU2VxUXVldWVNYW5hZ2VyLlNUQVRVU19CVVNZKSB7XG5cdFx0Ly9pZ25vcmUgaW52YWxpZCBzdGF0dXNcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0XG5cdGlmKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBFcnJvcignZm4gc2hvdWxkIGJlIGEgZnVuY3Rpb24uJyk7XG5cdH1cblx0dGhpcy5xdWV1ZS5wdXNoKHtmbjogZm4sIG9udGltZW91dDogb250aW1lb3V0LCB0aW1lb3V0OiB0aW1lb3V0fSk7XG5cblx0aWYodGhpcy5zdGF0dXMgPT09IFNlcVF1ZXVlTWFuYWdlci5TVEFUVVNfSURMRSkge1xuXHRcdHRoaXMuc3RhdHVzID0gU2VxUXVldWVNYW5hZ2VyLlNUQVRVU19CVVNZO1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5fbmV4dChzZWxmLmN1cklkKTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogQ2xvc2UgcXVldWVcbiAqIFxuICogQHBhcmFtIHtCb29sZWFufSBmb3JjZSBpZiB0cnVlIHdpbGwgY2xvc2UgdGhlIHF1ZXVlIGltbWVkaWF0ZWx5IGVsc2Ugd2lsbCBleGVjdXRlIHRoZSByZXN0IHRhc2sgaW4gcXVldWVcbiAqL1xuU2VxUXVldWUucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oZm9yY2UpIHtcblx0aWYodGhpcy5zdGF0dXMgIT09IFNlcVF1ZXVlTWFuYWdlci5TVEFUVVNfSURMRSAmJiB0aGlzLnN0YXR1cyAhPT0gU2VxUXVldWVNYW5hZ2VyLlNUQVRVU19CVVNZKSB7XG5cdFx0Ly9pZ25vcmUgaW52YWxpZCBzdGF0dXNcblx0XHRyZXR1cm47XG5cdH1cblx0XG5cdGlmKGZvcmNlKSB7XG5cdFx0dGhpcy5zdGF0dXMgPSBTZXFRdWV1ZU1hbmFnZXIuU1RBVFVTX0RSQUlORUQ7XG5cdFx0aWYodGhpcy50aW1lcklkKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy50aW1lcklkKTtcblx0XHRcdHRoaXMudGltZXJJZCA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0dGhpcy5lbWl0KEVWRU5UX0RSQUlORUQpO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RhdHVzID0gU2VxUXVldWVNYW5hZ2VyLlNUQVRVU19DTE9TRUQ7XG5cdFx0dGhpcy5lbWl0KEVWRU5UX0NMT1NFRCk7XG5cdH1cbn07XG5cbi8qKlxuICogSW52b2tlIG5leHQgdGFza1xuICogXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHRpZCBsYXN0IGV4ZWN1dGVkIHRhc2sgaWRcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5TZXFRdWV1ZS5wcm90b3R5cGUuX25leHQgPSBmdW5jdGlvbih0aWQpIHtcblx0aWYodGlkICE9PSB0aGlzLmN1cklkIHx8IHRoaXMuc3RhdHVzICE9PSBTZXFRdWV1ZU1hbmFnZXIuU1RBVFVTX0JVU1kgJiYgdGhpcy5zdGF0dXMgIT09IFNlcVF1ZXVlTWFuYWdlci5TVEFUVVNfQ0xPU0VEKSB7XG5cdFx0Ly9pZ25vcmUgaW52YWxpZCBuZXh0IGNhbGxcblx0XHRyZXR1cm47XG5cdH1cblx0XG5cdGlmKHRoaXMudGltZXJJZCkge1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLnRpbWVySWQpO1xuXHRcdHRoaXMudGltZXJJZCA9IHVuZGVmaW5lZDtcblx0fVxuXHRcblx0dmFyIHRhc2sgPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG5cdGlmKCF0YXNrKSB7XG5cdFx0aWYodGhpcy5zdGF0dXMgPT09IFNlcVF1ZXVlTWFuYWdlci5TVEFUVVNfQlVTWSkge1xuXHRcdFx0dGhpcy5zdGF0dXMgPSBTZXFRdWV1ZU1hbmFnZXIuU1RBVFVTX0lETEU7XG5cdFx0XHR0aGlzLmN1cklkKys7XHQvL21vZGlmeSBjdXJJZCB0byBpbnZhbGlkYXRlIHRpbWVvdXQgdGFza1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnN0YXR1cyA9IFNlcVF1ZXVlTWFuYWdlci5TVEFUVVNfRFJBSU5FRDtcblx0XHRcdHRoaXMuZW1pdChFVkVOVF9EUkFJTkVEKTtcblx0XHR9XG5cdFx0cmV0dXJuO1xuXHR9XG5cdFxuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHRhc2suaWQgPSArK3RoaXMuY3VySWQ7XG5cblx0dmFyIHRpbWVvdXQgPSB0YXNrLnRpbWVvdXQgPiAwID8gdGFzay50aW1lb3V0IDogdGhpcy50aW1lb3V0O1xuXHR0aW1lb3V0ID0gdGltZW91dCA+IDAgPyB0aW1lb3V0IDogREVGQVVMVF9USU1FT1VUO1xuXHR0aGlzLnRpbWVySWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLl9uZXh0KHRhc2suaWQpO1xuXHRcdH0pO1xuXHRcdHNlbGYuZW1pdCgndGltZW91dCcsIHRhc2spO1xuXHRcdGlmKHRhc2sub250aW1lb3V0KSB7XG5cdFx0XHR0YXNrLm9udGltZW91dCgpO1xuXHRcdH1cblx0fSwgdGltZW91dCk7XG5cblx0dHJ5IHtcblx0XHR0YXNrLmZuKHtcblx0XHRcdGRvbmU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcmVzID0gdGFzay5pZCA9PT0gc2VsZi5jdXJJZDtcblx0XHRcdFx0cHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzZWxmLl9uZXh0KHRhc2suaWQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIHJlcztcblx0XHRcdH1cblx0XHR9KTtcblx0fSBjYXRjaChlcnIpIHtcblx0XHRzZWxmLmVtaXQoJ2Vycm9yJywgZXJyLCB0YXNrKTtcblx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5fbmV4dCh0YXNrLmlkKTtcblx0XHR9KTtcblx0fVxufTtcblxuLyoqXG4gKiBRdWV1ZSBtYW5hZ2VyLlxuICogXG4gKiBAbW9kdWxlXG4gKi9cbnZhciBTZXFRdWV1ZU1hbmFnZXIgPSBtb2R1bGUuZXhwb3J0cztcblxuLyoqXG4gKiBRdWV1ZSBzdGF0dXM6IGlkbGUsIHdlbGNvbWUgbmV3IHRhc2tzXG4gKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7TnVtYmVyfVxuICogQG1lbWJlck9mIFNlcVF1ZXVlTWFuYWdlclxuICovXG5TZXFRdWV1ZU1hbmFnZXIuU1RBVFVTX0lETEUgPSAwO1xuXG4vKipcbiAqIFF1ZXVlIHN0YXR1czogYnVzeSwgcXVldWUgaXMgd29ya2luZyBmb3Igc29tZSB0YXNrcyBub3dcbiAqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKiBAbWVtYmVyT2YgU2VxUXVldWVNYW5hZ2VyXG4gKi9cblNlcVF1ZXVlTWFuYWdlci5TVEFUVVNfQlVTWSA9IDE7XG5cbi8qKlxuICogUXVldWUgc3RhdHVzOiBjbG9zZWQsIHF1ZXVlIGhhcyBjbG9zZWQgYW5kIHdvdWxkIG5vdCByZWNlaXZlIHRhc2sgYW55IG1vcmUgXG4gKiBcdFx0XHRcdFx0YW5kIGlzIHByb2Nlc3NpbmcgdGhlIHJlbWFpbmluZyB0YXNrcyBub3cuXG4gKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7TnVtYmVyfVxuICogQG1lbWJlck9mIFNlcVF1ZXVlTWFuYWdlclxuICovXG5TZXFRdWV1ZU1hbmFnZXIuU1RBVFVTX0NMT1NFRCA9IDI7IFxuXG4vKipcbiAqIFF1ZXVlIHN0YXR1czogZHJhaW5lZCwgcXVldWUgaXMgcmVhZHkgdG8gYmUgZGVzdHJveVxuICpcbiAqIEBjb25zdFxuICogQHR5cGUge051bWJlcn1cbiAqIEBtZW1iZXJPZiBTZXFRdWV1ZU1hbmFnZXJcbiAqL1xuU2VxUXVldWVNYW5hZ2VyLlNUQVRVU19EUkFJTkVEID0gMztcblxuLyoqXG4gKiBDcmVhdGUgU2VxdWVuY2UgcXVldWVcbiAqIFxuICogQHBhcmFtICB7TnVtYmVyfSB0aW1lb3V0IGEgZ2xvYmFsIHRpbWVvdXQgZm9yIHRoZSBuZXcgcXVldWUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICBuZXcgcXVldWUgaW5zdGFuY2VcbiAqIEBtZW1iZXJPZiBTZXFRdWV1ZU1hbmFnZXJcbiAqL1xuU2VxUXVldWVNYW5hZ2VyLmNyZWF0ZVF1ZXVlID0gZnVuY3Rpb24odGltZW91dCkge1xuXHRyZXR1cm4gbmV3IFNlcVF1ZXVlKHRpbWVvdXQpO1xufTsiXSwibmFtZXMiOlsiRXZlbnRFbWl0dGVyIiwicmVxdWlyZSIsInV0aWwiLCJERUZBVUxUX1RJTUVPVVQiLCJJTklUX0lEIiwiRVZFTlRfQ0xPU0VEIiwiRVZFTlRfRFJBSU5FRCIsIlNlcVF1ZXVlIiwidGltZW91dCIsImNhbGwiLCJzdGF0dXMiLCJTZXFRdWV1ZU1hbmFnZXIiLCJTVEFUVVNfSURMRSIsImN1cklkIiwicXVldWUiLCJpbmhlcml0cyIsInByb3RvdHlwZSIsInB1c2giLCJmbiIsIm9udGltZW91dCIsIlNUQVRVU19CVVNZIiwiRXJyb3IiLCJzZWxmIiwicHJvY2VzcyIsIm5leHRUaWNrIiwiX25leHQiLCJjbG9zZSIsImZvcmNlIiwiU1RBVFVTX0RSQUlORUQiLCJ0aW1lcklkIiwiY2xlYXJUaW1lb3V0IiwidW5kZWZpbmVkIiwiZW1pdCIsIlNUQVRVU19DTE9TRUQiLCJ0aWQiLCJ0YXNrIiwic2hpZnQiLCJpZCIsInNldFRpbWVvdXQiLCJkb25lIiwicmVzIiwiZXJyIiwibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZVF1ZXVlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/seq-queue/lib/seq-queue.js\n");

/***/ })

};
;